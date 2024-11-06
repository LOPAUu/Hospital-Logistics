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
    return redirect(url_for('login'))

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

@app.route('/suppliers')
def admin_supplier():
    # Logic to retrieve suppliers or any other data needed
    return render_template('admin_supplier.html')  # Make sure you have this template

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
        requisition_id = cur.fetchone()[0]

        # Insert the items associated with the requisition
        for i in range(len(item_names)):
            quantity = int(item_quantities[i])  # Convert quantity to int
            price = float(item_prices[i])  # Convert price to float
            total = quantity * price  # Calculate total

            cur.execute(
                "INSERT INTO requisition_items (requisition_id, name, quantity, price, total) VALUES (%s, %s, %s, %s, %s)",
                (requisition_id, item_names[i], quantity, price, total)
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
