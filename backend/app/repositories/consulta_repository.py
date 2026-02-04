from app.database import get_db_connection
import aiomysql

class ConsultaRepository:
    async def get_projetos_by_coordenador(self, coordenador_cpf: str):
        """Retorna todos os projetos de um coordenador"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.codigo, p.titulo, p.descricao, p.situacao, 
                           p.data_inicio, p.data_termino,
                           part.nome as coordenador_nome
                    FROM projetos p
                    INNER JOIN participantes part ON p.coordenador_cpf = part.cpf
                    WHERE p.coordenador_cpf = %s
                    ORDER BY p.data_inicio DESC
                """
                await cursor.execute(sql, (coordenador_cpf,))
                return await cursor.fetchall()
    
    async def get_financiamentos_by_agencia(self, agencia_sigla: str):
        """Retorna financiamentos de uma agência com total"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Buscar financiamentos
                sql = """
                    SELECT f.codigo_processo, f.tipo_fomento, f.valor_total,
                           f.data_inicio, f.data_fim,
                           a.nome as agencia_nome, a.sigla as agencia_sigla
                    FROM financiamentos f
                    INNER JOIN agencias a ON f.agencia_sigla = a.sigla
                    WHERE f.agencia_sigla = %s
                    ORDER BY f.data_inicio DESC
                """
                await cursor.execute(sql, (agencia_sigla,))
                financiamentos = await cursor.fetchall()
                
                # Calcular total
                await cursor.execute(
                    "SELECT COALESCE(SUM(valor_total), 0) as total FROM financiamentos WHERE agencia_sigla = %s",
                    (agencia_sigla,)
                )
                total = (await cursor.fetchone())['total']
                
                return {
                    'agencia_sigla': agencia_sigla,
                    'agencia_nome': financiamentos[0]['agencia_nome'] if financiamentos else '',
                    'financiamentos': financiamentos,
                    'total': float(total)
                }
    
    async def get_producoes_by_ano(self, ano: int):
        """Retorna produções de um ano agrupadas por tipo"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.tipo, COUNT(*) as quantidade,
                           GROUP_CONCAT(p.titulo SEPARATOR '|||') as titulos
                    FROM producoes p
                    WHERE p.ano_publicacao = %s
                    GROUP BY p.tipo
                    ORDER BY quantidade DESC
                """
                await cursor.execute(sql, (ano,))
                grupos = await cursor.fetchall()
                
                # Buscar todas as produções do ano para detalhes
                sql_detalhes = """
                    SELECT p.id_registro, p.titulo, p.tipo, p.meio_divulgacao,
                           proj.titulo as projeto_titulo
                    FROM producoes p
                    LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                    WHERE p.ano_publicacao = %s
                    ORDER BY p.tipo, p.titulo
                """
                await cursor.execute(sql_detalhes, (ano,))
                producoes = await cursor.fetchall()
                
                return {
                    'ano': ano,
                    'grupos': grupos,
                    'producoes': producoes
                }
