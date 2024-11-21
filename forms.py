from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, FileField, SubmitField
from wtforms.validators import DataRequired, Email

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class ForgotPasswordForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    submit = SubmitField('Reset Password')

class TechSupportForm(FlaskForm):
    full_name = StringField('Full Name', validators=[DataRequired()])
    email_address = StringField('Email', validators=[DataRequired(), Email()])
    phone_number = StringField('Phone Number', validators=[DataRequired()])
    issue_description = TextAreaField('Issue Description', validators=[DataRequired()])
    file_upload = FileField('Upload File (optional)')
    submit = SubmitField('Submit')