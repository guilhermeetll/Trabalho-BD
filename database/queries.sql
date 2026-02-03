-- Consultas SQL Avançadas - SIGPesq
-- Requisito: Responder perguntas complexas do negócio

-- 1. Listar todos os projetos com seus coordenadores.
SELECT 
    p.codigo AS Codigo_Projeto,
    p.titulo AS Titulo_Projeto,
    p.situacao AS Situacao,
    part.nome AS Nome_Coordenador,
    part.email AS Email_Coordenador
FROM projetos p
JOIN participantes part ON p.coordenador_cpf = part.cpf
ORDER BY p.titulo;

-- 2. Mostrar as produções científicas de um determinado ano (Ex: 2024).
SELECT 
    prod.titulo AS Titulo_Producao,
    prod.tipo AS Tipo,
    prod.meio_divulgacao AS Veiculo,
    proj.titulo AS Projeto_Vinculado
FROM producoes prod
LEFT JOIN projetos proj ON prod.projeto_codigo = proj.codigo
WHERE prod.ano_publicacao = 2024;

-- 3. Exibir o total de financiamento por agência.
-- Agrupa os valores dos editais (valor total do fomento)
SELECT 
    a.nome AS Agencia,
    COUNT(f.codigo_processo) AS Qtd_Editais,
    SUM(f.valor_total) AS Total_Investido
FROM agencias a
JOIN financiamentos f ON a.sigla = f.agencia_sigla
GROUP BY a.nome
ORDER BY Total_Investido DESC;

-- 4. Listar participantes que atuam em mais de um projeto (Simultaneamente ou histórico).
SELECT 
    part.nome AS Participante,
    part.tipo AS Categoria,
    COUNT(DISTINCT pp.projeto_codigo) AS Qtd_Projetos
FROM participantes part
JOIN participantes_projetos pp ON part.cpf = pp.participante_cpf
GROUP BY part.cpf, part.nome, part.tipo
HAVING Qtd_Projetos > 1;
