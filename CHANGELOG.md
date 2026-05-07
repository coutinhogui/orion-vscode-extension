# Changelog

## 0.1.10

- Reorganizado o painel ORION em seções recolhíveis no estilo explorer.
- Reduzidas ações rápidas duplicadas e movidas ações específicas para seus grupos.
- Adicionada seção `Instalação` com versão, caminho da extensão, storage e arquivo de configuração do workspace.

## 0.1.9

- Corrigida a configuracao de IA para salvar no escopo efetivo quando o workspace ja define `orion.ai.mode`.
- A escolha `Copilot` agora sobrescreve corretamente o `auto` de `.vscode/settings.json`, evitando que conversa livre continue resolvendo para Ollama.

## 0.1.8

- Adicionado comando `ORION: Guia Rapido de Primeiro Uso`.
- Adicionado guia em Markdown com fluxo de configuracao, teste do Ollama, conversa livre, recursos especificos e logs.
- Adicionado botao `Primeiro uso` no painel lateral.
- Atualizado README com fluxo de aceite do MVP apos instalar a VSIX.

## 0.1.7

- Adicionado canal de saida `ORION` para troubleshooting.
- Adicionado comando `ORION: Abrir Logs`.
- Registrados eventos de chat, modo de IA resolvido, selecao de recurso, probe do Ollama, diagnostico e fallbacks.
- Logs registram metadados e tamanho do prompt, sem gravar o prompt completo do usuario.

## 0.1.6

- Adicionado comando `ORION: Diagnosticar IA`.
- Diagnostico mostra modo, URL, modelo configurado, modelo efetivo, modelos detectados em `/api/tags` e teste de `/v1/chat/completions`.
- Adicionado botao `Diagnosticar IA` no painel lateral.

## 0.1.5

- Melhorada a qualidade das respostas em conversa livre com Ollama.
- Conversa livre agora chama o Ollama diretamente, sem etapa adicional de revisao que podia deixar respostas longas e artificiais.
- Ajustado prompt para perguntas comuns e nao tecnicas responderem em linguagem natural, curta e sem listas numeradas desnecessarias.
- Reduzido limite de tokens para respostas diretas, diminuindo verbosidade.

## 0.1.4

- Adicionada secao `IA ativa` no painel lateral com modo, modelo, servidor e status.
- O painel consulta as configuracoes reais da extensao e testa a conectividade com Ollama via `/api/tags`.
- O status do painel atualiza apos comandos de configuracao executados pelo webview.

## 0.1.3

- Corrigido fallback de conversa livre para nao esconder falhas do Ollama com resposta local generica.
- Respostas locais genericas agora indicam explicitamente que a ORION esta em modo local.
- Adicionado teste para garantir que conversa livre nao mascara falha do Ollama quando deveria responder via modelo.

## 0.1.2

- Tornada a configuracao de IA mais visivel e guiada.
- Adicionado botao de status bar `ORION IA` para abrir a selecao de modo/modelo.
- Atualizadas descricoes do Settings para deixar claro que `orion.ollama.model` e campo avancado/manual e que a selecao correta e pelo comando guiado.
- Renomeados comandos para `ORION: Configurar IA e Selecionar Modelo` e `ORION: Selecionar Modelo Ollama Instalado`.
- Atualizado painel lateral para destacar configuracao por selecao de modelos.

## 0.1.1

- Refeito o fluxo de configuracao de IA com escolha guiada de modo, pesquisa de modelos Ollama, detalhes de versao/tamanho/familia e teste automatico do modelo selecionado.
- Alterado o modelo Ollama padrao para `qwen2.5-coder:3b`.
- Adicionado historico recente da conversa ao request do Ollama para melhorar continuidade no chat.
- Limitado o tamanho das respostas do chat para reduzir verbosidade.
- Adicionado roteamento por linguagem natural para recursos como API, pipeline, revisao, setup, docs, padroes e checklist.
- Melhoradas respostas locais por area para evitar fallback generico repetitivo.
- Adicionada selecao automatica de modelo Ollama instalado quando o modelo configurado nao existe localmente.

## 0.1.0

- Criada extensao ORION para VS Code.
- Adicionado participante de chat `@orion`.
- Adicionado menu lateral ORION.
- Atualizado painel lateral com layout moderno, secoes de sessoes, acoes rapidas, templates e governanca.
- Aplicado tema visual inspirado na marca Bradesco principal, com vermelho institucional e linguagem geometrica.
- Adicionados comandos de setup, revisao, documentacao e templates.
- Adicionados templates Databricks bronze/silver/gold, .NET 8 Minimal API e Blazor.
- Adicionado modo local por padrao e modo opcional Copilot via Language Model API quando disponivel.
- Adicionado modo opcional Ollama local com teste de conexao pelo Command Palette.
