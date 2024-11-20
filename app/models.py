from flask_mysqldb import MySQL
from werkzeug.security import generate_password_hash, check_password_hash

mysql = MySQL()

class User:
    def __init__(self, id, username, password_hash, user_type):
        self.id = id
        self.username = username
        self.password_hash = password_hash
        self.user_type = user_type

    @staticmethod
    def get_by_username(username):
        cur = mysql.connection.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        result = cur.fetchone()
        cur.close()

        if result:
            return User(*result)
        return None

    @staticmethod
    def create_user(username, password, user_type):
        password_hash = generate_password_hash(password)
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO users (username, password_hash, user_type) VALUES (%s, %s, %s)",
                    (username, password_hash, user_type))
        mysql.connection.commit()
        cur.close()

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
