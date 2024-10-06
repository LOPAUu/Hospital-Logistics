from flask import Flask, jsonify, request
from models import User

auth_service = Flask(__name__)

@auth_service.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.get_by_username(username)
    if user and user.check_password(password):
        return jsonify({"message": "Login successful", "user_type": user.user_type}), 200
    return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    auth_service.run(host='0.0.0.0', port=5001)
