from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import psycopg2, requests, json
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

AUTH_SERVICE_URL = "https://evaluation-deployed-authentication.onrender.com"

# PostgreSQL configurations
app.config['POSTGRES_HOST'] = 'localhost'
app.config['POSTGRES_PORT'] = '5432'  # Specify the PostgreSQL port
app.config['POSTGRES_USER'] = 'postgres'  # Change to your PostgreSQL username
app.config['POSTGRES_PASSWORD'] = 'miko02262004'  # Change to your PostgreSQL password
app.config['POSTGRES_DB'] = 'LogisticsDB'  # Database name

def get_db_connection():
    return psycopg2.connect(
        host=app.config['POSTGRES_HOST'],
        database=app.config['POSTGRES_DB'],
        user=app.config['POSTGRES_USER'],
        password=app.config['POSTGRES_PASSWORD'],
        port=app.config['POSTGRES_PORT']
    )

@app.route('/')
def index():
    return redirect(url_for('login'))  # Redirect to the login page

@app.route('/login', methods=['GET', 'POST'])
@app.route('/login/<system>', methods=['GET', 'POST'])
def login(system='lms'):  # Default to 'lms' system
    auth_url = f'{AUTH_SERVICE_URL}?system={system}'  # Pass the system parameter to the auth service
    print(f"Redirecting to authentication service: {auth_url}")  # Debugging log
    return redirect(auth_url)

# Callback route for authentication microservice
@app.route('/auth/callback', methods=['GET'])
def auth_callback():
    token = request.args.get('token')  # Capture the token from the URL
    print(f"Token received in callback: {token}")
    
    if token:
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.post(f'{AUTH_SERVICE_URL}/verify-token', headers=headers)

        if response.status_code == 200:
            user_data = response.json()
            session['username'] = user_data['username']
            session['role'] = user_data['role']
            print(f"Session after storing user data: {session}")

            flash('Login successful!', 'success')

            # Normalize role comparison (to avoid case sensitivity issues)
            if session['role'].strip().lower() == 'lms admin':  # Case insensitive check
                return redirect(url_for('admin_dashboard'))
            else:
                flash('Role not authorized', 'danger')
                return redirect(url_for('login'))

        else:
            flash('Invalid token or session expired.', 'danger')
            return redirect(url_for('login'))

    flash('Authentication failed. No token received.', 'danger')
    return redirect(url_for('login'))

@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')

# Routes for each user type dashboard
@app.route('/signatory_dashboard')
def signatory_dashboard():
    return render_template('signatory_dashboard.html')

@app.route('/pharmacy_dashboard')
def pharmacy_dashboard():
    return render_template('pharmacy_dashboard.html')

# Utility function to close database resources
def close_db_connection(cursor, conn):
    cursor.close()
    conn.close()

# Route to fetch all suppliers
@app.route('/suppliers')
def admin_supplier():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM suppliers")
    suppliers = cur.fetchall()
    close_db_connection(cur, conn)
    return render_template('admin_supplier.html', suppliers=suppliers)


# Route to fetch a single supplier by ID
@app.route('/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT company_name, contact_person, email, phone, address FROM suppliers WHERE id = %s", (supplier_id,))
        supplier = cursor.fetchone()
        if supplier is None:
            return jsonify({'message': 'Supplier not found'}), 404
        return jsonify(supplier)
    finally:
        cursor.close()
        conn.close()

# Route to handle adding suppliers
@app.route('/add-supplier', methods=['POST'])
def add_supplier():
    data = request.json
    company_name = data.get('company_name')
    contact_person = data.get('contact_person')
    email = data.get('email')
    phone = data.get('phone')
    address = data.get('address')
    items = data.get('items', [])  # List of items supplied

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Insert supplier information
        cursor.execute(
            """
            INSERT INTO suppliers (company_name, contact_person, email, phone, address)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
            """,
            (company_name, contact_person, email, phone, address)
        )
        supplier_id = cursor.fetchone()[0]

        # Insert supplier items
        for item in items:
            cursor.execute(
                """
                INSERT INTO supplier_items (supplier_id, item_name)
                VALUES (%s, %s)
                """,
                (supplier_id, item)
            )

        conn.commit()
        return jsonify({'message': 'Supplier added successfully!', 'supplier_id': supplier_id}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/suppliers/<int:supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    updated_supplier = request.json

    # Update supplier information
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if supplier exists
        cursor.execute("SELECT * FROM suppliers WHERE id = %s", (supplier_id,))
        supplier = cursor.fetchone()

        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

        # Update supplier details
        cursor.execute("""
            UPDATE suppliers
            SET company_name = %s,
                contact_person = %s,
                email = %s,
                phone = %s,
                address = %s
            WHERE id = %s
        """, (
            updated_supplier['companyName'],
            updated_supplier['contactPerson'],
            updated_supplier['email'],
            updated_supplier['phone'],
            updated_supplier['address'],
            supplier_id
        ))

        # Update supplier items
        if 'items' in updated_supplier:
            # Delete existing items first
            cursor.execute("DELETE FROM supplier_items WHERE supplier_id = %s", (supplier_id,))
            # Add new items
            for item in updated_supplier['items']:
                cursor.execute("INSERT INTO supplier_items (supplier_id, item_name) VALUES (%s, %s)", (supplier_id, item))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Supplier and items updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM suppliers WHERE id = %s", (supplier_id,))
        supplier = cursor.fetchone()

        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

        cursor.execute("DELETE FROM suppliers WHERE id = %s", (supplier_id,))
        conn.commit()

        return jsonify({"message": "Supplier deleted successfully"}), 200

    finally:
        cursor.close()
        conn.close()


@app.route('/admin_requisition')
def admin_requisition():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM requisitions")
    requisitions = cur.fetchall()
    cur.close()
    conn.close()
    return render_template('admin_requisition.html', requisitions=requisitions)
    
@app.route('/requisition', methods=['GET', 'POST'])
def user_requisition():
    if request.method == 'POST':
        date = request.form['date']
        purpose = request.form['purpose']
        billing = request.form['billing']
        item_names = request.form.getlist('item-name[]')
        item_quantities = request.form.getlist('item-quantity[]')
        item_prices = request.form.getlist('item-price[]')
        
        conn = get_db_connection()
        cur = conn.cursor()

        # Insert the requisition details
        cur.execute(
            "INSERT INTO requisitions (date, purpose, billing) VALUES (%s, %s, %s) RETURNING id",
            (date, purpose, billing)
        )
        requisition_id = cur.fetchone()[0]  # Get the id of the newly inserted requisition

        # Initialize total sum for the requisition
        requisition_total = 0

        # Insert the items associated with the requisition and calculate total for the requisition
        for i in range(len(item_names)):
            quantity = int(item_quantities[i])  # Convert quantity to int
            price = float(item_prices[i])  # Convert price to float
            total = quantity * price  # Calculate total for this item

            # Add item total to requisition total
            requisition_total += total

            # Insert the item into requisition_items table
            cur.execute(
                "INSERT INTO requisition_items (requisition_id, name, quantity, price, total, status) VALUES (%s, %s, %s, %s, %s, %s)",
                (requisition_id, item_names[i], quantity, price, total, 'pending')  # Assuming status is 'pending'
            )

        # Update the total for the requisition in requisitions table
        cur.execute(
            "UPDATE requisitions SET total = %s WHERE id = %s",
            (requisition_total, requisition_id)
        )

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Requisition saved successfully!"}), 201

    # Handle the GET request for fetching all requisitions
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM requisitions")
    requisitions = cur.fetchall()
    cur.close()
    conn.close()
    return render_template('admin_requisition.html', requisitions=requisitions)



@app.route('/requisitions/<int:id>', methods=['GET'])
def get_requisition(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Fetch the requisition
        cur.execute("SELECT * FROM requisitions WHERE id = %s", (id,))
        requisition = cur.fetchone()
        
        if requisition:
            # Fetch associated items
            cur.execute("SELECT * FROM requisition_items WHERE requisition_id = %s", (id,))
            items = cur.fetchall()
            
            # Calculate total price from the items
            total = sum(item['quantity'] * item['price'] for item in items)
            
            # Include items and total in the response
            response = {
                "requisition": requisition,
                "items": items,
                "total": total  
            }
            return jsonify(response), 200
        else:
            return jsonify({"message": "Requisition not found"}), 404
    except Exception as e:
        return jsonify({"message": str(e)}), 500
    finally:
        # Ensure the connection is closed properly
        cur.close()
        conn.close()
        
@app.route('/save_total/<int:requisition_id>', methods=['POST'])
def save_total(requisition_id):
    conn = get_db_connection()
    cur = conn.cursor()

    # Calculate the total for the given requisition ID by summing the item totals
    cur.execute("SELECT requisition_items FROM requisition_items WHERE requisition_id = %s", (requisition_id,))
    requisition_total = cur.fetchone()[0] or 0  # Default to 0 if no items found

    # Insert or update the total in the 'total' table
    cur.execute("""
        INSERT INTO total (requisition_id, total_amount)
        VALUES (%s, %s)
        ON CONFLICT (requisition_id) DO UPDATE
        SET total_amount = EXCLUDED.total_amount
    """, (requisition_id, requisition_total))

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Total saved successfully!", "requisition_id": requisition_id, "total": requisition_total}), 200

@app.route('/inventory')
def inventory():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Query to fetch all medicines
    query = """
        SELECT * FROM medicines ORDER BY medicine_id
    """
    cursor.execute(query)
    medicines = cursor.fetchall()

    # Convert data into a list of dictionaries for easier access in the template
    medicines_list = [
        {
            'medicine_id': row[0],  # The first column is medicine_id
            'sku': row[1],           # The second column is sku
            'medicine_name': row[2], # The third column is medicine_name
            'quantity': row[3],      # The fourth column is quantity
            'status': row[4],        # The fifth column is status
            'unit_cost': row[5],     # The sixth column is unit_cost
            'unit_price': row[6],    # The seventh column is unit_price
            'category': row[7],      # The eighth column is category
            'base_unit': row[8],     # The ninth column is base_unit
            'created_at': row[9],    # The tenth column is created_at
            'updated_at': row[10],   # The eleventh column is updated_at
            'po_number': row[11],    # The twelfth column is po_number
            'description': row[12],  # The thirteenth column is description
            'expiration_date': row[13], # The fourteenth column is expiration_date
            'lot_position': row[14],    # The fifteenth column is lot_position
        }
        for row in medicines
    ]

    cursor.close()
    connection.close()

    # Pass medicines_list to the template
    return render_template('inventory.html', medicines=medicines_list)

@app.route('/pos')
def pos():
    connection = get_db_connection()
    cursor = connection.cursor()

    # Query to fetch all medicines for POS
    query = """
        SELECT * FROM medicines
    """
    cursor.execute(query)
    medicines = cursor.fetchall()

    # Convert data into a list of dictionaries for easier access in the template
    medicines_list = [
        {
            'medicine_id': row[0],
            'sku': row[1],          
            'medicine_name': row[2],
            'unit_price': row[6]
        }
        for row in medicines
    ]

    cursor.close()
    connection.close()

    # Pass medicines_list to the pos template
    return render_template('pos.html', medicines=medicines_list)

@app.route('/send_to_billing', methods=['POST'])
def send_to_billing():
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # Step 1: Save data to your database
        customer_data = {
            'full_name': request.form['full_name'],
            'contact_number': request.form.get('contact_number'),
            'date_of_birth': request.form.get('date_of_birth'),
            'senior_or_pwd': request.form.get('senior_or_pwd'),
        }
        medicines_data = json.loads(request.form['medicines_data'])  # Parse JSON string

        # Insert customer data into `pharmacy_customers`
        cur.execute("""
            INSERT INTO pharmacy_customers (full_name, contact_number, date_of_birth, senior_or_pwd)
            VALUES (%s, %s, %s, %s)
            RETURNING customer_id
        """, (customer_data['full_name'], customer_data['contact_number'],
              customer_data['date_of_birth'], customer_data['senior_or_pwd']))
        customer_id = cur.fetchone()[0]

        # Insert medicines into `medicine_bought` and update `medicines` stock
        purchase_data = {}  # To aggregate data

        for medicine in medicines_data:
            cur.execute("""
                INSERT INTO medicine_bought (customer_id, medicine_id, quantity)
                VALUES (%s, %s, %s)
                RETURNING purchase_id, medicine_id, quantity
            """, (customer_id, medicine['medicine_id'], medicine['quantity']))
            purchase_id, medicine_id, quantity = cur.fetchone()

            # Subtract the quantity from the `medicines` table
            cur.execute("""
                UPDATE medicines
                SET quantity = quantity - %s
                WHERE medicine_id = %s AND quantity >= %s
            """, (quantity, medicine_id, quantity))

            # Check if the update was successful (enough stock available)
            if cur.rowcount == 0:
                conn.rollback()
                flash(f"Not enough stock for medicine ID {medicine_id}.", "danger")
                return redirect(url_for('pos'))

            # Aggregating purchase data
            if (customer_id, purchase_id) not in purchase_data:
                purchase_data[(customer_id, purchase_id)] = {
                    'purchase_id': purchase_id,
                    'customer_id': customer_id,
                    'medicines': [],
                    'total_cost': 0
                }

            purchase_data[(customer_id, purchase_id)]['medicines'].append({
                'medicine_id': medicine_id,
                'quantity': quantity,
                'medicine_cost': medicine.get('medicine_cost', 0)
            })

        # Send aggregated data to FMS
        fms_api_url = "https://fms-w1la.onrender.com/api/lms_purchase"
        for data in purchase_data.values():
            for medicine in data['medicines']:
                purchase_payload = {
                    'purchase_id': data['purchase_id'],
                    'customer_id': data['customer_id'],
                    'medicine_id': medicine['medicine_id'],
                    'quantity': medicine['quantity'],
                    'medicine_cost': medicine['medicine_cost']
                }
                try:
                    response = requests.post(fms_api_url, json=purchase_payload)
                    if response.status_code != 200:
                        app.logger.error(f"Failed to send purchase {data['purchase_id']} to FMS: {response.text}")
                        flash("Error occurred while sending data to billing.", "danger")
                        return redirect(url_for('pos'))
                except Exception as e:
                    app.logger.error(f"Exception while sending purchase {data['purchase_id']} to FMS: {e}")
                    flash("Error occurred while sending data to billing.", "danger")
                    return redirect(url_for('pos'))

        # Commit to the local database
        conn.commit()

    except Exception as e:
        conn.rollback()
        app.logger.error(f"Error: {e}")
        flash("An error occurred during the transaction. Please try again.", "danger")
    
    finally:
        cur.close()
        conn.close()

    return redirect(url_for('pos'))

@app.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer_details(customer_id):
    try:
        conn_lms = get_db_connection()
        cur_lms = conn_lms.cursor()

        # Query to fetch customer details, including date_of_birth
        cur_lms.execute("""
            SELECT customer_id, full_name, contact_number, date_of_birth
            FROM pharmacy_customers
            WHERE customer_id = %s
        """, (customer_id,))

        customer = cur_lms.fetchone()

        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        customer_data = {
            "customer_id": customer[0],
            "full_name": customer[1],
            "contact_number": customer[2],
            "date_of_birth": customer[3] 
        }

        cur_lms.close()
        conn_lms.close()

        return jsonify(customer_data), 200

    except Exception as e:
        print(f"Error retrieving customer details: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/api/medicines/<int:medicine_id>', methods=['GET'])
def get_medicine_details(medicine_id):
    try:
        conn_lms = get_db_connection()
        cur_lms = conn_lms.cursor()

        # Query to fetch medicine details
        cur_lms.execute("SELECT medicine_id, medicine_name, unit_price FROM medicines WHERE medicine_id = %s", (medicine_id,))
        medicine = cur_lms.fetchone()

        if not medicine:
            return jsonify({"error": "Medicine not found"}), 404

        medicine_data = {
            "medicine_id": medicine[0],
            "medicine_name": medicine[1],
            "unit_price": float(medicine[2])  
        }

        cur_lms.close()
        conn_lms.close()

        return jsonify(medicine_data), 200

    except Exception as e:
        print(f"Error retrieving medicine details: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/signatory_view')
def signatory_view():
    return render_template('signatory_view.html')

@app.route('/purchase_order')
def purchase_order():
    return render_template('purchase_order.html')
    
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
