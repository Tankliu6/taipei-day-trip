from flask import *
import mysql.connector
# from mySQL import getPassword
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False
app.config["DEBUG"] = True
# 連線(connection)到資料庫
mydb = mysql.connector.connect (
    host = "localhost",
    user = "root",
    password = '12345678',
    database = "taipei_day_trip"
)
# 產生 /api/attractions 的 JSON 格式資料
def getResults_attractions(results, data):
    round = 0
    for list in results:
		# 讀取 tuple 資料裝進 dic
        data_item = {
			"id":list[0],
			"name":list[1],
			"category":list[2],
			"description":list[3],
			"address":list[4],
			"transport":list[5],
			"mrt":list[6],
			"lat":list[7],
			"lng":list[8],
			"images":list[9].split(",")
		}
        data.append(data_item)
		# 計算次數，因為從資料庫取13筆資料，但只想放入12筆資料
        round += 1
        if round == 12 :
            break

# Pages
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")

@app.route("/booking")
def booking():
	return render_template("booking.html")

@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.route("/api/attractions")
def attractions():
    try:
        # page 起始頁為 0，代表 nextPage 起始頁為 1
        page = int(request.args.get("page", None))
        keyword = request.args.get("keyword", None)
        nextPage = page+1
        mycursor = mydb.cursor()
		# attractions 的 list
        data = []
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
            getResults_attractions(results, data)
            # < 13 代表取回的 results 小於 13 個景點，沒下一頁
            if len(results) < 13 :
                nextPage = None
            return jsonify({
				"nextPage":nextPage,
				"data":data
			}), 200
        # 單 Page 查詢
        sql = "select * from attraction limit %s, %s "
        value = (page*12, 13)
        mycursor.execute(sql, value)
        # results 為一個由資料庫回傳的 tuple
        results = mycursor.fetchall()
        getResults_attractions(results, data)
        mycursor.close()
        # < 13 代表取回的 results 小於 13 個景點，沒下一頁
        if len(results) < 13 :
            nextPage = None
        return jsonify({
            "nextPage":nextPage,
            "data":data
		}), 200
    except:
        print("pass")
        return jsonify({
            "error":True,
            "message":"Internal Server Error 500"
        }), 500


@app.route("/api/attraction/<attractionId>")
def attractionld(attractionId):
	try:
		mycursor = mydb.cursor()
		sql = "select * from attraction where id = %s"
		value = (attractionId, )
		mycursor.execute(sql, value)
		results = mycursor.fetchone()
		mycursor.close()
		return jsonify({
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
		})
	except:
		# 注意 attractionId 是 string，isnumeric() 可以確認字串中是否全為數字
		if attractionId.isnumeric():
			return jsonify({
				"error" : True,
				"message" : "id number is not correct"
			}), 400
		return jsonify({
			"error" : True,
			"message" : f"invalid literal for int() with base 10: {attractionId} "
		}), 500

@app.route("/api/categories")
def categories():
    try:
        mycursor = mydb.cursor()
        sql = "select distinct (category) from attraction"
        mycursor.execute(sql, )
        results = mycursor.fetchall()
        categories_list = []
        mycursor.close()
        for CAT in results:
            categories_list.append(''.join(CAT))
        return jsonify({
            "data" : categories_list
        })
    except:
        return jsonify({
			"error" : True,
			"message" : "Internal Server Error"
		}), 500

if  __name__ == "__main__":
    app.run(host = "0.0.0.0", port=3000)