from flask import Flask, render_template

app = Flask(__name__)

@app.route('/requisition_portal')
def requisition():
    return render_template('newrequisition.html')

# Route for the main page
@app.route('/base_portal')
def base():
    # Pass values for username and role if needed
    username = "John Doe"
    role = "Administrator"
    return render_template('base.html', username=username, role=role)

if __name__ == '__main__':
    app.run(debug=True)
