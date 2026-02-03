from app.database import get_db_connection
from app.schemas import ProjetoCreate
import aiomysql

class ProjetoRepository:
    async def create(self, projeto: ProjetoCreate):
        conn = await get_db_connection()
        try:
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO projetos 
                    (codigo, titulo, descricao, data_inicio, data_termino, situacao, coordenador_cpf)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                values = (
                    projeto.codigo,
                    projeto.titulo,
                    projeto.descricao,
                    projeto.data_inicio,
                    projeto.data_termino,
                    projeto.situacao.value,
                    projeto.coordenador_cpf
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return projeto
        finally:
            conn.close()

    async def list_all(self):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Exemplo de Join para trazer o nome do coordenador
                sql = """
                    SELECT p.*, part.nome as coordenador_nome 
                    FROM projetos p
                    INNER JOIN participantes part ON p.coordenador_cpf = part.cpf
                """
                await cursor.execute(sql)
                result = await cursor.fetchall()
                return result
        finally:
            conn.close()
            
    async def get_by_codigo(self, codigo: str):
        conn = await get_db_connection()
        try:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, part.nome as coordenador_nome 
                    FROM projetos p
                    INNER JOIN participantes part ON p.coordenador_cpf = part.cpf
                    WHERE p.codigo = %s
                """
                await cursor.execute(sql, (codigo,))
                result = await cursor.fetchone()
                return result
        finally:
            conn.close()

    async def get_details(self, codigo: str):
        conn = await get_db_connection()
        try:
            projeto = await self.get_by_codigo(codigo)
            if not projeto:
                return None

            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Buscar participantes do projeto
                sql_part = """
                    SELECT p.nome, p.cpf, pp.funcao
                    FROM participantes p
                    JOIN participantes_projetos pp ON p.cpf = pp.participante_cpf
                    WHERE pp.projeto_codigo = %s
                """
                await cursor.execute(sql_part, (codigo,))
                projeto['participantes'] = await cursor.fetchall()
                
                # Buscar financiamentos
                sql_fin = """
                    SELECT f.codigo_processo, f.agencia_sigla, pf.valor_alocado
                    FROM financiamentos f
                    JOIN projetos_financiamentos pf ON f.codigo_processo = pf.financiamento_codigo
                    WHERE pf.projeto_codigo = %s
                """
                await cursor.execute(sql_fin, (codigo,))
                projeto['financiamentos'] = await cursor.fetchall()

            return projeto
        finally:
            conn.close()
