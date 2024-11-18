from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor


app = Flask(__name__)
app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

# PostgreSQL configurations
app.config['POSTGRES_HOST'] = 'localhost'
app.config['POSTGRES_PORT'] = '5432'  # Specify the PostgreSQL port
app.config['POSTGRES_USER'] = 'postgres'  # Change to your PostgreSQL username
app.config['POSTGRES_PASSWORD'] = 'logistics'  # Change to your PostgreSQL password
app.config['POSTGRES_DB'] = 'LogisticsDB'  # Database name

def get_db_connection():
    return psycopg2.connect(
        host=app.config['POSTGRES_HOST'],
        port=app.config['POSTGRES_PORT'],  # Include the port in the connection
        database=app.config['POSTGRES_DB'],
        user=app.config['POSTGRES_USER'],
        password=app.config['POSTGRES_PASSWORD']
    )

@app.route('/')
def index():
    return redirect(url_for('admin_dashboard'))

# Login route
@app.route('/login_portal', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Connect to the database and validate user
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT user_type, password FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        # Check if user exists and password matches
        if user and user['password'] == password:  # Compare stored password with entered password
            session['username'] = username
            session['user_type'] = user['user_type']  # Save user type in session
            flash(f"Welcome, {username} ({user['user_type']})")

            # Redirect user based on user type
            if user['user_type'] == 'Signatory':
                return redirect(url_for('signatory_dashboard'))
            elif user['user_type'] == 'Pharmacy':
                return redirect(url_for('pharmacy_dashboard'))
            elif user['user_type'] == 'Admin':
                return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid login credentials')
            return redirect(url_for('login'))

    return render_template('login.html')

# Routes for each user type dashboard
@app.route('/signatory_dashboard')
def signatory_dashboard():
    return render_template('signatory_dashboard.html')

@app.route('/pharmacy_dashboard')
def pharmacy_dashboard():
    return render_template('pharmacy_dashboard.html')

@app.route('/admin_dashboard')
def admin_dashboard():
    return render_template('admin_dashboard.html')

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
    return render_template('inventory.html')

@app.route('/signatory_view')
def signatory_view():
    return render_template('signatory_view.html')

@app.route('/purchase_order')
def purchase_order():
    return render_template('purchase_order.html')
    
if __name__ == "__main__":
    app.run(debug=True)  # Set debug=True for detailed error output
# Update the supplier endpoints similarly to use PostgreSQL