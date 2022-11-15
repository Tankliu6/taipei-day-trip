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
		nextPage = page+1
		mycursor = mydb.cursor()
		sql = "select * from attraction where id between %s and %s"
		if nextPage == 1:
			value = (nextPage, nextPage*12)
			mycursor.execute(sql, value)
			results = mycursor.fetchall()
			# attraction 的 list
			data = []
			for list in results:
				# 裝 data_item 的 dic
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
				print(list[9].split(","))
				data.append(data_item)
			return jsonify({
				"nextPage":nextPage,
				"data":data
			}), 200
		else:
			value = (page*12, nextPage*12)
			mycursor.execute(sql, value)
			results = mycursor.fetchall()
			# attraction 的 list
			data = []
			for list in results:
				# 裝 data_item 的 dic
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
					"images":list[9]
				}
				data.append(data_item)
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