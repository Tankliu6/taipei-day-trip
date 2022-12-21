from flask import *
import requests, os
import mysql.connector.pooling, datetime
import  time, controller.db_conncetion
from controller.token import make_token, decode_token
from dotenv import load_dotenv
load_dotenv()

# Blueprint
api_order = Blueprint("api_order", __name__)
# 資料庫連線
cnxpool = controller.db_conncetion.db_connection_pool()


def checkLoginStatus():
    cookieMemberInfo = request.cookies.get("Set-Cookie")
    memberInfo = decode_token(cookieMemberInfo)
    if memberInfo:
        return True
    else:
        return False

def processOrderStatus(orderNumber):
    try:
        cookieMemberInfo = request.cookies.get("Set-Cookie")
        memberInfo = decode_token(cookieMemberInfo)
        bookingData = request.get_json()
        cnx = cnxpool.get_connection()

        mycursor1 = cnx.cursor()
        sql = "INSERT INTO orders (user_id, booking_id, attraction_id, date, time, price, order_status, order_date, contact_name, contact_email, contact_phone) SELECT user_id, id, attraction_id, date, time, price, '1', NOW(), %s, %s, %s FROM booking WHERE user_id = %s;"
        value1 = (bookingData["contact"]["name"], bookingData["contact"]["email"], bookingData["contact"]["phone"], memberInfo["id"])
        mycursor1.execute(sql, value1)
        cnx.commit()
        mycursor1.close()

        sql2 = "DELETE FROM booking WHERE user_id = %s"
        value2 = (memberInfo["id"], )
        mycursor2 = cnx.cursor() 
        mycursor2.execute(sql2, value2)
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

        if order_status == 1:
            mycursor3 = cnx.cursor()
            sql3 = "INSERT INTO history (user_id, date, price, status, booking_id) values(%s, NOW(), %s, %s, %s)"
            value3 = (memberInfo["id"], bookingData["order"]["totalPrice"], order_status, json.dumps(bookingData["order"]["bookingId"]))
            mycursor3.execute(sql3, value3)
            cnx.commit()
            mycursor3.close()
            orderNumber["message"] = "付款失敗"
            return True

        mycursor3 = cnx.cursor()
        sql3 = "INSERT INTO history (user_id, date, price, status, booking_id) values(%s, NOW(), %s, %s, %s)"
        value3 = (memberInfo["id"], bookingData["order"]["totalPrice"], order_status, json.dumps(bookingData["order"]["bookingId"]))
        mycursor3.execute(sql3, value3)
        cnx.commit()
        mycursor3.close()

        mycursor4 = cnx.cursor(dictionary=True)
        sql4 = "SELECT id, booking_id, date FROM history WHERE user_id = 1 ORDER BY date DESC LIMIT 1"
        mycursor4.execute(sql4)
        orderHistory = mycursor4.fetchall()
        shoppingCartBookingId = tuple(int(x.strip('" ')) for x in orderHistory[0]["booking_id"].strip("[]''").split(','))

        for booking_id in shoppingCartBookingId:
            mycursor5 = cnx.cursor()
            sql5 = "update orders set order_status = %s where booking_id = %s"
            value5 = (order_status, booking_id)
            mycursor5.execute(sql5, value5)
            cnx.commit()
            mycursor5.close()

        order_date = orderHistory[0]["date"].strftime('%Y%m%d')
        orderNumber["orderNumber"] = f"{orderHistory[0]['id']}TPDT{order_date}"
        orderNumber["orderStatus"] = order_status
        orderNumber["message"] = "付款成功，旅途愉快"

        return True
    finally:
        mycursor2.close()
        cnx.close()


@api_order.route("/api/orders", methods = ["POST"])
def orders():
    try:
        orderNumber = {
            "orderNumber" : "",
            "orderStatus" : "",
            "message" : ""
        }
        if request.method == "POST":
            if checkLoginStatus() != True:
                return {
                    "error" : True,
                    "message" : "未登入系統，拒絕存取"
                }, 403
            elif processOrderStatus(orderNumber):
                return {
                    "data" : {
                        "orderNumber" : orderNumber["orderNumber"],
                        "payment" : {
                            "status" : orderNumber["orderStatus"],
                            "message" : orderNumber["message"]
                        }
                    }
                }, 200    
            else:
                return {
                    "error" : True,
                    "message" : "訂單付款失敗，輸入不正確或其他原因"
                }, 400
    except Exception as e:
        return {
            "error" : True,
            "message" : "伺服器內部錯誤"
        }, 500

@api_order.route("/api/order/<orderNumber>", methods = ["GET"])
def order(orderNumber):
    try:
        historyOrderId = orderNumber.split("TPDT")[0]
        cnx = cnxpool.get_connection()
        mycursor1 = cnx.cursor(dictionary = True)
        if request.method == "GET":
            if checkLoginStatus() == True:
                sql1 = "select * from history where id = %s"
                value1 = (historyOrderId, )
                mycursor1.execute(sql1, value1)
                orderInfoList = mycursor1.fetchone()
                trips = []
                for orderId in json.loads(orderInfoList["booking_id"]):
                    mycursor2 = cnx.cursor(dictionary = True)
                    sql2 = "select orders.*, attraction.name, attraction.address, attraction.images from orders inner join attraction on orders.attraction_id = attraction.id where orders.booking_id = %s"
                    value2 = (orderId,)
                    mycursor2.execute(sql2, value2)
                    trip = mycursor2.fetchone()
                    attraction = {
                        "attraction" : {
                            "id" : trip["attraction_id"],
                            "name" : trip["name"],
                            "address" : trip["address"],
                            "image" : trip["images"].split(",")[0]
                        },
                        "date" : trip["date"],
                        "time" : trip["time"]
                    }
                    contact = {
                        "contact_name" : trip["contact_name"],
                        "contact_email" : trip["contact_email"],
                        "contact_phone" : trip["contact_phone"]
                    }
                    trips.append(attraction)
                    trips.append(contact)                                   
                    mycursor2.close()
                return {
                    "data" : {
                        "number" : orderNumber,
                        "totalCost" : int(orderInfoList["price"]),
                        "trips" : trips,
                    },
                    "status" : orderInfoList["status"]
                }, 200
            elif checkLoginStatus() != True:
                return {
                    "error" : True,
                    "message" : "未登入系統，拒絕存取"
                }, 400
    except Exception as e:
        return {
            "error" : True,
            "message" :"伺服器內部錯誤"
        }, 500




