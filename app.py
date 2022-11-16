from flask import *
import mysql.connector
from mySQL import getPassword
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
app.config["JSON_SORT_KEYS"] = False
# 連線(connection)到資料庫
mydb = mysql.connector.connect (
  host = "localhost",
  user = "root",
  password = getPassword(),
  database = "taipei_day_trip"
)
# 產生 page JSON 格式資料
def getResults_page(results, data):
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

# 產生 keyword JSON 格式資料
def getResults_keyword(results, data, page, nextPage, resultsLen):
	# 關鍵點，比對完會將"所有"資料抓進來，但每一頁都只有 12 筆，[page*12:nextPage*12] 隨頁數選取資料
	for list in results[page*12:nextPage*12]:
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
	# 回傳下一頁還有幾筆資料
	resultsLen = resultsLen - nextPage*12
	return resultsLen

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
		print(page, keyword)
		nextPage = page+1
		mycursor = mydb.cursor()
		# print(results)
		# attraction 的 list
		data = []
		# 排除 keyword 沒輸入或輸入空白值，有輸入才執行關鍵字 sql query
		if len(keyword.replace(' ','')) != 0 :
			print('keyword')
			sql = "select * from attraction where category = %s or name like concat ('%', %s, '%')"
			value = (keyword, keyword)
			mycursor.execute(sql, value)
			# results 為一個由資料庫回傳的 tuple
			results = mycursor.fetchall()
			# print(results)
			resultsLen = len(results)
			hello = getResults_keyword(results, data, page, nextPage, resultsLen)
			if hello < 0 :
				nextPage = None
			return jsonify({
				"nextPage":nextPage,
				"data":data
			}), 200
		else:
			sql = "select * from attraction limit %s, %s "
			value = (page*12, 13)
			mycursor.execute(sql, value)
			# results 為一個由資料庫回傳的 tuple
			results = mycursor.fetchall()
			getResults_page(results, data)
		if len(results) < 13 :
			nextPage = None
		return jsonify({
			"nextPage":nextPage,
			"data":data
		}), 200
	except Exception:
		print("我有經過這裡")
		return jsonify({
			"error":True,
			"message":"內部發生異常，刷新或聯絡工程人員"
		}), 500
	finally:
		mycursor.close()
		print("mycursor closed")

app.run(port=3000)