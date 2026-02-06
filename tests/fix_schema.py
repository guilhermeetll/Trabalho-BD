
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
    # Add ADMIN to the enum
    sql = "ALTER TABLE participantes MODIFY COLUMN tipo ENUM('ADMIN', 'DOCENTE', 'DISCENTE', 'TECNICO') NOT NULL"
    cursor.execute(sql)
    conn.commit()
    print("Schema updated: Added ADMIN to ENUM.")
    conn.close()
except Exception as e:
    print(f"Error updating schema: {e}")
