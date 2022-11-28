import json, re
import mysql.connector # 連接 python 與 mysql 資料庫
from mySQL import getPassword # 隱藏 password的方法
# 連線(connection)到資料庫
mydb = mysql.connector.connect (
  host = "localhost",
  user = "root",
  password = getPassword(),
  database = "taipei_day_trip"
)
with open('taipei-attractions.json', mode='r', encoding="utf-8") as file:
  data = json.load(file)
results = data["result"]["results"]
id=-1 # 就會從位置0開始跑，不會多跑一筆
mycursor = mydb.cursor()
try:
  for data in results :
    url_files = []
    id +=1
    urls = data["file"] # 圖片檔的url字串(全黏在一起)
    # 利用正規表達式將url分開並放進串列(list)
    matchedResult = ["https:"+ url for url in re.split(r"https:", urls)] # 整理成拆開的 url list
    print(f"{id}: {matchedResult}")
    # 留下.jpg or .JPG 圖檔
    for url in matchedResult:
      if url.endswith(".jpg") == True or url.endswith(".JPG") == True: # 去除非圖片檔的 url
        url_files.append(url)
    # 將資料放入MySQL資料庫中
    sql = "insert into attraction (name, category, description, address, transport, mrt, lat, lng, images) values(%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    value = (results[id]["name"], results[id]["CAT"], results[id]["description"], results[id]["address"], results[id]["direction"], results[id]["MRT"], results[id]["latitude"], results[id]["longitude"], ','.join(url_files))
    mycursor.execute(sql, value)
    mydb.commit()
finally:
  mycursor.close()
