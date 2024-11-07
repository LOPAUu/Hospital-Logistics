from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify

app = Flask(__name__)

# Dummy Data
suppliers = [
    {'id': 1, 'company_name': 'Supplier A', 'contact_person': 'John Doe', 'email': 'johndoe@supplier.com', 'phone': '123-456-7890', 'address': '123 Supplier St'},
    {'id': 2, 'company_name': 'Supplier B', 'contact_person': 'Jane Doe', 'email': 'janedoe@supplier.com', 'phone': '987-654-3210', 'address': '456 Supplier Ave'}
]

requisitions = [
    {'id': 1, 'date': '2024-11-01', 'purpose': 'Medical Supplies', 'billing': '12345', 'total': 500},
    {'id': 2, 'date': '2024-11-02', 'purpose': 'Office Supplies', 'billing': '67890', 'total': 300}
]

@app.route('/')
def index():
    return redirect(url_for('admin_dashboard'))

# Login route
@app.route('/login_portal', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Dummy user validation (Replace with real authentication logic)
        if username == 'admin' and password == 'admin':
            session['username'] = username
            session['user_type'] = 'Admin'
            flash(f"Welcome, {username} (Admin)")
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
    return render_template('admin_supplier.html', suppliers=suppliers)

# Route to fetch a single supplier by ID
@app.route('/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    supplier = next((sup for sup in suppliers if sup['id'] == supplier_id), None)
    if supplier is None:
        return jsonify({'message': 'Supplier not found'}), 404
    return jsonify(supplier)

# Route to add a new supplier (no DB insertion, just returning mock data)
@app.route('/suppliers', methods=['POST'])
def add_supplier():
    new_supplier = request.json
    new_supplier['id'] = len(suppliers) + 1  # Mock adding supplier
    suppliers.append(new_supplier)
    return jsonify({"id": new_supplier['id']}), 201

# Route to update a supplier (no DB update, just modifying mock data)
@app.route('/suppliers/<int:id>', methods=['PUT'])
def update_supplier(id):
    supplier = next((sup for sup in suppliers if sup['id'] == id), None)
    if supplier is None:
        return jsonify({'message': 'Supplier not found'}), 404

    data = request.get_json()
    supplier.update(data)
    return jsonify({'message': 'Supplier updated successfully'}), 200

@app.route('/admin_requisition')
def admin_requisition():
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

        # Mock data handling
        requisition_id = len(requisitions) + 1
        requisition_total = sum(int(q) * float(p) for q, p in zip(item_quantities, item_prices))

        requisitions.append({
            'id': requisition_id,
            'date': date,
            'purpose': purpose,
            'billing': billing,
            'total': requisition_total
        })
        
        return jsonify({"message": "Requisition saved successfully!"}), 201

    return render_template('admin_requisition.html', requisitions=requisitions)

@app.route('/requisitions/<int:id>', methods=['GET'])
def get_requisition(id):
    requisition = next((req for req in requisitions if req['id'] == id), None)
    if requisition is None:
        return jsonify({"message": "Requisition not found"}), 404
    return jsonify(requisition)

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
