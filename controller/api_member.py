from flask import *
import mysql.connector, mysql.connector.pooling
import controller.db_conncetion
import os
from controller.token import decode_token, make_token
from controller.utils import regexName, regexPhone, regexPassword
from dotenv import load_dotenv
from controller.api_order import checkLoginStatus
api_member = Blueprint("api_member", __name__)
load_dotenv()
# 連線(connection)到資料庫
cnxpool = controller.db_conncetion.db_connection_pool()


@api_member.route("/api/member/update", methods = ["POST"])
def member():
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        if checkLoginStatus() != True:
            return {
                "error" : True,
                "message" : "請登入會員"
            }, 403
        else:
            updateMemberInfo = request.get_json()
            if updateFormatChecking(updateMemberInfo):
                cookie = request.cookies.get("Set-Cookie")
                memberInfo = decode_token(cookie)
                sql = "update membership set name = %s, phone = %s, password = %s where id = %s"
                value = (updateMemberInfo["name"], updateMemberInfo["phone"], updateMemberInfo["password"], memberInfo["id"])
                mycursor.execute(sql, value)
                cnx.commit()
                return {
                    "ok" : True,
                    "message" : "會員資料更成功"
                }, 200
            else:
                return {
                    "error" : True,
                    "message" : "請確認輸入格式"
                }, 403
    except Exception as e:
        print(e)
        return {
            "error" : True,
            "message" : "伺服器內部錯誤"
        }, 500
    finally:
        mycursor.close()
        cnx.close()

@api_member.route("/api/member/orders")
def memberorders():
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        if checkLoginStatus() != True:
            return {
                "error" : True,
                "message" : "請登入會員"
            }, 403
        else:
            cookie = request.cookies.get("Set-Cookie")
            memberInfo = decode_token(cookie)
            sql = "SELECT order_id FROM orders WHERE user_id = %s GROUP BY order_id"
            value = (memberInfo["id"], )
            mycursor.execute(sql, value)
            orders = mycursor.fetchall()
            print(orders)
            return {
                "ok" : True,
                "orders" : orders
            }, 200

    except Exception as e:
        print(e)
        return {
            "error" : True,
            "message" : "伺服器內部錯誤"
        }, 500
    finally:
        mycursor.close()
        cnx.close()


def updateFormatChecking(updateMemberInfo):
    nameValid = regexName(updateMemberInfo["name"])
    phoneValid = regexPhone(updateMemberInfo["phone"])
    passwordValid = regexPassword(updateMemberInfo["password"])
    print(nameValid, phoneValid, passwordValid)
    if nameValid != True or phoneValid != True or passwordValid != True:
        return False
    else:
        return True
