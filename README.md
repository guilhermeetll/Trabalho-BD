# SIGPesq - Sistema de Gerenciamento de Projetos de Pesquisa

## Tecnologias
- **Backend**: Python (FastAPI)
- **Frontend**: React (Vite)
- **Banco de Dados**: MySQL 8.0
- **Infraestrutura**: Docker & Docker Compose

## Como rodar o projeto

Certifique-se de ter o Docker e Docker Compose instalados.

1. **Construir e subir os containers**:
   ```bash
   docker-compose up --build
   ```

2. **Acessar a aplicação**:
   - **Frontend**: http://localhost:5173
   - **Backend API (Docs)**: http://localhost:8000/docs
   - **Adminer (Banco de Dados)**: http://localhost:8080
       - Sistema: MySQL
       - Servidor: `database`
       - Usuário: `user`
       - Senha: `password`
       - Banco: `sigpesq`

## Estrutura do Projeto
- `database/init_db.sql`: Script SQL de criação do banco e dados iniciais.
- `backend/`: Código fonte da API FastAPI.
- `frontend/`: Código fonte da aplicação React.
