
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
    cursor.execute("SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_NAME = 'participantes' AND COLUMN_NAME = 'tipo'")
    result = cursor.fetchone()
    print("ENUM Definition:", result)
    conn.close()
except Exception as e:
    print(e)
