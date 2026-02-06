
import pymysql

# Configuration
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "sigpesq"
DB_USER = "user"
DB_PASS = "password"

sql_drop_insert = "DROP TRIGGER IF EXISTS trg_verificar_coordenador_insert"
sql_create_insert = """
CREATE TRIGGER trg_verificar_coordenador_insert BEFORE INSERT ON projetos
FOR EACH ROW
BEGIN
    DECLARE tipo_part VARCHAR(20);
    SELECT tipo INTO tipo_part FROM participantes WHERE cpf = NEW.coordenador_cpf;
    
    IF tipo_part != 'DOCENTE' AND tipo_part != 'ADMIN' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Regra violada: O coordenador do projeto deve ser um DOCENTE ou ADMIN.';
    END IF;
END;
"""

sql_drop_update = "DROP TRIGGER IF EXISTS trg_verificar_coordenador_update"
sql_create_update = """
CREATE TRIGGER trg_verificar_coordenador_update BEFORE UPDATE ON projetos
FOR EACH ROW
BEGIN
    DECLARE tipo_part VARCHAR(20);
    IF NEW.coordenador_cpf != OLD.coordenador_cpf THEN
        SELECT tipo INTO tipo_part FROM participantes WHERE cpf = NEW.coordenador_cpf;
        
        IF tipo_part != 'DOCENTE' AND tipo_part != 'ADMIN' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Regra violada: O coordenador do projeto deve ser um DOCENTE ou ADMIN.';
        END IF;
    END IF;
END;
"""

try:
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )
    cursor = conn.cursor()
    
    print("Dropping/Creating Insert Trigger...")
    cursor.execute(sql_drop_insert)
    cursor.execute(sql_create_insert)
    
    print("Dropping/Creating Update Trigger...")
    cursor.execute(sql_drop_update)
    cursor.execute(sql_create_update)
    
    conn.commit()
    print("Triggers updated successfully.")
    conn.close()
except Exception as e:
    print(f"Error updating triggers: {e}")
