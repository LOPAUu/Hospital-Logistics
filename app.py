from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_mysqldb import MySQL
from MySQLdb.cursors import DictCursor

app = Flask(__name__)

app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

# MySQL configurationspython app.py
# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'paulo'  # Change to your MySQL username
app.config['MYSQL_PASSWORD'] = 'C4bb@g3$2024!'  # Change to your MySQL password
app.config['MYSQL_DB'] = 'syncore_db'  # Database name

mysql = MySQL(app)

@app.route('/')
def index():
    return redirect(url_for('login'))

# Login route
@app.route('/login_portal', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Connect to the database and validate user
        cur = mysql.connection.cursor(DictCursor)  # Use DictCursor for easier row access
        cur.execute("SELECT user_type, password FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()

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
            return redirect(url_for('login'))  # Redirect back to login on failure

    return render_template('login.html')  # Return login page for 'GET' request

# Routes for each user type dashboard
@app.route('/signatory_dashboard')
def signatory_dashboard():
    # Render the Signatory dashboard HTML template
    return render_template('signatory_dashboard.html')

@app.route('/pharmacy_dashboard')
def pharmacy_dashboard():
    # Render the Pharmacy dashboard HTML template
    return render_template('pharmacy_dashboard.html')

@app.route('/admin_dashboard')
def admin_dashboard():
    # Render the Admin dashboard HTML template
    return render_template('admin_dashboard.html')

@app.route('/admin_supplier')
def admin_supplier():
    cur = mysql.connection.cursor(DictCursor)
    cur.execute("SELECT * FROM supplier")
    suppliers = cur.fetchall()
    cur.close()
    return render_template('admin_supplier.html', suppliers=suppliers)

@app.route('/suppliers', methods=['GET', 'POST'])
def suppliers():
    if request.method == 'POST':
        # Get supplier data from the request
        data = request.get_json()
        company_name = data.get('companyName')
        contact_person = data.get('contactPerson')
        email = data.get('email')
        phone = data.get('phone')
        address = data.get('address')

        # Insert supplier into the database
        cur = mysql.connection.cursor()
        cur.execute(
            "INSERT INTO supplier (company_name, contact_person, email, phone, address) VALUES (%s, %s, %s, %s, %s)",
            (company_name, contact_person, email, phone, address)
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({'status': 'Supplier added'}), 201

    else:
        # Fetch all suppliers from the database
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT * FROM supplier")
        results = cur.fetchall()
        cur.close()
        return jsonify(results)

@app.route('/supplier/<int:supplier_id>', methods=['PUT', 'DELETE'])
def supplier(supplier_id):
    if request.method == 'PUT':
        data = request.get_json()
        company_name = data.get('companyName')
        contact_person = data.get('contactPerson')
        email = data.get('email')
        phone = data.get('phone')
        address = data.get('address')

        # Update the supplier data in the database
        cur = mysql.connection.cursor()
        cur.execute(
            "UPDATE supplier SET company_name=%s, contact_person=%s, email=%s, phone=%s, address=%s WHERE id=%s",
            (company_name, contact_person, email, phone, address, supplier_id)
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({'status': 'Supplier updated'})

    elif request.method == 'DELETE':
        # Delete the supplier from the database
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM supplier WHERE id=%s", (supplier_id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({'status': 'Supplier deleted'})

@app.route('/supplier/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    cur = mysql.connection.cursor(DictCursor)
    cur.execute("SELECT * FROM supplier WHERE id=%s", (supplier_id,))
    supplier = cur.fetchone()
    cur.close()
    return jsonify(supplier)

@app.route('/admin_requisition')
def admin_requisition():
    cur = mysql.connection.cursor()  # Use the MySQL connection
    cur.execute("SELECT * FROM requisitions;")  # Removed the database name from the query
    requisitions = cur.fetchall()
    cur.close()
    return render_template('admin_requisition.html', requisitions=requisitions)

@app.route('/save_requisition', methods=['POST'])
def save_requisition():
    data = request.get_json()
    print(data)  # For debugging

    try:
        cur = mysql.connection.cursor()

        # Insert requisition data
        insert_requisition_query = "INSERT INTO requisitions (date, purpose, billing) VALUES (%s, %s, %s)"
        cur.execute(insert_requisition_query, (data['date'], data['purpose'], data['billing']))
        requisition_id = cur.lastrowid  # Get the last inserted ID

        # Insert requisition items
        for item in data['items']:
            insert_item_query = "INSERT INTO requisition_items (requisition_id, item_name, quantity, price, total) VALUES (%s, %s, %s, %s, %s)"
            cur.execute(insert_item_query, (requisition_id, item['name'], item['quantity'], item['price'], item['total']))

        mysql.connection.commit()
    except Error as e:
        print("Error saving requisition:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()

    return jsonify({'success': True})

@app.route('/requisition_details/<int:requisition_id>', methods=['GET'])
def requisition_details(requisition_id):
    cur = mysql.connection.cursor()

    try:
        # Fetch the requisition details
        cur.execute("SELECT * FROM requisitions WHERE id = %s", (requisition_id,))
        requisition = cur.fetchone()

        if requisition is None:
            return jsonify({'error': 'Requisition not found'}), 404

        # Fetch the items associated with the requisition
        cur.execute("SELECT * FROM requisition_items WHERE requisition_id = %s", (requisition_id,))
        items = cur.fetchall()

        # Prepare the response object
        response = {
            'purpose': requisition['purpose'],
            'billing': requisition['billing'],
            'items': [{'name': item[1], 'quantity': item[2], 'price': item[3], 'total': item[4]} for item in items],  # Assuming index based on the fetchall order
            'signatory1': {'approved': requisition.get('signatory1_approved'), 'name': 'Maverick Ko'},
            'signatory2': {'approved': requisition.get('signatory2_approved'), 'name': 'Rene Letegio'},
            'signatory3': {'approved': requisition.get('signatory3_approved'), 'name': 'Paulo Sangreo'}
        }

        return jsonify(response)

    except Exception as e:
        print("Error fetching requisition details:", e)
        return jsonify({'error': str(e)}), 500

    finally:
        cur.close()
        
# Routes for other pages
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/signatory_view')
def signatory_view():
    return render_template('signatory_view.html')

@app.route('/logout')
def logout():
    # Clear the user's session (or any stored login data)
    session.clear()
    
    # Redirect to the login page or homepage
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
