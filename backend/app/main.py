from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_pool, close_pool
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Iniciando conexão com banco de dados...")
    await init_pool()
    yield
    # Shutdown
    print("Fechando conexão com banco de dados...")
    await close_pool()

app = FastAPI(title="SIGPesq API", version="1.0.0", lifespan=lifespan)

# CORS code
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import participantes, projetos, financiamentos, producoes, auth
app.include_router(auth.router, tags=["Autenticação"])
app.include_router(participantes.router, prefix="/participantes", tags=["Participantes"])
app.include_router(projetos.router, prefix="/projetos", tags=["Projetos"])
app.include_router(financiamentos.router, prefix="/financiamentos", tags=["Financiamentos"])
app.include_router(producoes.router, prefix="/producoes", tags=["Produções"])

@app.get("/")
def read_root():
    return {"message": "SIGPesq API is running", "docs": "/docs"}

@app.get("/health")
async def health_check():
    from app.database import get_db_connection
    try:
        conn = await get_db_connection()
        async with conn.cursor() as cursor:
            await cursor.execute("SELECT 1")
            result = await cursor.fetchone()
        conn.close()
        return {"status": "ok", "db": "connected", "result": result}
    except Exception as e:
        return {"status": "error", "db": str(e)}
