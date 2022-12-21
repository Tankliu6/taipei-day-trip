from flask import *
import mysql.connector.pooling
import  time, controller.db_conncetion
from controller.token import make_token, decode_token
from controller.utils import regexDigitalNumber, regexDate, regexTime

# Blueprint
api_booking = Blueprint("api_booking", __name__)
# 資料庫連線
cnxpool = controller.db_conncetion.db_connection_pool()

@api_booking.route("/api/booking", methods = ["GET", "POST", "DELETE"])
def booking():
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor(dictionary = True)
        cookie = request.cookies.get("Set-Cookie")
        memberInfo = decode_token(cookie)
        if(request.method == "GET"):
            if(memberInfo == None):
                return jsonify(
                    {
                        "error" : True,
                        "message" : "未登入系統，拒絕存取"
                    }
                ), 403
            else:
                sql = "select booking.id, booking.attraction_id, booking.date, booking.time, booking.price, attraction.name, attraction.address, attraction.images from booking inner join attraction on booking.attraction_id = attraction.id where booking.user_id = %s"
                value = (memberInfo["id"], )
                mycursor.execute(sql, value)
                bookingData = mycursor.fetchall()
                bookingInfoResponseToFrontEnd = []
                for bookingInfo in bookingData:
                    attraction = {
                        "booking_id" : bookingInfo["id"],
                        "name" : bookingInfo["name"],
                        "address" : bookingInfo["address"],
                        "image" : bookingInfo["images"].split(",")[0],
                        "date" : bookingInfo["date"],
                        "time" : bookingInfo["time"],
                        "price" : bookingInfo["price"],
                    }
                    bookingInfoResponseToFrontEnd.append(attraction)
                return jsonify(
                    {
                        "data" : {
                            "attractions" : bookingInfoResponseToFrontEnd
                        },
                        "name" : memberInfo["name"],
                        "email" : memberInfo["email"]
                    }
                    ), 200
        elif(request.method == "POST"):
            # cookie = request.cookies.get("Set-Cookie")
            # get user_id from memberInfo after decodeJWT
            memberInfo = decode_token(cookie)
            bookingData = request.get_json()
            checkAttractionIdFormat = regexDigitalNumber(bookingData["attractionId"])
            checkDateFormat = regexDate(bookingData["date"])
            checkTimeFormat = regexTime(bookingData["time"])
            checkPriceFormat = regexDigitalNumber(bookingData["price"])
            if(memberInfo == None):
                return jsonify(
                    {
                        "error" : True,
                        "message" : "未登入系統，拒絕存取"
                    }
                ), 403
            elif(
                checkAttractionIdFormat == False 
                or checkDateFormat == False 
                or checkTimeFormat == False 
                or checkPriceFormat == False
            ):
                return jsonify(
                    {
                        "error" : True,
                        "message" : "建立失敗，輸入不正確或其他原因"
                    }
                ), 400        
            elif(
                memberInfo 
                and checkAttractionIdFormat == True 
                and checkDateFormat == True 
                and checkTimeFormat == True 
                and checkPriceFormat == True
                ):
                    sql = "insert into booking (attraction_id, date, time, price, user_id) values(%s, %s, %s, %s, %s)"
                    value = (bookingData["attractionId"], bookingData["date"], bookingData["time"], bookingData["price"], memberInfo["id"])
                    mycursor.execute(sql, value)
                    cnx.commit()
                    return jsonify(
                        {
                            "ok" : True,
                            "message" : "建立成功"
                        }
                    ), 200
            else:
                return jsonify(
                    {
                        "error" : True,
                        "message" : "伺服器內部錯誤"
                    }
                ), 500
        elif(request.method == "DELETE"):
            if(memberInfo == None):
                return jsonify(
                    {
                        "error" : True,
                        "message" : "未登入系統，拒絕存取"
                    }
                ), 403
            elif(memberInfo):
                userId = memberInfo["id"]
                bookingWantToDelete = request.get_json()
                sql = "delete from booking where id = %s and user_id = %s"
                value = (bookingWantToDelete["bookingWantToDelete"], userId)
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
                "message" : "伺服器內部發生錯誤"
            }
        ), 500
    finally:
        mycursor.close()
        cnx.close()