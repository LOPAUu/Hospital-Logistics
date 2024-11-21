import app

class User:
    
    @staticmethod
    def post_login(form):
        api_key = False
        payload = {
            'username': form.username.data;
            'password': form.password.data;
        }
        url = 'http://user:5000/api/user/login'
        response = request.request("POST", url=url, data = payload)
        if response:
            d = response.json
            if d['api_key'] is not None:
                api_key = d['api_key']
        return api_key
    
    @staticmethod
    def does_exist(username):
        url = 'http://user:5000/api/user/' +username+ '/exist'
        response = request.request("GET", url=url)
        return response.status_code == 200
    
    @staticmethod
    def  get_user():
        headers = {
            'Authorization': 'Basic' + session['user_api_key']
        }

        response = request.request(method="GET", url='http://5000/api/user', headers=headers)
        user = response.json()
        return user