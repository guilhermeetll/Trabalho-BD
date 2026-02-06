
import requests
import json
import pymysql
import time
import sys

# Configuration
API_URL = "http://localhost:8000"
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "sigpesq"
DB_USER = "user"
DB_PASS = "password"

# Temporary Admin User
TEMP_ADMIN_EMAIL = "temp_admin_test_v2@test.com"
TEMP_ADMIN_PASS = "123456"
TEMP_ADMIN_NAME = "Super Admin V2"

def get_db_connection():
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print(f"Error connecting to DB: {e}")
        sys.exit(1)

def cleanup_admin_user():
    print(f"[*] Cleaning up temporary user...")
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM participantes WHERE email = %s", (TEMP_ADMIN_EMAIL,))
        conn.commit()
    except Exception as e:
        print(f"[-] Cleanup error: {e}")
    finally:
        conn.close()

def setup_admin_user_via_api():
    print(f"[*] Registering temporary user via API...")
    cleanup_admin_user() # Ensure clear start

    # 1. Register
    url = f"{API_URL}/register"
    payload = {
        "name": TEMP_ADMIN_NAME,
        "email": TEMP_ADMIN_EMAIL,
        "password": TEMP_ADMIN_PASS
    }
    
    try:
        res = requests.post(url, json=payload)
        if res.status_code != 200:
            print(f"[-] Registration failed: {res.status_code} - {res.text}")
            return False
        
        # 2. Promote to ADMIN via DB
        print("[*] Promoting user to ADMIN via DB...")
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE participantes SET tipo = 'ADMIN' WHERE email = %s", (TEMP_ADMIN_EMAIL,))
            if cursor.rowcount == 0:
                print("[-] Failed to find user in DB to promote.")
                return False
        conn.commit()
        conn.close()
        print("[+] User promoted to ADMIN.")
        return True

    except Exception as e:
        print(f"[-] Setup error: {e}")
        return False

# Global to store CPF
TEMP_ADMIN_CPF_VALUE = ""

def modified_login():
    global TEMP_ADMIN_CPF_VALUE
    url = f"{API_URL}/login"
    payload = {
        "email": TEMP_ADMIN_EMAIL,
        "password": TEMP_ADMIN_PASS
    }
    try:
        res = requests.post(url, json=payload)
        if res.status_code == 200:
            data = res.json()
            token = data["access_token"]
            TEMP_ADMIN_CPF_VALUE = data["user_cpf"]
            print(f"[+] Login successful. CPF: {TEMP_ADMIN_CPF_VALUE}")
            return token
        else:
            print(f"[-] Login failed: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"[-] Login error: {e}")
        return None

def test_create_participante(token):
    print("\n--- Testing Create Participante ---")
    headers = {"Authorization": f"Bearer {token}"}
    cpf = "88888888888"
    payload = {
        "cpf": cpf,
        "nome": "Test Participante Created",
        "email": "created.part@test.com",
        "tipo": "DISCENTE",
        "senha": "password123"
    }
    
    cleanup_test_data("participantes", "cpf", cpf)

    try:
        res = requests.post(f"{API_URL}/participantes/", json=payload, headers=headers)
        if res.status_code == 200:
            print("[+] SUCCESS: Participante created.")
            return True
        else:
            print(f"[-] FAILED: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"[-] Exception: {e}")
        return False

def test_create_agencia_financiamento(token):
    print("\n--- Testing Create Agencia & Financiamento ---")
    headers = {"Authorization": f"Bearer {token}"}
    
    agencia_sigla = "TEST_AGENCY"
    payload_agencia = {
        "sigla": agencia_sigla,
        "nome": "Test Agency Funding"
    }

    cleanup_test_data("agencias", "sigla", agencia_sigla)
    
    try:
        res_ag = requests.post(f"{API_URL}/financiamentos/agencias", json=payload_agencia, headers=headers)
        if res_ag.status_code == 200 or "já cadastrada" in res_ag.text:
             print("[+] Agencia created or exists.")
        else:
            print(f"[-] FAILED creating agencia: {res_ag.status_code} - {res_ag.text}")
            return False

        # Create Financiamento
        fin_code = "PROC_TEST_001"
        payload_fin = {
            "codigo_processo": fin_code,
            "agencia_sigla": agencia_sigla,
            "tipo_fomento": "Research Grant",
            "valor_total": 50000.0,
            "data_inicio": "2024-01-01T00:00:00",
            "data_fim": "2025-01-01T00:00:00"
        }
        
        cleanup_test_data("financiamentos", "codigo_processo", fin_code) 

        res = requests.post(f"{API_URL}/financiamentos/", json=payload_fin, headers=headers)
        if res.status_code == 200:
            print("[+] SUCCESS: Financiamento created.")
            return True
        else:
            print(f"[-] FAILED creating financiamento: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"[-] Exception: {e}")
        return False

def test_create_projeto(token):
    print("\n--- Testing Create Projeto ---")
    headers = {"Authorization": f"Bearer {token}"}
    codigo = "PROJ_TEST_99"
    
    # Needs a valid coordinator CPF. To pass legacy trigger, must be DOCENTE.
    conn = get_db_connection()
    docente_cpf = ""
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT cpf FROM participantes WHERE tipo = 'DOCENTE' LIMIT 1")
            res = cursor.fetchone()
            if res:
                docente_cpf = res['cpf']
    finally:
        conn.close()
    
    if not docente_cpf:
        print("[-] Skipping Project Test: No Docente found.")
        return False
        
    payload = {
        "codigo": codigo,
        "titulo": "Test Project Auto Created",
        "descricao": "Description for test project",
        "data_inicio": "2024-06-01T00:00:00",
        "data_termino": "2025-06-01T00:00:00",
        "situacao": "EM_ANDAMENTO",
        "coordenador_cpf": docente_cpf 
    }

    cleanup_test_data("projetos", "codigo", codigo)

    try:
        res = requests.post(f"{API_URL}/projetos/", json=payload, headers=headers)
        if res.status_code == 200:
            print("[+] SUCCESS: Projeto created.")
            return True
        else:
            print(f"[-] FAILED: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"[-] Exception: {e}")
        return False

def test_create_producao(token):
    print("\n--- Testing Create Producao ---")
    headers = {"Authorization": f"Bearer {token}"}
    id_registro = "10.1234/test.prod.001"
    
    payload = {
        "id_registro": id_registro,
        "titulo": "Test Production Article",
        "tipo": "Artigo",
        "ano_publicacao": 2024,
        "meio_divulgacao": "Test Journal",
        "projeto_codigo": None 
    }

    # Cleanup Producao
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM producoes WHERE id_registro = %s", (id_registro,))
        conn.commit()
    except: pass
    finally:
        conn.close()

    try:
        res = requests.post(f"{API_URL}/producoes/", json=payload, headers=headers)
        if res.status_code == 200:
            print("[+] SUCCESS: Producao created.")
            return True
        else:
            print(f"[-] FAILED: {res.status_code} - {res.text}")
            return False
    except Exception as e:
        print(f"[-] Exception: {e}")
        return False

def cleanup_test_data(table, col, val):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            query = f"DELETE FROM {table} WHERE {col} = %s"
            cursor.execute(query, (val,))
        conn.commit()
    except Exception as e:
        pass 
    finally:
        conn.close()

if __name__ == "__main__":
    if setup_admin_user_via_api():
        token = modified_login()
        
        if token:
            results = []
            results.append(test_create_participante(token))
            results.append(test_create_agencia_financiamento(token))
            results.append(test_create_projeto(token))
            results.append(test_create_producao(token))
            
            cleanup_admin_user()
            
            if all(results):
                print("\n\n[***] ALL TESTS PASSED! Create functionality verified.")
                sys.exit(0)
            else:
                print("\n\n[!!!] SOME TESTS FAILED.")
                sys.exit(1)
        else:
             sys.exit(1)
    else:
        sys.exit(1)
