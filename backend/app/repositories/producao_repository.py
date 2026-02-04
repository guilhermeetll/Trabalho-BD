from app.database import get_db_connection
from app.schemas import ProducaoCreate
import aiomysql
from datetime import datetime

class ProducaoRepository:
    async def create(self, prod: ProducaoCreate):
        async with get_db_connection() as conn:
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

    async def list_all(self, search: str = None, tipo: str = None, ano: int = None):
        """Lista todas as produções com filtros opcionais"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, proj.titulo as projeto_titulo 
                    FROM producoes p
                    LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                    WHERE 1=1
                """
                params = []
                
                if search:
                    sql += " AND (p.titulo LIKE %s OR p.meio_divulgacao LIKE %s)"
                    search_param = f"%{search}%"
                    params.extend([search_param, search_param])
                
                if tipo:
                    sql += " AND p.tipo = %s"
                    params.append(tipo)
                
                if ano:
                    sql += " AND p.ano_publicacao = %s"
                    params.append(ano)
                
                sql += " ORDER BY p.ano_publicacao DESC, p.titulo"
                
                await cursor.execute(sql, params)
                producoes = await cursor.fetchall()
                
                # Buscar autores para cada produção
                # Aqui e melhor fazer uma subquery ou join, mas para manter logica:
                # Vamos ter que usar outra conexao ou cursor. 
                # Como self.get_autores usa get_db_connection(), vai criar nova conexao pool.
                # Isso e aceitavel dado o tamanho da aplicacao.
                for producao in producoes:
                    producao['autores'] = await self.get_autores(producao['id_registro'])
                
                return producoes
    
    async def get_by_id(self, id_registro: str):
        """Retorna uma produção específica com autores"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, proj.titulo as projeto_titulo 
                    FROM producoes p
                    LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                    WHERE p.id_registro = %s
                """
                await cursor.execute(sql, (id_registro,))
                producao = await cursor.fetchone()
                
                # Se achou, busca autores (nova conexao)
                if producao:
                    producao['autores'] = await self.get_autores(id_registro)
                
                return producao
    
    async def update(self, id_registro: str, prod: ProducaoCreate):
        """Atualiza uma produção"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                sql = """
                    UPDATE producoes 
                    SET projeto_codigo = %s, titulo = %s, tipo = %s,
                        ano_publicacao = %s, meio_divulgacao = %s
                    WHERE id_registro = %s
                """
                values = (
                    prod.projeto_codigo, prod.titulo, prod.tipo,
                    prod.ano_publicacao, prod.meio_divulgacao, id_registro
                )
                await cursor.execute(sql, values)
                await conn.commit()
                return await self.get_by_id(id_registro)
    
    async def delete(self, id_registro: str):
        """Deleta uma produção"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM producoes WHERE id_registro = %s", (id_registro,))
                await conn.commit()
                return True
    
    async def get_autores(self, producao_id: str):
        """Retorna os autores de uma produção ordenados"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT part.cpf, part.nome, part.email, pa.ordem
                    FROM participantes part
                    JOIN producoes_autores pa ON part.cpf = pa.participante_cpf
                    WHERE pa.producao_id = %s
                    ORDER BY pa.ordem
                """
                await cursor.execute(sql, (producao_id,))
                return await cursor.fetchall()
    
    async def add_autor(self, producao_id: str, participante_cpf: str, ordem: int):
        """Adiciona um autor a uma produção"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                sql = """
                    INSERT INTO producoes_autores (producao_id, participante_cpf, ordem)
                    VALUES (%s, %s, %s)
                """
                await cursor.execute(sql, (producao_id, participante_cpf, ordem))
                await conn.commit()
                return True
    
    async def remove_autores(self, producao_id: str):
        """Remove todos os autores de uma produção"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM producoes_autores WHERE producao_id = %s", (producao_id,))
                await conn.commit()
                return True
    
    async def get_by_ano(self, ano: int):
        """Retorna produções de um ano específico"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = """
                    SELECT p.*, proj.titulo as projeto_titulo 
                    FROM producoes p
                    LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                    WHERE p.ano_publicacao = %s
                    ORDER BY p.tipo, p.titulo
                """
                await cursor.execute(sql, (ano,))
                return await cursor.fetchall()
    
    async def get_anos(self):
        """Retorna lista de anos distintos"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "SELECT DISTINCT ano_publicacao FROM producoes ORDER BY ano_publicacao DESC"
                )
                result = await cursor.fetchall()
                return [row[0] for row in result]
