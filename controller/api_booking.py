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
        print("backend")
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        cookie = request.cookies.get("Set-Cookie")
        memberInfo = decode_token(cookie)
        if(request.method == "GET"):
            print("GET")
            if(memberInfo == None):
                print("GET, 403")
                return jsonify(
                    {
                        "error" : True,
                        "message" : "未登入系統，拒絕存取"
                    }
                ), 403
            else:
                print(memberInfo)
                print("GET, 200")
                sql = "select booking.id, booking.attraction_id, booking.date, booking.time, booking.price, attraction.name, attraction.address, attraction.images from booking inner join attraction on booking.attraction_id = attraction.id where booking.user_id = %s"
                print("GET, 200-1")
                value = (memberInfo["id"], )
                print("GET, 200-2")
                mycursor.execute(sql, value)
                print("GET, 200-3")
                bookingData = mycursor.fetchall()
                bookingInfoResponseToFrontEnd = []
                for bookingInfo in bookingData:
                    attraction = {
                        "booking_id" : bookingInfo[0],
                        "name" : bookingInfo[5],
                        "address" : bookingInfo[6],
                        "image" : bookingInfo[7].split(",")[0],
                        "date" : bookingInfo[2],
                        "time" : bookingInfo[3],
                        "price" : bookingInfo[4],
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
            print("POST")
            # cookie = request.cookies.get("Set-Cookie")
            print(cookie)
            # get user_id from memberInfo after decodeJWT
            memberInfo = decode_token(cookie)
            print(memberInfo)
            bookingData = request.get_json()
            print(bookingData)
            checkAttractionIdFormat = regexDigitalNumber(bookingData["attractionId"])
            print(checkAttractionIdFormat)
            checkDateFormat = regexDate(bookingData["date"])
            print(checkDateFormat)
            checkTimeFormat = regexTime(bookingData["time"])
            print(checkTimeFormat)
            checkPriceFormat = regexDigitalNumber(bookingData["price"])
            print(checkPriceFormat)
            if(memberInfo == None):
                print("403")
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
                print("400")
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
                    print("200")
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
                print("500")
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
                print("Delete, 200")
                bookingWantToDelete = request.get_json()
                print(bookingWantToDelete["bookingWantToDelete"])
                sql = "delete from booking where id = %s"
                value = (bookingWantToDelete["bookingWantToDelete"], )
                mycursor.execute(sql, value)
                cnx.commit()
                return jsonify(
                    {
                        "ok" : True
                    }
                ), 200
    except:
        print("except")
        return jsonify(
            {
                "error" : True,
                "message" : "伺服器內部發生錯誤"
            }
        ), 500
    finally:
        print("finally")
        mycursor.close()
        cnx.close()