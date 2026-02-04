from app.database import get_db_connection
from app.schemas import ProjetoCreate
import aiomysql

class ProjetoRepository:
    async def create(self, projeto: ProjetoCreate):
        async with get_db_connection() as conn:
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

    async def list_all(self, search: str = None, situacao: str = None):
        """Lista todos os projetos com filtros opcionais"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, part.nome as coordenador_nome 
                    FROM projetos p
                    INNER JOIN participantes part ON p.coordenador_cpf = part.cpf
                    WHERE 1=1
                """
                params = []
                
                if search:
                    sql += " AND (p.titulo LIKE %s OR p.codigo LIKE %s OR part.nome LIKE %s)"
                    search_param = f"%{search}%"
                    params.extend([search_param, search_param, search_param])
                
                if situacao:
                    sql += " AND p.situacao = %s"
                    params.append(situacao)
                
                sql += " ORDER BY p.data_inicio DESC"
                
                await cursor.execute(sql, params)
                result = await cursor.fetchall()
                return result
            
    async def get_by_codigo(self, codigo: str):
        async with get_db_connection() as conn:
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

    async def get_details(self, codigo: str):
        projeto = await self.get_by_codigo(codigo)
        if not projeto:
            return None

        # Usar nova conexao para detalhes (necessario pois get_by_codigo ja fechou a sua)
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # Buscar participantes do projeto
                sql_part = """
                    SELECT p.nome, p.cpf, p.email, p.tipo, pp.funcao, pp.data_entrada, pp.data_saida
                    FROM participantes p
                    JOIN participantes_projetos pp ON p.cpf = pp.participante_cpf
                    WHERE pp.projeto_codigo = %s
                """
                await cursor.execute(sql_part, (codigo,))
                projeto['participantes'] = await cursor.fetchall()
                
                # Buscar financiamentos
                sql_fin = """
                    SELECT f.codigo_processo, f.agencia_sigla, f.tipo_fomento, f.valor_total, pf.valor_alocado
                    FROM financiamentos f
                    JOIN projetos_financiamentos pf ON f.codigo_processo = pf.financiamento_codigo
                    WHERE pf.projeto_codigo = %s
                """
                await cursor.execute(sql_fin, (codigo,))
                projeto['financiamentos'] = await cursor.fetchall()

        return projeto
    
    async def update(self, codigo: str, projeto: ProjetoCreate):
        """Atualiza um projeto existente"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                sql = """
                    UPDATE projetos 
                    SET titulo = %s, descricao = %s, data_inicio = %s, 
                        data_termino = %s, situacao = %s, coordenador_cpf = %s
                    WHERE codigo = %s
                """
                values = (
                    projeto.titulo,
                    projeto.descricao,
                    projeto.data_inicio,
                    projeto.data_termino,
                    projeto.situacao.value,
                    projeto.coordenador_cpf,
                    codigo
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return await self.get_by_codigo(codigo)
    
    async def delete(self, codigo: str):
        """Deleta um projeto"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM projetos WHERE codigo = %s", (codigo,))
                await conn.commit()
                return True
    
    async def add_participante(self, projeto_codigo: str, participante_cpf: str, funcao: str, data_entrada: str, data_saida: str = None):
        """Vincula um participante a um projeto"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO participantes_projetos 
                    (projeto_codigo, participante_cpf, funcao, data_entrada, data_saida)
                    VALUES (%s, %s, %s, %s, %s)
                """
                await cursor.execute(sql, (projeto_codigo, participante_cpf, funcao, data_entrada, data_saida))
                await conn.commit()
                return True
    
    async def add_financiamento(self, projeto_codigo: str, financiamento_codigo: str, valor_alocado: float):
        """Vincula um financiamento a um projeto"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO projetos_financiamentos 
                    (projeto_codigo, financiamento_codigo, valor_alocado)
                    VALUES (%s, %s, %s)
                """
                await cursor.execute(sql, (projeto_codigo, financiamento_codigo, valor_alocado))
                await conn.commit()
                return True
    
    async def get_by_coordenador(self, coordenador_cpf: str):
        """Retorna todos os projetos de um coordenador"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, part.nome as coordenador_nome 
                    FROM projetos p
                    INNER JOIN participantes part ON p.coordenador_cpf = part.cpf
                    WHERE p.coordenador_cpf = %s
                    ORDER BY p.data_inicio DESC
                """
                await cursor.execute(sql, (coordenador_cpf,))
                result = await cursor.fetchall()
                return result
