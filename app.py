<<<<<<< HEAD
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  # Change to your MySQL username
app.config['MYSQL_PASSWORD'] = 'C4bb@g3$2024!'  # Change to your MySQL password
app.config['MYSQL_DB'] = 'syncore_db'  # Database name

mysql = MySQL(app)

@app.route('/login_portal', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Connect to the database and validate user
        cur = mysql.connection.cursor()
        cur.execute("SELECT password_hash, user_type FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()

        if user and check_password_hash(user[0], password):  # Compare stored hash with entered password
            session['username'] = username
            session['user_type'] = user[1]  # Save user type in session
            flash(f"Welcome, {username} ({user[1]})")
            # Redirect user based on user type
            if user[1] == 'CEO':
                return redirect(url_for('ceo_dashboard'))
            elif user[1] == 'Pharmacy':
                return redirect(url_for('pharmacy_dashboard'))
            elif user[1] == 'Admin':
                return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid login credentials')

    return render_template('login.html')

# Routes for each user type
@app.route('/ceo_dashboard')
def ceo_dashboard():
    return 'requisition.html'

@app.route('/pharmacy_dashboard')
def pharmacy_dashboard():
    return 'Pharmacy Dashboard'

@app.route('/admin_dashboard')
def admin_dashboard():
    return 'Admin Dashboard'
=======

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
>>>>>>> MaverickKo-patch-3

if __name__ == '__main__':
    app.run(debug=True)
