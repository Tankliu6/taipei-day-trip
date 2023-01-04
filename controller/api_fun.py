# 產生 /api/attractions 的 JSON 格式資料
def getAttractionsJsonData(results):
	# 每次會取13筆資料確認下一頁有無資料
	# 但只會放上12筆資料到畫面上
	if len(results) == 13:	
		results = results[:-1]
	data = []
	round = 0
	for list in results:
		# 讀取 tuple 資料裝進 dic
		data_item = {
			"id":list["id"],
			"name":list["name"],
			"category":list["category"],
			"description":list["description"],
			"address":list["address"],
			"transport":list["transport"],
			"mrt":list["mrt"],
			"lat":list["lat"],
			"lng":list["lng"],
			"images":list["images"].split(",")
		}
		data.append(data_item)
		# 計算次數，因為從資料庫取13筆資料，但只想放入12筆資料
		round += 1
		if round == len(results):
			return data