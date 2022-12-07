from flask import *
import mysql.connector, mysql.connector.pooling
import re, jwt, time
from view.token import make_token, decode_token

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
def signUp(): #要用regex阻擋奇怪帳號密碼~~~~
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
            mycursor.close()
            cnx.close()

@api_auth.route("/api/user/auth", methods = ["GET", "PUT", "DELETE"])
def auth(): #要用regex阻擋奇怪帳號密碼~~~~
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        if request.method == "GET":
            cookieFromRequest = request.cookies.get("Set-Cookie")
            print(cookieFromRequest)
            if(cookieFromRequest == None):
                return jsonify(
                    {
                        "data" : None
                    }
                )
            else:
                print("else")
                decode_token(cookieFromRequest)
                print("decode")
                print(decode_token(cookieFromRequest))
                decode_token_json = decode_token(cookieFromRequest).popitem()
                return jsonify(
                    {
                        "data" : decode_token_json
                    }
                ), 200
        if request.method == "PUT":
            requestPutData = request.get_json()
            sql = "select * from membership where email = %s and password = %s"
            value = (requestPutData["email"], requestPutData["password"], )
            mycursor.execute(sql, value)
            result = mycursor.fetchone()
            print(make_token(result))
            print(result)
            if result:
                resp = make_response(jsonify(
                    {
                        "ok" : True
                    }
                ))
                print(resp)
                resp.set_cookie("Set-Cookie", make_token(result), expires = time.time()+60*60*24*7)
                return resp, 200
            elif len(result) == 0:
                return jsonify(
                    {
                        "error" : True,
                        "message" : "登入失敗，帳號或密碼錯誤或其他原因"
                    }
                ), 400
            else:
                return jsonify(
                    {
                        "error" : True,
                        "message" : "伺服器內部錯誤"
                    }
                ), 500
        if request.method == "DELETE":
            res = make_response(
                jsonify(
                    {
                        "ok" : True
                    }
                )
            )
            res.set_cookie("Set-Cookie", "", expires=0)
            return res, 200
    except:
        print("except")
        return jsonify(
            {
                "error" : True,
                "message" : "伺服器內部錯誤或網路連線不穩定"
            }
        )
    finally:        
        mycursor.close()
        cnx.close()

