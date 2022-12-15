from flask import *
import mysql.connector, mysql.connector.pooling
from controller.api import api_attraction
from controller.api_auth import api_auth
from controller.api_booking import api_booking

# from mySQL import getPassword
app=Flask(__name__)
app.config["JSON_AS_ASCII"] = False
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["JSON_SORT_KEYS"] = False
app.config["DEBUG"] = True


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


app.register_blueprint(api_attraction)
app.register_blueprint(api_auth)
app.register_blueprint(api_booking)


if  __name__ == "__main__":
    app.run(host = "0.0.0.0", port=3000)