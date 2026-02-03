import aiomysql
import os
from fastapi import HTTPException

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "sigpesq")

pool = None

async def init_pool():
    global pool
    try:
        pool = await aiomysql.create_pool(
            host=DB_HOST,
            port=3306,
            user=DB_USER,
            password=DB_PASSWORD,
            db=DB_NAME,
            autocommit=True
        )
        print("Database pool initialized successfully.")
    except Exception as e:
        print(f"Error initializing database pool: {e}")
        pool = None

async def close_pool():
    global pool
    if pool:
        pool.close()
        await pool.wait_closed()
        print("Database pool closed.")

async def get_db_connection():
    global pool
    if not pool:
        # Tenta inicializar se não existir (ex: serverless/hot reload issues)
        await init_pool()
    
    if not pool:
        raise HTTPException(status_code=500, detail="Database connection not available")
    
    return await pool.acquire()
