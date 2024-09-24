from flask import Flask, render_template, redirect, url_for, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, DateField
from wtforms.validators import DataRequired

application = Flask(__name__)
application.secret_key = 'bd43c35fa8c2dcdb974b323da1c40'
application.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
application.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(application)

class Requisition(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    purpose = db.Column(db.String(100), nullable=False)
    billing = db.Column(db.String(100), nullable=False)
    shipping = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f'<Requisition {self.id} - {self.purpose}>'

with application.app_context():
    db.create_all()

class RequisitionForm(FlaskForm):
    date = DateField('Date', format='%Y-%m-%d', validators=[DataRequired()])
    purpose = StringField('Purpose', validators=[DataRequired()])
    billing = StringField('Billing Information', validators=[DataRequired()])
    shipping = StringField('Shipping Information', validators=[DataRequired()])
    submit = SubmitField('Submit Requisition')

@application.route('/', methods=['POST', 'GET'])
def index():
    form = RequisitionForm()
    if request.method == 'POST':
        new_requisition = Requisition(
            date=request.form['date'],
            purpose=request.form['purpose'],
            billing=request.form['billing'],
            shipping=request.form['shipping'],
            status='Pending'  # Set a default status
        )
        try:
            db.session.add(new_requisition)
            db.session.commit()
            return redirect(url_for('index'))  # Redirect to the same page
        except Exception as e:
            return f"There was an issue submitting your request: {str(e)}"

    requisitions = Requisition.query.all()  # Get all requisitions to display
    return render_template('requisition.html', form=form, requisitions=requisitions)

def get_requisition_by_id(requisition_id):
    return Requisition.query.get(requisition_id)

@application.route('/get_requisition/<int:requisition_id>', methods=['GET'])
def get_requisition(requisition_id):
    requisition = get_requisition_by_id(requisition_id)  # Fetch from database
    if requisition:
        return jsonify({
            'id': requisition.id,
            'date': requisition.date,
            'purpose': requisition.purpose,
            'billing': requisition.billing,
            'shipping': requisition.shipping,
            'status': requisition.status
        })
    return jsonify({'error': 'Requisition not found'}), 404

def delete_requisition_by_id(requisition_id):
    requisition = get_requisition_by_id(requisition_id)
    if requisition:
        db.session.delete(requisition)
        db.session.commit()
        return True
    return False

@application.route('/delete_requisition/<int:requisition_id>', methods=['DELETE'])
def delete_requisition(requisition_id):
    success = delete_requisition_by_id(requisition_id)  # Delete from database
    return ('', 204) if success else ('', 404)

@application.route('/update_requisition/<int:requisition_id>', methods=['POST'])
def update_requisition(requisition_id):
    requisition = get_requisition_by_id(requisition_id)
    if requisition:
        requisition.date = request.form.get('date', requisition.date)
        requisition.purpose = request.form.get('purpose', requisition.purpose)
        requisition.billing = request.form.get('billing', requisition.billing)
        requisition.shipping = request.form.get('shipping', requisition.shipping)
        requisition.status = request.form.get('status', requisition.status)

        db.session.commit()  # Save the changes to the database
        return redirect(url_for('index'))  # Redirect after updating
    return ('Requisition not found', 404)


if __name__ == "__main__":
    application.run(debug=True)  # Starts the Flask application in debug mode