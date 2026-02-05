-- Script de Criação do Banco de Dados - SIGPesq (Versão Final)

CREATE DATABASE IF NOT EXISTS sigpesq;
USE sigpesq;

-- 1. Tabelas Principais (Entidades Fortes)

-- Tabela: Participante
-- Chave Natural: CPF
CREATE TABLE IF NOT EXISTS participantes (
    cpf CHAR(11) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    tipo ENUM('ADMIN', 'DOCENTE', 'DISCENTE', 'TECNICO') NOT NULL,
    senha_hash VARCHAR(255) NOT NULL DEFAULT 'hash_padrao', -- Simplificação
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cpf)
);

-- Tabela: Agencia
-- Chave Natural: Sigla
CREATE TABLE IF NOT EXISTS agencias (
    sigla VARCHAR(20) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    PRIMARY KEY (sigla)
);

-- Tabela: Financiamento
-- Chave Natural: Código Processo
CREATE TABLE IF NOT EXISTS financiamentos (
    codigo_processo VARCHAR(50) NOT NULL,
    agencia_sigla VARCHAR(20) NOT NULL,
    tipo_fomento VARCHAR(50) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    PRIMARY KEY (codigo_processo),
    FOREIGN KEY (agencia_sigla) REFERENCES agencias(sigla) ON UPDATE CASCADE,
    CONSTRAINT chk_fin_datas CHECK (data_fim >= data_inicio)
);

-- Tabela: Projeto
-- Chave Natural: Código
-- Regras:
-- 1. Coordenador deve ser um participante (FK).
-- 2. A validação se é DOCENTE será feita via TRIGGER.
CREATE TABLE IF NOT EXISTS projetos (
    codigo VARCHAR(20) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_termino DATE,
    situacao ENUM('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') DEFAULT 'EM_ANDAMENTO',
    coordenador_cpf CHAR(11) NOT NULL,
    PRIMARY KEY (codigo),
    FOREIGN KEY (coordenador_cpf) REFERENCES participantes(cpf) ON UPDATE CASCADE,
    CONSTRAINT chk_proj_datas CHECK (data_termino IS NULL OR data_termino >= data_inicio)
);

-- 2. Tabelas Associativas (Relacionamentos N:M)

-- Tabela: ParticipanteProjeto
-- Função e Período são atributos do relacionamento.
CREATE TABLE IF NOT EXISTS participantes_projetos (
    projeto_codigo VARCHAR(20) NOT NULL,
    participante_cpf CHAR(11) NOT NULL,
    funcao VARCHAR(100) NOT NULL, -- Ex: Bolsista, Pesquisador
    data_entrada DATE NOT NULL,
    data_saida DATE,
    PRIMARY KEY (projeto_codigo, participante_cpf),
    FOREIGN KEY (projeto_codigo) REFERENCES projetos(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (participante_cpf) REFERENCES participantes(cpf) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_part_datas CHECK (data_saida IS NULL OR data_saida >= data_entrada)
);

-- Tabela: ProjetoFinanciamento
-- Quanto do financiamento vai para o projeto.
CREATE TABLE IF NOT EXISTS projetos_financiamentos (
    projeto_codigo VARCHAR(20) NOT NULL,
    financiamento_codigo VARCHAR(50) NOT NULL,
    valor_alocado DECIMAL(15, 2) NOT NULL,
    data_alocacao DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY (projeto_codigo, financiamento_codigo),
    FOREIGN KEY (projeto_codigo) REFERENCES projetos(codigo) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (financiamento_codigo) REFERENCES financiamentos(codigo_processo) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Entidades de Produção

-- Tabela: Producao
CREATE TABLE IF NOT EXISTS producoes (
    id_registro VARCHAR(50) NOT NULL, -- DOI ou ID interno
    projeto_codigo VARCHAR(20), -- Pode ser NULL (independente), mas a regra diz vinculada
    titulo VARCHAR(250) NOT NULL,
    tipo ENUM('ARTIGO', 'LIVRO', 'CAPITULO', 'TRABALHO', 'RESUMO') NOT NULL,
    ano_publicacao INT NOT NULL,
    meio_divulgacao VARCHAR(200),
    PRIMARY KEY (id_registro),
    FOREIGN KEY (projeto_codigo) REFERENCES projetos(codigo) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela: ProducaoAutor
-- Ordem dos autores na publicação.
CREATE TABLE IF NOT EXISTS producoes_autores (
    producao_id VARCHAR(50) NOT NULL,
    participante_cpf CHAR(11) NOT NULL,
    ordem INT NOT NULL,
    PRIMARY KEY (producao_id, participante_cpf),
    FOREIGN KEY (producao_id) REFERENCES producoes(id_registro) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (participante_cpf) REFERENCES participantes(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Triggers (Regras de Negócio Avançadas)

DELIMITER //

-- Regra: Apenas DOCENTES ou ADMINS podem ser coordenadores de projeto.
CREATE TRIGGER trg_verificar_coordenador_insert BEFORE INSERT ON projetos
FOR EACH ROW
BEGIN
    DECLARE tipo_part VARCHAR(20);
    SELECT tipo INTO tipo_part FROM participantes WHERE cpf = NEW.coordenador_cpf;
    
    IF tipo_part != 'DOCENTE' AND tipo_part != 'ADMIN' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Regra violada: O coordenador do projeto deve ser um DOCENTE ou ADMIN.';
    END IF;
END;
//

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
//

DELIMITER ;

-- 5. Massa de Dados (Seed Data)

-- Participantes (6)
-- Todos com senha '123456' (Hash: $2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C)
INSERT INTO participantes (cpf, nome, email, tipo, senha_hash) VALUES 
('00000000000', 'Administrador', 'admin@sigpesq.br', 'ADMIN', '$2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C'),
('11111111111', 'Prof. Dr. Alberto', 'alberto@ufnes.br', 'DOCENTE', '$2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C'), 
('22222222222', 'Profa. Dra. Beatriz', 'beatriz@ufnes.br', 'DOCENTE', '$2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C'),
('33333333333', 'Carlos Aluno', 'carlos@aluno.ufnes.br', 'DISCENTE', '$2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C'),
('44444444444', 'Daniela Aluna', 'daniela@aluno.ufnes.br', 'DISCENTE', '$2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C'),
('55555555555', 'Eduardo Técnico', 'eduardo@adm.ufnes.br', 'TECNICO', '$2b$12$W1jjB3T4jW0var.hOF4sJ.m2FAvlKYzPX3Tus7BheIj8s0.c4gd9C');

-- Agencias (3)
INSERT INTO agencias (sigla, nome) VALUES 
('CNPq', 'Conselho Nacional de Desenvolvimento Científico'),
('FAPES', 'Fundação de Amparo à Pesquisa do ES'),
('CAPES', 'Coordenação de Aperfeiçoamento de Pessoal');

-- Financiamentos (3)
INSERT INTO financiamentos (codigo_processo, agencia_sigla, tipo_fomento, valor_total, data_inicio, data_fim) VALUES 
('FAPES-2024-001', 'FAPES', 'Auxílio Pesquisa', 50000.00, '2024-01-01', '2025-12-31'),
('CNPQ-UNIV-01', 'CNPq', 'Bolsa Produtividade', 120000.00, '2023-06-01', '2026-06-01'),
('CAPES-PROEX', 'CAPES', 'Verba PROEX', 30000.00, '2024-01-01', '2024-12-31');

-- Projetos (3)
INSERT INTO projetos (codigo, titulo, descricao, data_inicio, data_termino, situacao, coordenador_cpf) VALUES 
('PROJ-IA-01', 'Inteligência Artificial na Saúde', 'Aplicação de ML em diagnósticos.', '2024-02-01', NULL, 'EM_ANDAMENTO', '11111111111'),
('PROJ-BD-02', 'Otimização de Query SQL', 'Estudos sobre indexação avançada.', '2023-08-01', '2024-08-01', 'CONCLUIDO', '22222222222'),
('PROJ-WEB-03', 'Acessibilidade na Web', 'Ferramentas para inclusão digital.', '2024-03-01', NULL, 'EM_ANDAMENTO', '11111111111');

-- Vínculos Participantes (N:M)
INSERT INTO participantes_projetos (projeto_codigo, participante_cpf, funcao, data_entrada) VALUES 
('PROJ-IA-01', '33333333333', 'Bolsista IC', '2024-02-01'), -- Carlos no Projeto IA
('PROJ-IA-01', '55555555555', 'Suporte Técnico', '2024-02-15'), -- Eduardo no Projeto IA
('PROJ-WEB-03', '33333333333', 'Voluntário', '2024-03-01'),   -- Carlos TAMBÉM no Projeto WEB (Multiprojeto)
('PROJ-BD-02', '44444444444', 'Pesquisadora Jr', '2023-08-01');

-- Alocação de Financiamento
INSERT INTO projetos_financiamentos (projeto_codigo, financiamento_codigo, valor_alocado) VALUES 
('PROJ-IA-01', 'CNPQ-UNIV-01', 80000.00),
('PROJ-BD-02', 'FAPES-2024-001', 20000.00);

-- Produções (4)
INSERT INTO producoes (id_registro, projeto_codigo, titulo, tipo, ano_publicacao, meio_divulgacao) VALUES 
('DOI-10.1000/1', 'PROJ-IA-01', 'Deep Learning for X-Ray', 'ARTIGO', 2024, 'Journal of AI'),
('SOFT-001', 'PROJ-IA-01', 'DiagAlgo v1.0', 'SOFTWARE', 2024, 'GitHub'),
('REL-FINAL-BD', 'PROJ-BD-02', 'Relatório Final de Otimização', 'RELATORIO', 2024, 'Interno'),
('DOI-10.1000/2', 'PROJ-WEB-03', 'Diretrizes WCAG 3.0', 'ARTIGO', 2025, 'WebConf');

-- Autores das Produções
INSERT INTO producoes_autores (producao_id, participante_cpf, ordem) VALUES 
('DOI-10.1000/1', '11111111111', 1), -- Alberto
('DOI-10.1000/1', '33333333333', 2), -- Carlos
('SOFT-001', '33333333333', 1),      -- Carlos
('REL-FINAL-BD', '22222222222', 1),  -- Beatriz
('REL-FINAL-BD', '44444444444', 2),  -- Daniela
('DOI-10.1000/2', '11111111111', 1); -- Alberto
