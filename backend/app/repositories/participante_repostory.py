from app.database import get_db_connection
from app.schemas import ParticipanteCreate
import aiomysql

from app.security import get_password_hash

class ParticipanteRepository:
    async def create(self, participante: ParticipanteCreate):
        async with get_db_connection() as conn:
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

    async def get_by_email(self, email: str):
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    "SELECT * FROM participantes WHERE email = %s",
                    (email,)
                )
                result = await cursor.fetchone()
                return result

    async def list_all(self, search: str = None, tipo: str = None):
        """Lista todos os participantes com filtros opcionais"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                sql = "SELECT cpf, nome, email, tipo, criado_em FROM participantes WHERE 1=1"
                params = []
                
                if search:
                    sql += " AND (nome LIKE %s OR email LIKE %s OR cpf LIKE %s)"
                    search_param = f"%{search}%"
                    params.extend([search_param, search_param, search_param])
                
                if tipo:
                    sql += " AND tipo = %s"
                    params.append(tipo)
                
                sql += " ORDER BY nome"
                
                await cursor.execute(sql, params)
                result = await cursor.fetchall()
                return result

    async def get_by_cpf(self, cpf: str):
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    "SELECT cpf, nome, email, tipo, criado_em FROM participantes WHERE cpf = %s",
                    (cpf,)
                )
                result = await cursor.fetchone()
                return result
    
    async def update(self, cpf: str, participante: ParticipanteCreate):
        """Atualiza um participante existente"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                # Se a senha foi fornecida, atualiza também
                if participante.senha:
                    hashed_password = get_password_hash(participante.senha)
                    sql = """
                        UPDATE participantes 
                        SET nome = %s, email = %s, tipo = %s, senha_hash = %s
                        WHERE cpf = %s
                    """
                    values = (
                        participante.nome,
                        participante.email,
                        participante.tipo.value,
                        hashed_password,
                        cpf
                    )
                else:
                    sql = """
                        UPDATE participantes 
                        SET nome = %s, email = %s, tipo = %s
                        WHERE cpf = %s
                    """
                    values = (
                        participante.nome,
                        participante.email,
                        participante.tipo.value,
                        cpf
                    )
                
                await cursor.execute(sql, values)
                await conn.commit()
                # Para retornar, precisamos chamar self.get_by_cpf, mas ele cria nova conexao
                # Idealmente refatorar create/update para nao chamar outros metodos que abrem conexao
                # Mas aqui, como usamos `async with`, a conexao fecha ao sair deste bloco.
                # Entao chamar self.get_by_cpf(cpf) vai abrir uma nova conexao, o que eh OK.
                return await self.get_by_cpf(cpf)
    
    async def delete(self, cpf: str):
        """Deleta um participante"""
        async with get_db_connection() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("DELETE FROM participantes WHERE cpf = %s", (cpf,))
                await conn.commit()
                return True
    
    async def get_docentes(self):
        """Retorna apenas participantes do tipo DOCENTE"""
        async with get_db_connection() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(
                    "SELECT cpf, nome, email FROM participantes WHERE tipo = 'DOCENTE' ORDER BY nome"
                )
                result = await cursor.fetchall()
                return result
