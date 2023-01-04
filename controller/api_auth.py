from flask import *
import mysql.connector.pooling
import  time, controller.db_conncetion
from controller.token import make_token, decode_token
# Blueprint
api_auth = Blueprint("api_auth", __name__)
# 資料庫連線
cnxpool = controller.db_conncetion.db_connection_pool()

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
            mycursor.close()
            cnx.close()

@api_auth.route("/api/user/auth", methods = ["GET", "PUT", "DELETE"])
def auth():
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        if request.method == "GET":
            cookieFromRequest = request.cookies.get("Set-Cookie")
            if(cookieFromRequest == None):
                return jsonify(
                    {
                        "data" : None
                    }
                )
            else:
                decode_token_json = decode_token(cookieFromRequest)
                return jsonify(
                    {
                        "data" : decode_token_json
                    }
                ), 200
        if request.method == "PUT":
            requestPutData = request.get_json()
            sql = "select * from membership where email = %s and password = %s"
            value = (requestPutData["email"], requestPutData["password"])
            mycursor.execute(sql, value)
            result = mycursor.fetchone()
            if result == None:
                return jsonify(
                    {
                        "error" : True,
                        "message" : "登入失敗，帳號或密碼錯誤或其他原因"
                    }
                ), 400
            elif result != None:
                resp = make_response(jsonify(
                    {
                        "ok" : True
                    }
                ))
                resp.set_cookie("Set-Cookie", make_token(result), expires = time.time()+60*60*24*7)
                return resp, 200
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
        return jsonify(
            {
                "error" : True,
                "message" : "伺服器內部錯誤"
            }
        ), 500
    finally:        
        cnx.close()

