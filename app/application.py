from flask import Flask, render_template, request, redirect, url_for

application = Flask(__name__)

# Route for the login page
@application.route('/')
@application.route('/login')  # Added the /login route
def login():
    return render_template('login.html')

# Route to handle login POST request
@application.route('/login_post', methods=['POST'])
def login_post():
    # Get form data
    username = request.form.get('username')
    password = request.form.get('password')

    # Process login logic here (e.g., authenticate user)
    if username == "admin" and password == "password":  # Example authentication logic
        return redirect(url_for('index'))  # Redirect on successful login
    else:
        return "Login Failed", 401  # Return error if login fails

# Route for the forgot password page
@application.route('/forgot_pass', methods=['GET', 'POST'])
def forgot_pass():
    if request.method == 'POST':
        email = request.form.get('email')
        
        # Handle logic to send password reset instructions via email
        return render_template('forgot_pass.html', message="Reset link sent!")
    
    return render_template('forgot_pass.html')

# Route for the tech support page
@application.route('/tech_support', methods=['GET', 'POST'])
def tech_support():
    if request.method == 'POST':
        # Handle form submission data
        full_name = request.form.get('full-name')
        email_address = request.form.get('email-address')
        phone_number = request.form.get('phone-number')
        issue_description = request.form.get('issue-description')
        file_upload = request.files.get('file-upload')  # File upload

        # Process the form data (store in database, send email, etc.)
        return render_template('tech_support.html', message="Request submitted successfully!")
    
    return render_template('tech_support.html')

if __name__ == "__main__":
    application.run(debug=True)
