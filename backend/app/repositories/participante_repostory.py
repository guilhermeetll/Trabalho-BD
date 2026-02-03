from app.database import get_db_connection
from app.schemas import ParticipanteCreate
import aiomysql

from app.security import get_password_hash

class ParticipanteRepository:
    async def create(self, participante: ParticipanteCreate):
        conn = await get_db_connection()
        try:
            hashed_password = get_password_hash(participante.senha) # Hashing
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO participantes (cpf, nome, email, tipo, senha_hash)
                    VALUES (%s, %s, %s, %s, %s)
                """
                values = (
                    participante.cpf,
                    participante.nome,
                    participante.email,
                    participante.tipo.value,
                    hashed_password 
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return participante
        finally:
            conn.close()

    async def get_by_email(self, email: str):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    "SELECT * FROM participantes WHERE email = %s",
                    (email,)
                )
                result = await cursor.fetchone()
                return result
        finally:
            conn.close()

    async def list_all(self):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT cpf, nome, email, tipo, criado_em FROM participantes")
                result = await cursor.fetchall()
                return result
        finally:
            conn.close()

    async def get_by_cpf(self, cpf: str):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    "SELECT cpf, nome, email, tipo, criado_em FROM participantes WHERE cpf = %s",
                    (cpf,)
                )
                result = await cursor.fetchone()
                return result
        finally:
            conn.close()
