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
        """Retorna produções de um ano agrupadas por tipo (Formatado para o Frontend)"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                # 1. Buscar todos os tipos que tiveram produções no ano
                await cursor.execute(
                    "SELECT DISTINCT tipo FROM producoes WHERE ano_publicacao = %s ORDER BY tipo",
                    (ano,)
                )
                tipos = await cursor.fetchall()
                
                resultado = []
                
                for t in tipos:
                    tipo_nome = t['tipo']
                    
                    # 2. Buscar produções deste tipo no ano
                    sql = """
                        SELECT p.id_registro, p.titulo, p.tipo, p.meio_divulgacao as veiculo,
                               proj.titulo as projeto_titulo
                        FROM producoes p
                        LEFT JOIN projetos proj ON p.projeto_codigo = proj.codigo
                        WHERE p.ano_publicacao = %s AND p.tipo = %s
                        ORDER BY p.titulo
                    """
                    await cursor.execute(sql, (ano, tipo_nome))
                    producoes = await cursor.fetchall()
                    
                    # 3. Para cada produção, buscar nomes dos autores (concatenados)
                    for prod in producoes:
                        sql_autores = """
                            SELECT GROUP_CONCAT(part.nome ORDER BY pa.ordem SEPARATOR ', ') as nomes
                            FROM participantes part
                            JOIN producoes_autores pa ON part.cpf = pa.participante_cpf
                            WHERE pa.producao_id = %s
                        """
                        await cursor.execute(sql_autores, (prod['id_registro'],))
                        autores_res = await cursor.fetchone()
                        prod['autores'] = autores_res['nomes'] if autores_res else ""
                        prod['doi'] = prod['id_registro'] # Mapear para o frontend
                    
                    resultado.append({
                        'tipo_producao': tipo_nome,
                        'total': len(producoes),
                        'producoes': producoes
                    })
                
                return resultado
