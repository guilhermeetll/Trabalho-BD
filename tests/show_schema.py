
import pymysql

# Configuration
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "sigpesq"
DB_USER = "user"
DB_PASS = "password"

try:
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )
    cursor = conn.cursor()
    cursor.execute("SHOW CREATE TABLE participantes")
    result = cursor.fetchone()
    print("Create Table Statement:", result)
    conn.close()
except Exception as e:
    print(e)
