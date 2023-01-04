import os
from dotenv import load_dotenv
import mysql.connector, mysql.connector.pooling
load_dotenv()

def db_connection_pool():
    # 連線(connection)到資料庫
    dbconfig = {
        "user" : "root",
        "password" : os.getenv('DBKEY'),
        "database" : "taipei_day_trip",
    }
    cnxpool = mysql.connector.pooling.MySQLConnectionPool (
        pool_name = "taipei-day-trip-pool",
        host = "localhost",
        pool_size = 5,
        **dbconfig
    )
    return cnxpool