# SIGPesq - Sistema de Gerenciamento de Projetos de Pesquisa

Sistema completo para gerenciamento de projetos de pesquisa universitários, incluindo controle de participantes, financiamentos e produções científicas.

## 🚀 Tecnologias

### Backend
- **Python 3.11+**
- **FastAPI** - Framework web moderno e rápido
- **PyMySQL** - Driver MySQL para Python (sem ORM)
- **JWT** - Autenticação com tokens
- **Bcrypt** - Hash de senhas

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool
- **React Router** - Navegação
- **Axios** - Cliente HTTP

### Banco de Dados
- **MySQL 8.0** - Banco de dados relacional

### Infraestrutura
- **Docker & Docker Compose** - Containerização

## 📋 Funcionalidades

### Módulos Principais
1. **Dashboard** - Visão geral com estatísticas e itens recentes
2. **Participantes** - Gerenciamento de docentes, discentes e técnicos
3. **Projetos** - CRUD de projetos com vinculação de participantes e financiamentos
4. **Financiamentos** - Controle de bolsas e auxílios com cálculo de totais
5. **Produções Científicas** - Registro de artigos, livros e trabalhos com autores
6. **Consultas** - Relatórios por coordenador, agência e ano

### Recursos
- ✅ Autenticação JWT
- ✅ Busca e filtros em todas as listagens
- ✅ Formatação brasileira (datas e moeda)
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Interface responsiva
- ✅ Queries SQL diretas (sem ORM)

## 🛠️ Como Rodar o Projeto

### Opção 1: Com Docker (Recomendado)

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd sigpesq
```

2. **Suba os containers**
```bash
docker-compose up --build
```

3. **Acesse a aplicação**
- **Frontend**: http://localhost:5173
- **Backend API (Docs)**: http://localhost:8000/docs
- **Adminer (DB)**: http://localhost:8080
  - Sistema: MySQL
  - Servidor: `database`
  - Usuário: `user`
  - Senha: `password`
  - Banco: `sigpesq`

### Opção 2: Desenvolvimento Local

#### Backend

1. **Instale as dependências**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env na pasta backend
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=sigpesq
JWT_SECRET=seu-secret-aqui
```

3. **Execute o servidor**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

1. **Instale as dependências**
```bash
cd frontend
npm install
```

2. **Configure a URL da API**
```bash
# Crie um arquivo .env na pasta frontend
VITE_API_URL=http://localhost:8000
```

3. **Execute o servidor de desenvolvimento**
```bash
npm run dev
```

#### Banco de Dados

1. **Crie o banco de dados MySQL**
```bash
mysql -u root -p
CREATE DATABASE sigpesq;
```

2. **Execute o script de inicialização**
```bash
mysql -u root -p sigpesq < database/init_db.sql
```

## 📁 Estrutura do Projeto

```
sigpesq/
├── backend/
│   ├── app/
│   │   ├── main.py              # Aplicação FastAPI principal
│   │   ├── database.py          # Configuração do banco
│   │   ├── security.py          # Autenticação JWT
│   │   ├── schemas.py           # Modelos Pydantic
│   │   ├── routers/             # Endpoints da API
│   │   │   ├── auth.py
│   │   │   ├── participantes.py
│   │   │   ├── projetos.py
│   │   │   ├── financiamentos.py
│   │   │   ├── producoes.py
│   │   │   ├── dashboard.py
│   │   │   └── consultas.py
│   │   └── repositories/        # Lógica de acesso a dados
│   │       ├── participante_repository.py
│   │       ├── projeto_repository.py
│   │       ├── financiamento_repository.py
│   │       ├── producao_repository.py
│   │       ├── dashboard_repository.py
│   │       └── consulta_repository.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── FormField.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterSelect.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/               # Páginas da aplicação
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ParticipantesPage.jsx
│   │   │   ├── ProjetosPage.jsx
│   │   │   ├── FinanciamentosPage.jsx
│   │   │   ├── ProducoesPage.jsx
│   │   │   ├── ConsultasPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Contexto de autenticação
│   │   ├── services/
│   │   │   └── api.js           # Cliente API com interceptors
│   │   ├── utils/
│   │   │   └── formatters.js    # Formatadores de data e moeda
│   │   ├── hooks/
│   │   │   └── useErrorHandler.js
│   │   ├── App.jsx              # Rotas e layout
│   │   └── main.jsx
│   ├── package.json
│   └── Dockerfile
├── database/
│   ├── init_db.sql              # Schema e dados iniciais
│   └── queries.sql              # Queries de exemplo
├── docker-compose.yml
└── README.md
```

## 🔌 Endpoints da API

### Autenticação
- `POST /register` - Criar conta
- `POST /login` - Fazer login
- `GET /me` - Dados do usuário autenticado

### Participantes
- `GET /participantes` - Listar (com busca e filtros)
- `POST /participantes` - Criar
- `GET /participantes/{cpf}` - Obter por CPF
- `PUT /participantes/{cpf}` - Atualizar
- `DELETE /participantes/{cpf}` - Excluir

### Projetos
- `GET /projetos` - Listar (com busca e filtros)
- `POST /projetos` - Criar
- `GET /projetos/{codigo}` - Obter detalhes
- `PUT /projetos/{codigo}` - Atualizar
- `DELETE /projetos/{codigo}` - Excluir
- `POST /projetos/{codigo}/participantes` - Vincular participante
- `POST /projetos/{codigo}/financiamentos` - Vincular financiamento

### Financiamentos
- `GET /financiamentos` - Listar (com busca e filtros)
- `GET /financiamentos/total` - Total em financiamentos
- `POST /financiamentos` - Criar
- `GET /financiamentos/{id}` - Obter por ID
- `PUT /financiamentos/{id}` - Atualizar
- `DELETE /financiamentos/{id}` - Excluir

### Produções Científicas
- `GET /producoes` - Listar (com busca e filtros)
- `POST /producoes` - Criar (com autores)
- `GET /producoes/{id}` - Obter detalhes
- `PUT /producoes/{id}` - Atualizar
- `DELETE /producoes/{id}` - Excluir

### Dashboard
- `GET /dashboard/stats` - Estatísticas gerais
- `GET /dashboard/recent-projects` - Projetos recentes
- `GET /dashboard/recent-producoes` - Produções recentes

### Consultas
- `GET /consultas/coordenadores` - Lista de coordenadores
- `GET /consultas/projetos-por-coordenador/{cpf}` - Projetos por coordenador
- `GET /consultas/agencias` - Lista de agências
- `GET /consultas/financiamentos-por-agencia/{agencia}` - Financiamentos por agência
- `GET /consultas/anos` - Lista de anos
- `GET /consultas/producoes-por-ano/{ano}` - Produções por ano

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação. Após o login, o token é armazenado no localStorage e enviado automaticamente em todas as requisições através de um interceptor do Axios.

## 🎨 Interface

A interface foi desenvolvida com foco em usabilidade e segue os princípios:
- Design limpo e moderno
- Navegação intuitiva com sidebar
- Feedback visual para todas as ações
- Loading states e tratamento de erros
- Formatação brasileira (DD/MM/AAAA e R$ 0.000,00)

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos.

## 👥 Autores

Desenvolvido como parte do projeto de Sistema de Gerenciamento de Projetos de Pesquisa.
