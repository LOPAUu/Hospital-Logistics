from flask import Flask, render_template, request, redirect, url_for, flash
import requests

app = Flask(__name__)
app.secret_key = 'your_secret_key'

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Call authentication microservice
        auth_response = requests.post('http://localhost:5001/auth/login', json={
            'username': username,
            'password': password
        })

        if auth_response.status_code == 200:
            user_data = auth_response.json()
            flash(f"Welcome, {username} ({user_data['user_type']})")
            # Redirect user based on user type
            if user_data['user_type'] == 'CEO':
                return redirect(url_for('ceo_dashboard'))
            elif user_data['user_type'] == 'Pharmacy':
                return redirect(url_for('pharmacy_dashboard'))
            elif user_data['user_type'] == 'Admin':
                return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid login credentials')

    return render_template('login.html')

# Routes for each user type
@app.route('/ceo_dashboard')
def ceo_dashboard():
    return 'CEO Dashboard'

@app.route('/pharmacy_dashboard')
def pharmacy_dashboard():
    return 'Pharmacy Dashboard'

@app.route('/admin_dashboard')
def admin_dashboard():
    return 'Admin Dashboard'

if __name__ == '__main__':
    app.run(debug=True)