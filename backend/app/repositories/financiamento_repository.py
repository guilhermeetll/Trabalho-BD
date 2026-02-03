from app.database import get_db_connection
from app.schemas import AgenciaCreate, FinanciamentoCreate
import aiomysql

class FinanciamentoRepository:
    async def create_agencia(self, agencia: AgenciaCreate):
        conn = await get_db_connection()
        try:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO agencias (sigla, nome) VALUES (%s, %s)",
                    (agencia.sigla, agencia.nome)
                )
                await conn.commit()
                return agencia
        finally:
            conn.close()

    async def list_agencias(self):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT * FROM agencias")
                return await cursor.fetchall()
        finally:
            conn.close()

    async def create_financiamento(self, fin: FinanciamentoCreate):
        conn = await get_db_connection()
        try:
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO financiamentos 
                    (codigo_processo, agencia_sigla, tipo_fomento, valor_total, data_inicio, data_fim)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """
                values = (
                    fin.codigo_processo, fin.agencia_sigla, fin.tipo_fomento,
                    fin.valor_total, fin.data_inicio, fin.data_fim
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return fin
        finally:
            conn.close()
            
    async def list_financiamentos(self):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT * FROM financiamentos")
                return await cursor.fetchall()
        finally:
            conn.close()
