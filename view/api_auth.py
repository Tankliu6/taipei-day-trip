from flask import *
import mysql.connector, mysql.connector.pooling

api_auth = Blueprint("api_auth", __name__)

dbconfig = {
    "user" : "root",
    "password" : '12345678',
    "database" : "taipei_day_trip",
}

cnxpool = mysql.connector.pooling.MySQLConnectionPool (
    pool_name = "taipei-day-trip-pool",
    host = "localhost",
    pool_size = 5,
    **dbconfig
)

@api_auth.route("/api/user", methods = ["POST"])
def signUp():
        try:
            cnx = cnxpool.get_connection()
            mycursor = cnx.cursor()
            signUpData = request.get_json()
            sql = "select * from membership where email = %s "
            value = (signUpData["email"], )
            mycursor.execute(sql, value)
            result = mycursor.fetchone()
            if(result):
                return jsonify(
                    {
                       "error" : True,
                       "message" : "註冊失敗，重複的 Email 或其他原因"
                    }
                ), 400
            else:
                sql = "insert into membership(name, email, password) values (%s, %s, %s)"
                value = (signUpData["name"], signUpData["email"], signUpData["password"])
                mycursor.execute(sql, value)
                cnx.commit()
                return jsonify(
                    {
                        "ok" : True
                    }
                ), 200
        except:
            return jsonify(
                {
                    "error" : True,
                    "message" : "伺服器內部錯誤"
                }
            ), 500
        finally:
            cnx.close()

@api_auth.route("/api/user/auth")
def auth():
    try:
        000
    except:
        000