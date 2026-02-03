# Descrição de Casos de Uso

## CU01 - Autenticar / Login

**Ator primário:** Participante (Docente/Discente/Técnico), Docente (Coordenador), Administrador.

**Objetivo:** Permitir acesso autenticado ao sistema com base em credenciais e papel do usuário.

**Pré-condições:** O usuário está cadastrado no sistema (ou existe um registro provisório).

**Pós-condições:** Sessão autenticada criada; permissões do ator carregadas. Em caso de falha, nenhuma sessão é criada e é exibida mensagem de erro.

**Fluxo principal:** 1. Usuário acessa a tela de login. 2. Usuário informa identificador (e-mail/CPF/usuário) e senha. 3. Sistema valida credenciais e carrega perfil (papel/permissões). 4. Sistema redireciona para a área inicial apropriada ao papel.

**Fluxos alternativos / Exceções:** - Credenciais inválidas → sistema informa erro e permite nova tentativa. - Conta bloqueada/desativada → mensagem informativa; sugere contato com administrador. - Esqueci senha → fluxo de recuperação (fora do escopo principal).

**Regras de negócio:** Máximo de tentativas antes do bloqueio; requisitos de senha; registro de tentativas para auditoria.

**Observações:** Caso pré-requisito para a maioria dos demais casos de uso que exigem autenticação.

## CU02 - Registrar Participante

**Ator primário:** Participante (auto-registro) / Docente (Coordenador) / Administrador

**Objetivo:** Criar/registrar um novo participante no sistema (docente, discente ou técnico).

**Pré-condições:** Ator realizou login (ou existe fluxo de auto-registro aberto).

**Pós-condições:** Participante cadastrado; pode receber credenciais ou aguardar aprovação, dependendo da política.

**Fluxo principal:** 1. Ator acessa formulário de cadastro de participante. 2. Preenche dados pessoais, vínculo (se houver), e-mail e função. 3. Sistema valida dados (formato, duplicidade). 4. Sistema cria conta e envia confirmação / notifica administrador para aprovação (se aplicável).

**Fluxos alternativos / Exceções:** - Dados incompletos/ inválidos → sistema solicita correção. - Conta já existente → opção de recuperação ou associação.

**Regras de negócio:** Verificação de duplicidade por CPF/e-mail; aprovação obrigatória para perfis com maior privilégio.

**Observações:** Pode existir processo de validação automática ou manual pelo Administrador.

## CU03 - Cadastrar Projeto

**Ator primário:** Docente (Coordenador), Administrador

**Ator secundário (incluído):** Vincular Participante a Projeto (função+período) - CU06 («include»)

**Objetivo:** Registrar um novo projeto de pesquisa/atividade no sistema com seus dados iniciais.

**Pré-condições:** Ator autenticado e autorizado (coordenador/administrador).

**Pós-condições:** Projeto criado com identificador único; registro inicial de participantes vinculado (se realizado).

**Fluxo principal:** 1. Ator abre formulário "Cadastrar Projeto". 2. Informa título, resumo, área, datas previstas, verba prevista, agência (se houver) e coordenador. 3. Sistema valida campos obrigatórios e cria o projeto. 4. Sistema solicita vinculação de participantes (fluxo incluído: CU06). 5. Projeto fica disponível para consulta e atualização.

**Fluxos alternativos / Exceções:** - Campos obrigatórios ausentes → erro e retorno ao formulário. - Projeto semelhante/duplicado detectado → aviso para confirmação.

**Regras de negócio:** Um projeto deve ter um coordenador; datas coerentes (início < término); limite de participantes por regras institucionais.

**Observações:** CU06 (Vincular Participante) é chamado obrigatoriamente durante ou logo após cadastro.

## CU04 - Atualizar Projeto

**Ator primário:** Docente (Coordenador), Administrador

**Ator secundário (incluído):** Vincular Participante a Projeto (função+período) - CU06 («include», quando necessário)

**Objetivo:** Atualizar dados do projeto (descrição, datas, status, vinculação de participantes, financiamentos).

**Pré-condições:** Projeto existe; ator autenticado e autorizado.

**Pós-condições:** Alterações persistidas; histórico de versões (se houver) atualizado.

**Fluxo principal:** 1. Ator acessa página do projeto e seleciona "Editar". 2. Realiza alterações necessárias (ex.: prolongar prazo, ajustar orçamento). 3. Sistema valida alterações e grava nova versão. 4. Se houver adição/remoção de participantes, invoca CU06 para registrar vínculo e período.

**Fluxos alternativos / Exceções:** - Tentativa de modificar campos restritos → mensagem de permissão negada. - Conflito em atualização concorrente → sistema informa e solicita revalidação.

**Regras de negócio:** Algumas mudanças (p.ex. alteração de coordenador) podem requerer aprovação do Administrador; alteração de datas pode ser limitada por regras da agência financiadora.

**Observações:** Deve manter histórico/registro de quem alterou o que e quando.

## CU05 - Consultar Projeto

**Ator primário:** Participante, Docente (Coordenador), Administrador

**Objetivo:** Visualizar informações e status de um projeto.

**Pré-condições:** Ator autenticado (ou acesso público se permitido).

**Pós-condições:** Informação exibida; sem alteração de dados.

**Fluxo principal:** 1. Ator acessa busca/consulta de projetos. 2. Informa critérios (título, coordenador, status, período) ou seleciona projeto na listagem. 3. Sistema exibe ficha do projeto com dados, participantes, produções e financiamentos associados.

**Fluxos alternativos / Exceções:** - Projeto restrito → somente partes autorizadas visualizam detalhes sensíveis. - Nenhum resultado → exibir mensagem e sugestão de novos critérios.

**Regras de negócio:** Restrições de visibilidade conforme classificação do projeto (confidencial, público).

**Observações:** Pode ser incluído nos relatórios consolidados (CU12).

## CU06 - Vincular Participante a Projeto (função + período) - «include»

**Ator primário:** Docente (Coordenador), Administrador

**Objetivo:** Registrar participação de um usuário em um projeto, indicando função (ex.: bolsista, pesquisador, técnico) e período de vínculo.

**Pré-condições:** Projeto e participante já cadastrados.

**Pós-condições:** Vínculo salvo; participante passa a constar no projeto com função e validade.

**Fluxo principal:** 1. Ator seleciona projeto e escolhe "Vincular participante". 2. Seleciona participante existente e informa função, data início e término, percentuais de dedicação (se aplicável). 3. Sistema valida (conflitos de período, duplicidade) e grava vínculo.

**Fluxos alternativos / Exceções:** - Participante inexistente → opção para registrar participante (CU02). - Conflito de período ou excesso de carga → aviso e bloqueio conforme regra.

**Regras de negócio:** Limites de carga horária; funções definidas por catálogo institucional; necessidade de justificativa para períodos sobrepostos.

**Observações:** CU06 é _incluído_ por CU03 e CU04.

## CU07 - Registrar Produção

**Ator primário:** Participante (Docente/Discente/Técnico), Docente (Coordenador)

**Ator secundário (incluído):** Associar Autores a Produção - CU08 («include»)

**Objetivo:** Registrar produções científicas/tecnológicas (artigos, capítulos, patentes, relatórios) vinculadas a participantes e projetos.

**Pré-condições:** Usuário autenticado; participante já cadastrado; projeto (opcional) existente para vinculação.

**Pós-condições:** Produção registrada e vinculada aos autores e, se aplicável, ao projeto.

**Fluxo principal:** 1. Ator acessa o formulário "Registrar Produção". 2. Preenche dados (tipo, título, veículo, ano, DOI, resumo) e seleciona autores (invoca CU08). 3. Indica vínculo a projetos e, se necessário, classifica financiamento/agradecimentos. 4. Sistema valida e grava produção.

**Fluxos alternativos / Exceções:** - Produção já cadastrada (duplicidade) → sistema alerta; confirmação do usuário. - Autor não cadastrado → opção de registrar autor (CU02) ou associar manualmente.

**Regras de negócio:** Ordem de autoria e contribuições devem ser registradas; normas de formatação conforme tipo de produção.

**Observações:** CU08 (Associar Autores) é _incluído_ para garantir autoria correta.

## CU08 - Associar Autores a Produção - «include»

**Ator primário:** Participante (autoria) / Docente (Coordenador) / Administrador

**Objetivo:** Definir e registrar os autores/colaboradores de uma produção com suas contribuições e ordem.

**Pré-condições:** Produção em processo de registro; autores cadastrados como participantes.

**Pós-condições:** Lista de autores salva com função/contribuição e ordem.

**Fluxo principal:** 1. Ator seleciona produção em cadastro/edição. 2. Adiciona participantes como autores, define ordem e contribuição. 3. Sistema grava associação.

**Fluxos alternativos / Exceções:** - Autor externo não cadastrado → opção de cadastro externo ou registro livre (dependendo da política). - Conflito na ordem de autoria → sistema permite rearranjo antes de salvar.

**Regras de negócio:** Respeitar políticas institucionais sobre autoria (ex.: todos os autores devem aceitar ser listados).

**Observações:** Sempre chamado por CU07.

## CU09 - Registrar Financiamento

**Ator primário:** Agência (Financiadora) / Administrador.

**Objetivo:** Registrar um registro de financiamento (concessão, bolsa, recurso) no sistema.

**Pré-condições:** Agência ou usuário autorizado autenticado.

**Pós-condições:** Registro de financiamento criado com referência à agência, valores, período e condição.

**Fluxo principal:** 1. Ator preenche formulário de financiamento (agência, número do processo, valor, vigência, finalidade). 2. Sistema valida e registra o financiamento. 3. Registro fica disponível para associação a projetos (CU10) ou consulta.

**Fluxos alternativos / Exceções:** - Dados incompletos → solicitação de correção. - Financiamento já registrado → aviso de duplicidade.

**Regras de negócio:** Valores e datas coerentes; vinculação a projetos apenas por atores autorizados.

**Observações:** Após registro, um ator autorizado (normalmente Administrador ou Coordenador) pode associar esse financiamento a um projeto (CU10).

## CU10 - Associar Financiamento a Projeto

**Ator primário:** Administrador

**Ator secundário:** (pré-requisito) Registro de financiamento existente (CU09)

**Objetivo:** Vincular um financiamento registrado a um ou mais projetos específicos.

**Pré-condições:** Financiamento registrado (CU09); projeto cadastrado (CU03).

**Pós-condições:** Registro de vínculo (valor alocado, período, finalidade) persistido no projeto.

**Fluxo principal:** 1. Ator seleciona projeto e escolhe "Associar financiamento". 2. Seleciona financiamento existente e informa parcela alocada ao projeto, datas e condições. 3. Sistema grava associação e atualiza saldo/relatórios orçamentários.

**Fluxos alternativos / Exceções:** - Financiamento insuficiente ou incompatível com finalidade → bloqueio e notificação. - Necessidade de aprovação da agência → marcação como pendente até confirmação.

**Regras de negócio:** Restrições de uso do recurso conforme contrato; necessidade de comprovação/aprovação para liberação.

**Observações:** Dependendo do fluxo institucional, este caso pode ser acionado logo após CU09 ou por separado.

## CU11 - Encerrar / Cancelar Projeto

**Ator primário:** Administrador, Docente (Coordenador)

**Objetivo:** Encerrar formalmente um projeto (conclusão) ou cancelá-lo (interrupção).

**Pré-condições:** Projeto existente; relatórios finais e prestação de contas (se exigido) providenciados.

**Pós-condições:** Projeto recebe status "Encerrado" ou "Cancelado"; registros finais arquivados; liberação/ajuste de financiamentos se necessário.

**Fluxo principal:** 1. Ator inicia processo de encerramento/cancelamento. 2. Sistema solicita confirmação e checklist (relatórios, entrega de produção, prestação de contas). 3. Ator anexa documentos e confirma. 4. Sistema valida checklist e altera status do projeto.

**Fluxos alternativos / Exceções:** - Checklist incompleto → impede encerramento; exibe itens pendentes. - Pendências financeiras → bloqueio até liquidação ou autorização administrativa.

**Regras de negócio:** Encerramento exige documentos obrigatórios; cancelamento pode exigir justificativa e aprovação do Administrador.

**Observações:** A ação pode gerar notificações para participantes e agência financiadora.

## CU12 - Relatórios / Consultas

**Ator primário:** Docente (Coordenador), Administrador.

**Objetivo:** Gerar relatórios e consultas agregadas (projetos por área, produções por período, financiamentos, participantes ativos etc.).

**Pré-condições:** Usuário autenticado e autorizado conforme o tipo de relatório.

**Pós-condições:** Relatório gerado em tela e/ou exportado (PDF/CSV); possível agendamento de relatórios periódicos.

**Fluxo principal:** 1. Ator escolhe tipo de relatório e filtros (período, área, status, coordenador). 2. Sistema executa consulta e renderiza relatório. 3. Ator pode exportar ou salvar template de consulta.

**Fluxos alternativos / Exceções:** - Falta de permissões para dados sensíveis → resultado parcial ou bloqueado. - Consulta lenta → possibilidade de exportação assíncrona (se implementado).

**Regras de negócio:** Acessos diferenciados por papel; registros sensíveis mascarados conforme política.

**Observações:** Ferramenta importante para prestação de contas e acompanhamento.