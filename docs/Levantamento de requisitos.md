Levantamentos de Requisitos

Sistema de Gerenciamento de Projetos de Pesquisa (UFNES) - Resumo organizado e didático

**Disciplina:** Banco de Dados - Professora Silvia Rissino

**Nome:** (SIGPesq)

Alunos: Rafael Bitencort Sploradori, João Lucas Justino Rodrigues, Fábio Garcia de Almeida mobilio, Kaio Ribeiro martins barbosa

# Explicação do Projeto

SIGPesq (Sistema de Gerenciamento de Projetos de Pesquisa Universitários) visa informatizar o controle dos projetos de pesquisa da UFNES, substituindo planilhas separadas por um sistema com rastreabilidade e integridade dos dados.

# Objetivo Principal

Gerenciar projetos de pesquisa, participantes (docentes, discentes, técnico-administrativos), financiamentos e produções científicas, garantindo rastreabilidade e integridade.

# Entregas Principais do Trabalho

- Análise de Requisitos: Requisitos funcionais, não funcionais e regras de negócio.
- Modelagem de Processos: Modelo de Caso de Uso (diagrama e descrição).
- Modelagem de Dados: MER conceitual e modelo relacional lógico.
- Modelagem de Software: Modelo de classes (diagrama e descrição).
- Implementação: Script SQL (criação do banco e carga de dados).
- Consultas: Consultas SQL complexas e pertinentes.
- Documentação: Relatório final completo.

# Requisitos Funcionais (seleção)

| Código | Requisito Funcional |
| --- | --- |
| Projetos_pesquisa | Cadastro e consulta de Projetos de Pesquisa. |
| --- | --- |
| Participantes | Registro de participantes (docentes, discentes, técnico-administrativos). |
| --- | --- |
| Vínculo_de_participacao | Vínculo de participantes a um projeto com função e período de participação. |
| --- | --- |
| Financiamento | Registro de financiamentos para projetos. |
| --- | --- |
| Produções | Registro de produções científicas (artigos, softwares, relatórios etc.). |
| --- | --- |
| Coordenadores | Consulta de todos os projetos coordenados por um docente específico. |
| --- | --- |
| Participantes_projeto | Consulta dos participantes de um projeto. |
| --- | --- |
| Produções_projeto | Consulta das produções científicas vinculadas a cada projeto. |
| --- | --- |
| Agente_financeiro | Consulta dos financiamentos por agência financiadora. |
| --- | --- |

# Requisitos Não Funcionais (seleção)

| Código | Requisito Não Funcional | Categoria |
| --- | --- | --- |
| Número 1 | Garantir integridade e rastreabilidade de todas as informações | . Segurança / Qualidade |
| --- | --- | --- |
| Número 2 | Interface de entrada de dados (usabilidade). | Usabilidade |
| --- | --- | --- |
| Número 3 | Implementação em SGBD (ex.: MySQL). | Tecnológico |
| --- | --- | --- |

# Regras de Negócio (seleção)

| Código | Regra de Negócio |
| --- | --- |
| Regra 1 | Projeto identificado por código único. |
| --- | --- |
| Regra 2 | Cada projeto tem um único coordenador principal (docente). |
| --- | --- |
| Regra 3 | Docente pode coordenar vários projetos. |
| --- | --- |
| Regra 4 | Participante é Docente, Discente ou Técnico-administrativo. |
| --- | --- |
| Regra 5 | Mesmo participante pode atuar em vários projetos (simultaneamente possível). |
| --- | --- |
| Regra 6 | Projeto pode ter zero ou vários financiamentos. |
| --- | --- |
| Regra 7 | Um mesmo financiamento pode apoiar vários projetos. |
| --- | --- |
| Regra 8 | Produção científica pode ter um ou mais autores; todos devem ser participantes do sistema. |
| --- | --- |
| Regra 9 | Título, descrição, data de início/término e situação são obrigatórios para um projeto. |
| --- | --- |

# Observações e próximos passos

- Modelagem de caso de uso
- MER conceitual com base nessesrequisitos.
- Implementação: gerar scripts SQL e exemplos de carga a partir do modelo relacional lógico.