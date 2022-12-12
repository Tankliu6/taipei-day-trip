# 產生 /api/attractions 的 JSON 格式資料
def getAttractionsJsonData(results):
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
		if round == len(results):
			return data