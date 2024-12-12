from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
app.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'

# PostgreSQL configurations
app.config['POSTGRES_HOST'] = 'dpg-csuks7l2ng1s73eefvhg-a.oregon-postgres.render.com'
app.config['POSTGRES_USER'] = 'lmsdb_user'
app.config['POSTGRES_PASSWORD'] = 'EMgG60UaoPj9vC79jodS3cxfo4dM8Kt3'
app.config['POSTGRES_DB'] = 'lmsdb_ul3w'
app.config['POSTGRES_PORT'] = '5432'

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
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM users WHERE username = %s", (username,))
                user = cur.fetchone()

        if user and bcrypt.check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['role'] = user['role']
            flash('Login successful!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Invalid username or password', 'danger')

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



@app.route('/api/users', methods=['GET'])
def get_users():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, username, email, role FROM users")
            users = cur.fetchall()

    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (username, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
                """,
                (data['username'], data['email'], hashed_password, data['role'])
            )
            conn.commit()

    return jsonify({"message": "User created"}), 201

@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.json

    with get_db_connection() as conn:
        with conn.cursor() as cur:
            if 'password' in data:
                hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
                cur.execute(
                    """
                    UPDATE users SET username = %s, email = %s, role = %s, password_hash = %s WHERE id = %s
                    """,
                    (data['username'], data['email'], data['role'], hashed_password, id)
                )
            else:
                cur.execute(
                    """
                    UPDATE users SET username = %s, email = %s, role = %s WHERE id = %s
                    """,
                    (data['username'], data['email'], data['role'], id)
                )
            conn.commit()

    return jsonify({"message": "User updated"})

@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM users WHERE id = %s", (id,))
            conn.commit()

    return jsonify({"message": "User deleted"})


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

