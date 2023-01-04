from flask import *
import requests, os
import mysql.connector.pooling, datetime
import  time, controller.db_conncetion
from controller.token import make_token, decode_token
from controller.utils import regexName, regexEmail, regexPhone
from dotenv import load_dotenv
load_dotenv()

# Blueprint
api_order = Blueprint("api_order", __name__)
# 資料庫連線
cnxpool = controller.db_conncetion.db_connection_pool()


@api_order.route("/api/orders", methods = ["POST"])
def orders():
    try:
        orderNumberData = {
            "orderNumber" : "",
            "orderStatus" : "",
            "message" : ""
        }
        if request.method == "POST":
            if checkLoginStatus() != True:
                return {
                    "data" : {
                        "orderNumber" : orderNumberData["orderNumber"],
                        "payment" : {
                            "status" : orderNumberData["orderStatus"],
                            "message" : "未登入系統，拒絕存取"
                        }
                    }
                }, 403    
            elif processOrderStatus(orderNumberData):
                return {
                    "data" : {
                        "orderNumber" : orderNumberData["orderNumber"],
                        "payment" : {
                            "status" : orderNumberData["orderStatus"],
                            "message" : orderNumberData["message"]
                        }
                    }
                }, 201    
            else:
                return {
                    "data" : {
                        "orderNumber" : orderNumberData["orderNumber"],
                        "payment" : {
                            "status" : orderNumberData["orderStatus"],
                            "message" : orderNumberData["message"]
                        }
                    }
                }, 200    
    except Exception as e:
        print(e)
        return {
            "data" : {
                "orderNumber" : orderNumberData["orderNumber"],
                "payment" : {
                    "status" : orderNumberData["orderStatus"],
                    "message" : "伺服器內部錯誤，請聯繫客服人員"
                }
            }
        }, 500    

@api_order.route("/api/order/<orderNumber>", methods = ["GET"])
def order(orderNumber):
    try:
        cnx = cnxpool.get_connection()
        mycursor1 = cnx.cursor(dictionary = True)
        if request.method == "GET":
            if checkLoginStatus() == True:
                sql1 = "select orders.*, attraction.name, attraction.address, attraction.images from orders inner join attraction on orders.attraction_id = attraction.id where order_id = %s"
                value1 = (orderNumber, )
                mycursor1.execute(sql1, value1)
                orderInfoList = mycursor1.fetchall()
                trips = []
                totalCost = {"totalCost" : 0}
                for orderId in orderInfoList:
                    attraction = {
                        "attraction" : {
                            "id" : orderId["attraction_id"],
                            "price" : orderId["price"],
                            "name" : orderId["name"],
                            "address" : orderId["address"],
                            "image" : orderId["images"].split(",")[0]
                        },
                        "date" : orderId["date"],
                        "time" : orderId["time"]
                    }
                    totalCost["totalCost"] += int(orderId["price"])
                    trips.append(attraction)                                 
                return {
                    "data" : {
                        "number" : orderNumber,
                        "totalCost" : totalCost["totalCost"],
                        "trips" : trips,
                    },
                    "contact" : {
                        "contact_name" : orderId["contact_name"],
                        "contact_email" : orderId["contact_email"],
                        "contact_phone" : orderId["contact_phone"]
                    },
                    "status" : orderInfoList[0]["order_status"]
                }, 200
            elif checkLoginStatus() != True:
                return {
                    "error" : True,
                    "message" : "未登入系統，拒絕存取"
                }, 400
    except Exception as e:
        print(e)
        return {
            "error" : True,
            "message" :"伺服器內部錯誤"
        }, 500
    finally:
        mycursor1.close()
        cnx.close()

def checkLoginStatus():
    cookieMemberInfo = request.cookies.get("Set-Cookie")
    memberInfo = decode_token(cookieMemberInfo)
    if memberInfo:
        return True
    else:
        return False

def checkContactFormat(bookingData):
    nameValid = regexName(bookingData["contact"]["name"])
    emailValid = regexEmail(bookingData["contact"]["email"])
    phoneValid = regexPhone(bookingData["contact"]["phone"])
    print(nameValid, emailValid, phoneValid)
    if nameValid and emailValid and phoneValid:
        return True
    else:
        return False

def processOrderStatus(orderNumberData):
    try:
        cookieMemberInfo = request.cookies.get("Set-Cookie")
        memberInfo = decode_token(cookieMemberInfo)
        bookingData = request.get_json()
        cnx = cnxpool.get_connection()

        if checkContactFormat(bookingData) == False:
            orderNumberData["message"] = "請確認聯絡資訊"
            return False

        orderDatetime = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        orderNumber = f"{memberInfo['id']}-{orderDatetime}"
        mycursor1 = cnx.cursor()
        sql = "INSERT INTO orders (user_id, order_id, attraction_id, date, time, price, order_status, order_date, contact_name, contact_email, contact_phone) SELECT user_id, %s, attraction_id, date, time, price, '1', NOW(), %s, %s, %s FROM booking WHERE user_id = %s;"
        value1 = (orderNumber, bookingData["contact"]["name"], bookingData["contact"]["email"], bookingData["contact"]["phone"], memberInfo["id"])
        mycursor1.execute(sql, value1)
        mycursor1.close()
        cnx.commit()

        tappayUrl = "https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime"
        partnerKey = os.getenv("PARTNERKEY")
        headers = {
            "Content-Type" : "application/json",
            "x-api-key" : partnerKey
        }

        payload = {
            "prime" : bookingData["prime"],
            "partner_key" : partnerKey,
            "merchant_id" : "dknyzzz777_CTBC",
            "details" : "TapPay Test",
            "amount" : bookingData["order"]["totalPrice"],
            "cardholder" : {
                "phone_number" : bookingData["contact"]["phone"],
                "name" : bookingData["contact"]["name"],
                "email" : bookingData["contact"]["email"]
            },
            "remember" : True
        }
        # Use asyncio to wait for the response from the payment service
        # responseFromTappay = await asyncio.wait_for(requests.post(tappayUrl, json=payload, headers=headers), timeout=90)       
        responseFromTappay = requests.post(tappayUrl, json = payload, headers = headers)
        order_status = responseFromTappay.json()["status"]
        if order_status != 0:
            mycursor3 = cnx.cursor()
            sql3 = "update orders set order_status = %s where order_id = %s"
            value3 = (order_status, orderNumber)
            mycursor3.execute(sql3, value3)
            cnx.commit()
            mycursor3.close()


            orderNumberData["orderNumber"] = orderNumber
            orderNumberData["orderStatus"] = order_status
            orderNumberData["message"] = "訂單付款失敗"
            return False

        elif order_status == 0:
            sql2 = "DELETE FROM booking WHERE user_id = %s"
            value2 = (memberInfo["id"], )
            mycursor2 = cnx.cursor() 
            mycursor2.execute(sql2, value2)
            cnx.commit()
            mycursor2.close()

            mycursor3 = cnx.cursor()
            sql3 = "update orders set order_status = %s where order_id = %s"
            value3 = (order_status, orderNumber)
            mycursor3.execute(sql3, value3)
            cnx.commit()
            mycursor3.close()


            orderNumberData["orderNumber"] = orderNumber
            orderNumberData["orderStatus"] = order_status
            orderNumberData["message"] = "付款成功，旅途愉快"
            return True
    except Exception as e:
        print(e)
        return False
    finally:
        cnx.close()



