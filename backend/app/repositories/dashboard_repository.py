from app.database import get_db_connection
import aiomysql

class DashboardRepository:
    async def get_stats(self):
        """Retorna estatísticas gerais do sistema"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Projetos ativos
                await cursor.execute(
                    "SELECT COUNT(*) as total FROM projetos WHERE situacao = 'EM_ANDAMENTO'"
                )
                projetos_ativos = (await cursor.fetchone())['total']
                
                # Total de participantes
                await cursor.execute("SELECT COUNT(*) as total FROM participantes")
                total_participantes = (await cursor.fetchone())['total']
                
                # Total de financiamentos
                await cursor.execute("SELECT COALESCE(SUM(valor_total), 0) as total FROM financiamentos")
                total_financiamentos = (await cursor.fetchone())['total']
                
                # Total de produções
                await cursor.execute("SELECT COUNT(*) as total FROM producoes")
                total_producoes = (await cursor.fetchone())['total']
                
                # Projetos concluídos
                await cursor.execute(
                    "SELECT COUNT(*) as total FROM projetos WHERE situacao = 'CONCLUIDO'"
                )
                projetos_concluidos = (await cursor.fetchone())['total']
                
                return {
                    'projetos_ativos': projetos_ativos,
                    'total_participantes': total_participantes,
                    'total_financiamentos': float(total_financiamentos),
                    'total_producoes': total_producoes,
                    'projetos_concluidos': projetos_concluidos
                }
    
    async def get_recent_projects(self, limit: int = 5):
        """Retorna os projetos mais recentes"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.codigo, p.titulo, p.situacao, p.data_inicio, p.data_termino,
                           part.nome as coordenador_nome
                    FROM projetos p
                    INNER JOIN participantes part ON p.coordenador_cpf = part.cpf
                    ORDER BY p.data_inicio DESC
                    LIMIT %s
                """
                await cursor.execute(sql, (limit,))
                return await cursor.fetchall()
    
    async def get_recent_producoes(self, limit: int = 5):
        """Retorna as produções mais recentes"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.id_registro, p.titulo, p.tipo, p.ano_publicacao, p.meio_divulgacao,
                           proj.titulo as projeto_titulo
                    FROM producoes p
                    LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                    ORDER BY p.ano_publicacao DESC, p.id_registro DESC
                    LIMIT %s
                """
                await cursor.execute(sql, (limit,))
                return await cursor.fetchall()
