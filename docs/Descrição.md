Universidade Federal do Espírito Santo
Departamento de Computação e Eletrônica Disciplina: Banco de Dados
Professora: Silvia Rissino
Trabalho em Equipe com mínimo 3 alunos
Data da Entrega do projeto em PDF via plataforma Classroom:
Data da Entrega do projeto em PDF via plataforma Classroom: 29/01/202 6 até as 13:

Defesa do Trabalho – 29 e 30 /01/2026 (data provável)

Prova final: 26/02/

Case: Sistema de Gerenciamento de Projetos de Pesquisa Universitários (SIGPesq)

Contexto Geral

A Universidade Fictícia Federal do Norte do Espírito Santo (UFNES) deseja informatizar
o controle de projetos de pesquisa. Atualmente, as informações são mantidas em
planilhas separadas, o que dificulta o acompanhamento de prazos, bolsas e produções
científicas.

O objetivo do sistema SIGPesq é gerenciar os projetos de pesquisa, seus participantes,
financiamentos e resultados, garantindo rastreabilidade e integridade das informações.

Requisitos do Sistema

1. Projetos
- Cada projeto possui:

```
✓ um código único,
```
```
✓ um título,
✓ uma descrição,
✓ uma data de início e data de término,
✓ uma situação (Em andamento, Concluído, Cancelado),
✓ e é coordenado por um docente da universidade.
```
- Um docente pode coordenar vários projetos, mas cada projeto tem apenas um
coordenador principal.
2. Participantes

```
✓ Os projetos contam com participantes que podem ser docentes, discentes ou
técnicos-administrativos.
✓ Para cada participante é necessário registrar:
nome, e-mail institucional, CPF e tipo (Docente, Discente ou Técnico).
```

```
Um mesmo participante pode atuar em vários projetos (inclusive simultaneamente).
✓ Para cada vínculo com um projeto, deve-se registrar:
```
- função desempenhada (Coordenador, Bolsista, Colaborador etc.)
- período de participação (data de entrada e de saída).
3. Financiamentos

```
✓ Um projeto pode ter nenhum ou vários financiamentos.
✓ Cada financiamento possui:
```
- uma agência financiadora (por exemplo: CNPq, FAPES, CAPES),
- o tipo de fomento (Bolsa, Auxílio, Convênio etc.),
- o valor total e o período de vigência.
- Um mesmo financiamento pode apoiar vários projetos, total ou parcialmente.
4. Produções Científicas

```
✓ Cada projeto pode gerar múltiplas produções científicas, como artigos,
capítulos de livro, softwares ou relatórios técnicos.
✓ Para cada produção devem ser armazenados:
```
- título, tipo de produção, ano de publicação e meio de divulgação (revista,
    congresso, repositório etc.).
- As produções podem ter um ou mais autores, todos cadastrados como
    participantes do sistema.
5. Outros Requisitos

O sistema deve permitir consultar:

```
✓ todos os projetos coordenados por um determinado docente;
✓ os participantes de um projeto;
✓ as produções vinculadas a cada projeto;
✓ e os financiamentos de cada agência.
```
Tarefas Sugeridas para o Trabalho

Primeira Tarefa:

Levantamento e análise dos requisitos – data:27/11/

Identificação dos requisitos

a)funcionais,

b) não funcionais e

c) regras de negócio


1) Construir o Modelo de caso de Uso – Data: 27/11/

```
a) Diagrama de Caso de Uso
b) Descrição dos Casos de Uso
```
```
2) Construir o Modelo de Classes baseado na etapa anterior – Data:
a) Diagrama de Classes
b) Descrição dos elemntos do modelo de classes
```
```
3) Criar a interface para entrada de dados – Data:
```
```
4) Criar o Modelo de dados
```
```
Modelagem Conceitual:
Construir o Modelo Entidade-Relacionamento (MER) com cardinalidades e atributos.
```
```
Modelagem Lógica
Modelo Relacional
```
```
Modelo Físico:
Implementar o esquema em um SGBD (MySQL).
a) Apresentação do script para criação do banco de dados
b) Consultas SQL:
o Criar consultas, por exemplo:
▪ Listar todos os projetos com seus coordenadores.
▪ Mostrar as produções científicas de um determinado ano.
▪ Exibir o total de financiamento por agência.
▪ Listar participantes que atuam em mais de um projeto.
```

Estrutura do Relatório Final

1. Capa e Identificação
- Nome da disciplina, turma, instituição e semestre.
- Nome completo e matrícula dos integrantes do grupo.
- Título do projeto.
2. Introdução
- Contextualização do problema a ser resolvido.
- Objetivos do sistema proposto (geral e específicos).
- Escopo do projeto: quais informações o sistema gerencia e quais não estão
contempladas.
- Identificação das tecnologias usadas no desenvolvimento (por exemplo:
linguagem de programação, ferramenta de construção de diagramas, ferramenta
para construção de container (opcional), e outras...)
3. Requisitos e Modelos
- Identificação dos Requisitos funcionais, não funcionais e regras de negócio
- Modelo de Caso de Uso
- Modelo de Classes
4. Modelagem Conceitual
- Apresentação do Modelo Entidade-Relacionamento (MER) com:

o Entidades, atributos e relacionamentos.

o Cardinalidades corretamente indicadas.

o Chaves primárias destacadas.

- O diagrama deve ser legível, coerente e completo.
5. Modelagem Lógica
- Modelo Relacional.
- Indicação de:


o Tabelas resultantes, atributos e tipos de dados.

o Chaves primárias e estrangeiras.

o Relacionamentos implementados

6. Implementação Física
- Script SQL com:

o Criação do banco de dados e tabelas (CREATE TABLE).

o Inserção de dados de exemplo (INSERT INTO).

- Registro de eventuais ajustes no modelo após testes de criação.
7. Consultas SQL
- Criação de consultas práticas e significativas, demonstrando domínio do
modelo.
- Sugestões:

o Projetos com seus respectivos coordenadores.

o Participantes que atuam em mais de um projeto.

o Produções científicas por tipo e ano.

8. Considerações Finais
- Reflexão sobre o processo de modelagem e implementação.
- Desafios enfrentados e soluções adotadas.
- Sugestões de evolução do sistema (por exemplo, criação de uma interface ou
relatórios).

Critérios de Avaliação

```
Critério Descrição
Peso
(%)
```
1. Clareza e coerência da
introdução

```
Contextualização do problema e definição de
objetivos.
```
## 10%


```
Critério Descrição
Peso
(%)
```
2. Levantamento de
requisitos

```
Correção, completude e consistência das
entidades e regras de negócio.
```
## 10%

3. Modelagem conceitual
(MER)

```
Correção do diagrama, cardinalidades, chaves
e atributos.
```
## 20%

4. Modelagem lógica modelo relacional. 20%
5. Implementação física
(SQL)

```
Scripts corretos, coerentes e executáveis em
SGBD.
```
## 15%

6. Consultas SQL
    Complexidade e pertinência das consultas
    elaboradas.

## 15%

7. Apresentação e
documentação

```
Organização, formatação, clareza textual e
padronização do relatório.
```
## 10%

Total: 10 pontos

Observações

- O trabalho pode ser realizado em equipe de no mínimo três alunos.
- Todos os integrantes devem participar da apresentação oral (10– 15
minutos).
- A entrega deve incluir:

o Arquivo PDF do relatório;

o Script SQL de criação e carga inicial de dados;

o Todos os alunos devem enviar o trabalho final na plataforma Classroom no
dia 2 9 /01/


