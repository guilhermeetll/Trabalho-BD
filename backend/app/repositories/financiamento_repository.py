from app.database import get_db_connection
from app.schemas import AgenciaCreate, FinanciamentoCreate
import aiomysql

class FinanciamentoRepository:
    async def create_agencia(self, agencia: AgenciaCreate):
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO agencias (sigla, nome) VALUES (%s, %s)",
                    (agencia.sigla, agencia.nome)
                )
                await conn.commit()
                return agencia

    async def list_agencias(self):
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT * FROM agencias ORDER BY nome")
                return await cursor.fetchall()

    async def create_financiamento(self, fin: FinanciamentoCreate):
        async with get_db_connection() as conn:
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
            
    async def list_financiamentos(self, search: str = None, tipo: str = None):
        """Lista todos os financiamentos com filtros opcionais"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT f.*, 
                           COUNT(DISTINCT pf.projeto_codigo) as num_projetos,
                           a.nome as agencia_nome
                    FROM financiamentos f
                    LEFT JOIN projetos_financiamentos pf ON f.codigo_processo = pf.financiamento_codigo
                    LEFT JOIN agencias a ON f.agencia_sigla = a.sigla
                    WHERE 1=1
                """
                params = []
                
                if search:
                    sql += " AND (a.nome LIKE %s OR f.codigo_processo LIKE %s)"
                    search_param = f"%{search}%"
                    params.extend([search_param, search_param])
                
                if tipo:
                    sql += " AND f.tipo_fomento = %s"
                    params.append(tipo)
                
                sql += " GROUP BY f.codigo_processo ORDER BY f.data_inicio DESC"
                
                await cursor.execute(sql, params)
                return await cursor.fetchall()
    
    async def get_by_codigo(self, codigo_processo: str):
        """Retorna um financiamento específico"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT f.*, 
                           COUNT(DISTINCT pf.projeto_codigo) as num_projetos,
                           a.nome as agencia_nome
                    FROM financiamentos f
                    LEFT JOIN projetos_financiamentos pf ON f.codigo_processo = pf.financiamento_codigo
                    LEFT JOIN agencias a ON f.agencia_sigla = a.sigla
                    WHERE f.codigo_processo = %s
                    GROUP BY f.codigo_processo
                """
                await cursor.execute(sql, (codigo_processo,))
                return await cursor.fetchone()
    
    async def update(self, codigo_processo: str, fin: FinanciamentoCreate):
        """Atualiza um financiamento"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                sql = """
                    UPDATE financiamentos 
                    SET agencia_sigla = %s, tipo_fomento = %s, valor_total = %s,
                        data_inicio = %s, data_fim = %s
                    WHERE codigo_processo = %s
                """
                values = (
                    fin.agencia_sigla, fin.tipo_fomento, fin.valor_total,
                    fin.data_inicio, fin.data_fim, codigo_processo
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return await self.get_by_codigo(codigo_processo)
    
    async def delete(self, codigo_processo: str):
        """Deleta um financiamento"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM financiamentos WHERE codigo_processo = %s", (codigo_processo,))
                await conn.commit()
                return True
    
    async def get_total(self):
        """Retorna a soma total de todos os financiamentos"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute("SELECT COALESCE(SUM(valor_total), 0) as total FROM financiamentos")
                result = await cursor.fetchone()
                return result['total'] if result else 0
    
    async def get_by_agencia(self, agencia_sigla: str):
        """Retorna financiamentos de uma agência específica"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT f.*, a.nome as agencia_nome
                    FROM financiamentos f
                    JOIN agencias a ON f.agencia_sigla = a.sigla
                    WHERE f.agencia_sigla = %s
                    ORDER BY f.data_inicio DESC
                """
                await cursor.execute(sql, (agencia_sigla,))
                return await cursor.fetchall()
    
    async def get_agencias_distinct(self):
        """Retorna lista de agências distintas"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT DISTINCT a.sigla, a.nome
                    FROM agencias a
                    INNER JOIN financiamentos f ON a.sigla = f.agencia_sigla
                    ORDER BY a.nome
                """
                await cursor.execute(sql)
                return await cursor.fetchall()
