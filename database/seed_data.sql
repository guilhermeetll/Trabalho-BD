-- Script de seed para dados de teste
-- Execute após o init_db.sql

-- Inserir participantes de exemplo
INSERT INTO Participante (cpf, nome, email, tipo, foto_url) VALUES
('11111111111', 'Dr. João Silva', 'joao.silva@universidade.br', 'Docente', NULL),
('22222222222', 'Dra. Maria Santos', 'maria.santos@universidade.br', 'Docente', NULL),
('33333333333', 'Carlos Oliveira', 'carlos.oliveira@aluno.br', 'Discente', NULL),
('44444444444', 'Ana Costa', 'ana.costa@aluno.br', 'Discente', NULL),
('55555555555', 'Pedro Souza', 'pedro.souza@universidade.br', 'Técnico', NULL);

-- Inserir projetos de exemplo
INSERT INTO Projeto (codigo, titulo, descricao, coordenador_cpf, data_inicio, data_fim, situacao) VALUES
('PROJ001', 'Inteligência Artificial na Educação', 'Pesquisa sobre aplicação de IA em ambientes educacionais', '11111111111', '2024-01-01', '2025-12-31', 'Em Andamento'),
('PROJ002', 'Sustentabilidade Urbana', 'Estudo sobre práticas sustentáveis em cidades médias', '22222222222', '2023-06-01', '2024-12-31', 'Em Andamento'),
('PROJ003', 'Computação Quântica', 'Desenvolvimento de algoritmos quânticos', '11111111111', '2022-01-01', '2023-12-31', 'Concluído');

-- Inserir financiamentos de exemplo
INSERT INTO Financiamento (agencia, tipo_fomento, valor, numero_processo, data_inicio, data_fim) VALUES
('CNPq', 'Bolsa de Produtividade', 50000.00, '123456/2024-1', '2024-01-01', '2026-12-31'),
('CAPES', 'Bolsa de Mestrado', 18000.00, '789012/2024-2', '2024-03-01', '2026-02-28'),
('FAPESP', 'Auxílio Regular', 100000.00, '2024/00001-0', '2024-01-01', '2025-12-31');

-- Vincular financiamentos a projetos
INSERT INTO Projeto_Financiamento (projeto_codigo, financiamento_id) VALUES
('PROJ001', 1),
('PROJ001', 3),
('PROJ002', 2);

-- Vincular participantes a projetos
INSERT INTO Projeto_Participante (projeto_codigo, participante_cpf, funcao, data_inicio, data_fim) VALUES
('PROJ001', '11111111111', 'Coordenador', '2024-01-01', NULL),
('PROJ001', '33333333333', 'Bolsista', '2024-02-01', NULL),
('PROJ001', '44444444444', 'Voluntário', '2024-03-01', NULL),
('PROJ002', '22222222222', 'Coordenador', '2023-06-01', NULL),
('PROJ002', '55555555555', 'Técnico', '2023-06-01', NULL),
('PROJ003', '11111111111', 'Coordenador', '2022-01-01', '2023-12-31');

-- Inserir produções científicas de exemplo
INSERT INTO Producao_Cientifica (titulo, tipo_producao, ano, veiculo, doi, projeto_codigo) VALUES
('Machine Learning aplicado à Educação: Uma Revisão Sistemática', 'Artigo', 2024, 'Revista Brasileira de Informática na Educação', '10.5753/rbie.2024.001', 'PROJ001'),
('Cidades Sustentáveis: Desafios e Oportunidades', 'Livro', 2024, 'Editora Universitária', '978-85-7326-123-4', 'PROJ002'),
('Algoritmos Quânticos para Otimização', 'Artigo', 2023, 'Quantum Information Processing', '10.1007/s11128-023-00001', 'PROJ003'),
('IA na Sala de Aula: Experiências Práticas', 'Trabalho', 2024, 'Congresso Brasileiro de Informática na Educação', NULL, 'PROJ001');

-- Inserir autores das produções
INSERT INTO Producao_Autor (producao_id, participante_cpf, ordem) VALUES
(1, '11111111111', 1),
(1, '33333333333', 2),
(2, '22222222222', 1),
(2, '55555555555', 2),
(3, '11111111111', 1),
(4, '11111111111', 1),
(4, '44444444444', 2);

-- Criar usuário de teste para login
-- Senha: 123456 (hash bcrypt)
INSERT INTO Usuario (email, senha_hash, nome, tipo, cpf) VALUES
('admin@sigpesq.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSBHxQgK', 'Administrador', 'Docente', '11111111111'),
('aluno@sigpesq.br', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSBHxQgK', 'Aluno Teste', 'Discente', '33333333333');
