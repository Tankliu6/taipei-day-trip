from flask import *
import mysql.connector
from mySQL import getPassword
app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
# 連線(connection)到資料庫
mydb = mysql.connector.connect (
  host = "localhost",
  user = "root",
  password = getPassword(),
  database = "taipei_day_trip"
)

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
		# if nextPage == 1:
		sql = "select * from attraction limit %s, %s "
		value = (page*12, 13)
		mycursor.execute(sql, value)
		# results 為一個由資料庫回傳的 tuple
		results = mycursor.fetchall()
		print(len(results))
		# attraction 的 list
		data = []
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
			if round == 11 :
				break
		# 回傳前要確認 nextPage ， 如果從資料庫回傳的資料筆數小於13，代表下一頁沒有資料
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