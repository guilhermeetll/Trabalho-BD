from app.database import get_db_connection
from app.schemas import ProducaoCreate
import aiomysql

class ProducaoRepository:
    async def create(self, prod: ProducaoCreate):
        conn = await get_db_connection()
        try:
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO producoes 
                    (id_registro, projeto_codigo, titulo, tipo, ano_publicacao, meio_divulgacao)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                values = (
                    prod.id_registro, prod.projeto_codigo, prod.titulo,
                    prod.tipo, prod.ano_publicacao, prod.meio_divulgacao
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return prod
        finally:
            conn.close()

    async def list_all(self):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, proj.titulo as projeto_titulo 
                    FROM producoes p
                    LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                """
                await cursor.execute(sql)
                return await cursor.fetchall()
        finally:
            conn.close()
