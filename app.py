from flask import Flask, render_template

app = Flask(__name__)

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
