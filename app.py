from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import psycopg2, requests, json
from datetime import datetime
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

AUTH_SERVICE_URL = "https://evaluation-deployed-authentication.onrender.com"

# PostgreSQL configurations
app.config['POSTGRES_HOST'] = 'dpg-csuks7l2ng1s73eefvhg-a.oregon-postgres.render.com'
app.config['POSTGRES_USER'] = 'lmsdb_user'  # Change to your PostgreSQL username
app.config['POSTGRES_PASSWORD'] = 'EMgG60UaoPj9vC79jodS3cxfo4dM8Kt3'  # Change to your PostgreSQL password
app.config['POSTGRES_DB'] = 'lmsdb_ul3w'  # Database name
app.config['POSTGRES_PORT'] = '5432'  # Database name

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


@app.route('/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Fetch supplier details
        cursor.execute("""
            SELECT company_name, contact_person, email, phone, address 
            FROM suppliers 
            WHERE id = %s
        """, (supplier_id,))
        supplier = cursor.fetchone()

        if not supplier:
            return jsonify({'message': 'Supplier not found'}), 404

        # Fetch supplier items
        cursor.execute("""
            SELECT item_name 
            FROM supplier_items 
            WHERE supplier_id = %s
        """, (supplier_id,))
        items = [row['item_name'] for row in cursor.fetchall()]

        # Add items to the supplier data
        supplier['items'] = items

        return jsonify(supplier)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

@app.route('/supplier-items/<string:item_name>', methods=['DELETE'])
def delete_supplier_item(item_name):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Delete the item from the database
        cursor.execute("""
            DELETE FROM supplier_items 
            WHERE item_name = %s
            RETURNING id;
        """, (item_name,))
        
        # Check if the item was deleted
        deleted_item = cursor.fetchone()
        
        if not deleted_item:
            return jsonify({'message': 'Item not found'}), 404

        # Commit the transaction
        conn.commit()

        return jsonify({'message': 'Item deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

@app.route('/requisition', methods=['POST'])
def user_requisition():
    data = request.get_json()  # Get JSON data from the request
    date = data['date']
    purpose = data['purpose']
    billing = data['billing']
    items = data['items']  # Items come as a list of dictionaries

    conn = get_db_connection()
    cur = conn.cursor()

    # Insert requisition details into the requisitions table
    cur.execute(
        "INSERT INTO requisitions (date, purpose, billing) VALUES (%s, %s, %s) RETURNING id",
        (date, purpose, billing)
    )
    requisition_id = cur.fetchone()[0]

    # Insert items associated with the requisition into the requisition_items table
    for item in items:
        quantity = item['quantity']
        price = item['price']
        total = item['total']

        cur.execute(
            "INSERT INTO requisition_items (requisition_id, name, quantity, price, total) VALUES (%s, %s, %s, %s, %s)",
            (requisition_id, item['name'], quantity, price, total)
        )

    conn.commit()
    cur.close()
    conn.close()

    # Return a success response
    return jsonify({"message": "Requisition saved successfully!"}), 201


@app.route('/requisition', methods=['GET'])
def get_requisitions():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM requisitions")
    requisitions = cur.fetchall()
    cur.close()
    conn.close()

    return jsonify(requisitions)  # Return the requisition data as JSON

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

@app.route('/medicine_request', methods=['GET', 'POST'])
def medicine_request():
    try:
        # Establish database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        if request.method == 'GET':
            # Fetch all medicine requests
            cursor.execute("""
                SELECT medicine_request_id, request_status, medicine_id, quantity, 
                       request_date, approved_by, approval_date 
                FROM medicine_requests;
            """)
            medicine_requests = cursor.fetchall()

            # Format the data for template rendering
            formatted_requests = [
                {
                    "medicine_request_id": row[0],
                    "request_status": row[1],
                    "medicine_id": row[2],
                    "quantity": row[3],
                    "request_date": row[4],
                    "approved_by": row[5],
                    "approval_date": row[6]
                } 
                for row in medicine_requests
            ]

            return render_template('medicine_request.html', medicine_requests=formatted_requests)

        elif request.method == 'POST':
            # Add a new medicine request
            data = request.get_json()

            if not data or not all(key in data for key in ['medicine_id', 'quantity']):
                return jsonify({"error": "Missing required fields"}), 400

            request_status = data.get('request_status', 'Pending')
            medicine_id = data['medicine_id']
            quantity = data['quantity']
            request_date = data.get('request_date', None)
            approved_by = data.get('approved_by', None)
            approval_date = data.get('approval_date', None)

            cursor.execute("""
                INSERT INTO medicine_requests (request_status, medicine_id, quantity, request_date, approved_by, approval_date)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING medicine_request_id;
            """, (request_status, medicine_id, quantity, request_date, approved_by, approval_date))
            new_request_id = cursor.fetchone()[0]
            conn.commit()

            return jsonify({"message": "Request added successfully", "medicine_request_id": new_request_id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the connection
        if 'conn' in locals():
            cursor.close()
            conn.close()

            
@app.route('/medicines-info')
def medicines_info():
    connection = get_db_connection()  # Function to connect to the database
    cursor = connection.cursor()

    # Query to fetch the required columns
    query = """
        SELECT medicine_id, medicine_name, unit_price FROM medicines ORDER BY medicine_id
    """
    cursor.execute(query)
    medicines = cursor.fetchall()

    # Convert data into a list of dictionaries
    medicines_list = [
        {
            'medicine_id': row[0],  # The first column is medicine_id
            'medicine_name': row[1], # The second column is medicine_name
            'unit_price': row[2],    # The third column is unit_price
        }
        for row in medicines
    ]

    # Close the connection
    cursor.close()
    connection.close()

    # Return the data as JSON
    return jsonify(medicines_list)

@app.route('/api/care-plan-request/update', methods=['POST'])
def update_care_plan_request():
    try:
        # Establish database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Parse JSON data from the request
        data = request.get_json()
        if not data or 'medicine_request_id' not in data or 'action' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        medicine_request_id = data['medicine_request_id']
        action = data['action'].lower()  # Expecting 'accept' or 'reject'
        approved_by = data.get('approved_by', 'System')  # Optional: default to 'System'

        if action not in ['accept', 'reject']:
            return jsonify({"error": "Invalid action. Use 'accept' or 'reject'."}), 400

        # Update the request_status and approval_date
        request_status = 'Approved' if action == 'accept' else 'Rejected'
        approval_date = datetime.now()  # Automatically set the approval/rejection date

        cursor.execute("""
            UPDATE medicine_requests
            SET request_status = %s, approved_by = %s, approval_date = %s
            WHERE medicine_request_id = %s;
        """, (request_status, approved_by, approval_date, medicine_request_id))
        conn.commit()

        return jsonify({
            "message": f"Request {request_status.lower()} successfully.",
            "medicine_request_id": medicine_request_id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the connection
        if 'conn' in locals():
            cursor.close()
            conn.close()

@app.route('/medicine-requests/<int:request_id>/approve', methods=['PUT'])
def approve_medicine_request(request_id):
    try:
        # Establish database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Set the request status to "Approved" and update the approval date
        approved_by = 'Dr. Smith'  # Replace this with actual approver's name
        approval_date = datetime.now()  # Current datetime

        # Print statements for debugging
        print(f"Received approval request for medicine_request_id: {request_id}")
        
        cursor.execute("""
            UPDATE medicine_requests
            SET request_status = %s, approved_by = %s, approval_date = %s
            WHERE medicine_request_id = %s;
        """, ('Approved', approved_by, approval_date, request_id))

        # Check if any rows were updated
        if cursor.rowcount == 0:
            print(f"No request found with ID {request_id}")
            return jsonify({"error": "Request not found"}), 404
        
        # Commit the changes to the database
        conn.commit()
        print(f"Request {request_id} successfully approved.")

        return jsonify({"message": "Request approved successfully", "medicine_request_id": request_id}), 200

    except Exception as e:
        # Print error message for debugging
        print(f"Error during approval: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the connection
        if 'conn' in locals():
            cursor.close()
            conn.close()

@app.route('/api/care-plan-request/update', methods=['POST'])
def update_medicine_request():
    try:
        # Parse JSON data from the request
        data = request.get_json()
        if not data or 'medicine_request_id' not in data or 'action' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        medicine_request_id = data['medicine_request_id']
        action = data['action'].lower()

        # Validate the action
        if action not in ['accept', 'reject']:
            return jsonify({'error': 'Invalid action. Use "accept" or "reject".'}), 400

        # Determine the new status
        new_status = 'Approved' if action == 'accept' else 'Rejected'

        # Assuming you have a model called MedicineRequest
        medicine_request = MedicineRequest.query.get(medicine_request_id)
        if medicine_request:
            # Update the status in the database
            medicine_request.status = new_status
            db.session.commit()
            return jsonify({'message': f'Request {new_status} successfully'}), 200
        else:
            return jsonify({'error': 'Request not found'}), 404
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
