from flask import *
import mysql.connector, mysql.connector.pooling
from view.api import api_blueprint

# from mySQL import getPassword
app=Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False
app.config["DEBUG"] = True


# 連線(connection)到資料庫
# dbconfig = {
#     "user" : "root",
#     "password" : '12345678',
#     "database" : "taipei_day_trip",
# }
# cnxpool = mysql.connector.pooling.MySQLConnectionPool (
#     pool_name = "taipei-day-trip-pool",
#     host = "localhost",
#     pool_size = 5,
#     **dbconfig
# )

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

app.register_blueprint(api_blueprint)
         
if  __name__ == "__main__":
    app.run(host = "0.0.0.0", port=3000)