from flask import *
import mysql.connector, mysql.connector.pooling
import view.api_fun, view.db_conncetion
import os
from dotenv import load_dotenv
api_attraction = Blueprint("api_attraction", __name__)
load_dotenv()
# 連線(connection)到資料庫
cnxpool = view.db_conncetion.db_connection_pool()

@api_attraction.route("/api/attractions")
def attractions():
    try:
        cnx = cnxpool.get_connection()
        # page 起始頁為 0，代表 nextPage 起始頁為 1
        page = int(request.args.get("page", None))
        keyword = request.args.get("keyword", None)
        nextPage = page+1
        mycursor = cnx.cursor()
		# 進入 keyword 查詢
        if keyword != None:
            print(keyword)
            sql = "select * from attraction where category = %s or name like concat ('%', %s, '%') limit %s, %s"
            value = (keyword, keyword, page*12, 13)
            mycursor.execute(sql, value)
            # results 為裝滿景點資料(tuple) 的 list
            results = mycursor.fetchall()
            mycursor.close()
            # 將景點資料取出放進 data(list)
            data = view.api_fun.getAttractionsJsonData(results)
            # < 13 代表取回的 results 小於 13 個景點，沒下一頁
            if len(results) < 13 :
                nextPage = None
            return jsonify(
                {
				"nextPage":nextPage,
				"data":data
                }
            ), 200
        # 單 Page 查詢
        sql = "select * from attraction limit %s, %s "
        value = (page*12, 13)
        mycursor.execute(sql, value)
        # results 為一個由資料庫回傳的 tuple
        results = mycursor.fetchall()
        data = view.api_fun.getAttractionsJsonData(results)
        mycursor.close()
        # < 13 代表取回的 results 小於 13 個景點，沒下一頁
        if len(results) < 13 :
            nextPage = None
        return jsonify(
            {
            "nextPage":nextPage,
            "data":data
            }
        ), 200
    except:
        print("pass")
        return jsonify(
            {
            "error":True,
            "message":"Internal Server Error 500"
            }
        ), 500
    finally:
        cnx.close()

@api_attraction.route("/api/attraction/<attractionId>")
def attractionld(attractionId):
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        sql = "select * from attraction where id = %s"
        value = (attractionId, )
        mycursor.execute(sql, value)
        results = mycursor.fetchone()
        mycursor.close()
        return jsonify(
            {
            "data" : {
			"id" : results[0],
			"name" : results[1],
			"category" : results[2],
			"description" : results[3],
			"address" : results[4],
			"transport" : results[5],
			"mrt" : results[6],
			"lat" : results[7],
			"lng" : results[8],
			"images" : results[9].split(',')
                }
            }
        )
    except:
		# 注意 attractionId 是 string，isnumeric() 可以確認字串中是否全為數字
        if attractionId.isnumeric():
            return jsonify(
                {
				"error" : True,
				"message" : "id number is not correct"
                }
            ), 400
        return jsonify(
            {
			"error" : True,
			"message" : f"invalid literal for int() with base 10: {attractionId} "
            }
        ), 500
    finally:
        cnx.close()

@api_attraction.route("/api/categories")
def categories():
    try:
        cnx = cnxpool.get_connection()
        mycursor = cnx.cursor()
        sql = "select distinct (category) from attraction"
        mycursor.execute(sql, )
        results = mycursor.fetchall()
        categories_list = []
        mycursor.close()
        for CAT in results:
            categories_list.append(''.join(CAT))
        return jsonify(
            {
            "data" : categories_list
            }
        )
    except:
        return jsonify(
            {
			"error" : True,
			"message" : "Internal Server Error"
            }
        ), 500
    finally:
         cnx.close()