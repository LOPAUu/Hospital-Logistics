from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from MySQLdb.cursors import DictCursor

import os

app = Flask(__name__)
app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

load_dotenv()
# MySQL configurations
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')  # Default to 'localhost' if env var not set
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'paulo')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD', 'C4bb@g3$2024!')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'syncore_db')

mysql = MySQL(app)

# Login route
@app.route('/login_portal', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Connect to the database and validate user
        cur = mysql.connection.cursor(DictCursor)  # Use DictCursor for easier row access
        cur.execute("SELECT user_type, password_hash FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()

        # Check if user exists and password matches
        if user and user['password_hash'] == password:  # Compare stored password with entered password
            session['username'] = username
            session['user_type'] = user['user_type']  # Save user type in session
            flash(f"Welcome, {username} ({user['user_type']})")

            # Redirect user based on user type
            if user['user_type'] == 'CEO':
                return redirect(url_for('ceo_dashboard'))
            elif user['user_type'] == 'Pharmacy':
                return redirect(url_for('pharmacy_dashboard'))
            elif user['user_type'] == 'Admin':
                return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid login credentials')
            return redirect(url_for('login'))  # Redirect back to login on failure

    return render_template('login.html')  # Return login page for 'GET' request

# Routes for each user type dashboard
@app.route('/ceo_dashboard')
def ceo_dashboard():
    # Render the CEO dashboard HTML template
    return render_template('ceo_dashboard.html')

@app.route('/pharmacy_dashboard')
def pharmacy_dashboard():
    # Render the Pharmacy dashboard HTML template
    return render_template('pharmacy_dashboard.html')

@app.route('/admin_dashboard')
def admin_dashboard():
    # Render the Admin dashboard HTML template
    return render_template('admin_dashboard.html')

@app.route('/requisition_admin_portal')
def requisition_admin():
    return render_template('requisition_admin.html')
 
@app.route('/base_portal')
def base():
    # Pass values for username and role
    username = "John Doe"
    role = "Administrator"
    return render_template('base.html')

# Routes for other pages
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/supplier')
def supplier():
    return render_template('supplier.html')

@app.route('/logout')
def logout():
    # Handle the logout process
    return "Logout successful"

if __name__ == '__main__':
    app.run(debug=True)
