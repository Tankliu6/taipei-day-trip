import json, re, os
import mysql.connector # 連接 python 與 mysql 資料庫
from dotenv import load_dotenv
load_dotenv()
# 連線(connection)到資料庫
mydb = mysql.connector.connect (
  host = "localhost",
  user = "root",
  password = os.getenv("DBKEY"),
  database = "taipei_day_trip"
)
with open('data/taipei-attractions.json', mode='r', encoding="utf-8") as file:
  data = json.load(file)
results = data["result"]["results"]
print(results[0])
i=0
mycursor = mydb.cursor()
try:
  for data in results :
    url_files = []
    # print(i)
    urls = data["file"]
    matchedResult = ["https:"+i for i in re.split(r"https:", urls)] # 整理成拆開的 url list
    for url in matchedResult:
      if url.endswith(".jpg") == True or url.endswith(".JPG") == True: # 去除非圖片檔的 url
        url_files.append(url)
    # print(url_files)
    sql = "insert into attraction (name, category, description, address, transport, mrt, lat, lng, images) values(%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    value = (results[i]["name"], results[i]["CAT"], results[i]["description"], results[i]["address"], results[i]["direction"], results[i]["MRT"], results[i]["latitude"], results[i]["longitude"], ','.join(url_files))
    mycursor.execute(sql, value)
    mydb.commit()
    i +=1
finally:
  mycursor.close()
