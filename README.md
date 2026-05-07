# ORION

ORION - Orquestrador de Riscos, Integracoes, Operacoes e Normas.

Extensao interna para VS Code voltada a equipes de engenharia de dados em banco com foco em riscos financeiros. A extensao funciona localmente por padrao, sem backend externo, sem secrets e sem acesso real a Databricks, producao ou APIs internas.

Versao atual: `0.1.16`.

## Recursos

- Participante de chat `@orion` no Chat do VS Code/Copilot.
- Painel lateral ORION com secoes recolhiveis no estilo Explorer.
- Secao `IA ativa` sensivel ao modo selecionado: `auto`, `local`, `copilot` ou `ollama`.
- Secao `Instalacao` com versao, caminho da extensao instalada, storage e arquivo de configuracao do workspace.
- Comandos no Command Palette.
- Setup automatico de workspace.
- Geracao de `.github/copilot-instructions.md`.
- Revisao local do arquivo atual.
- Templates Databricks, .NET 8 Minimal API, Blazor, documentacao tecnica e padroes de engenharia.
- Modo padrao `orion.ai.mode = auto`.
- Modo `orion.ai.mode = local` para respostas e recursos locais sem provider de modelo.
- Modo opcional `orion.ai.mode = copilot` para tentar usar Language Model API quando disponivel.
- Modo opcional `orion.ai.mode = ollama` para usar um servidor local Ollama compatível com OpenAI.

## Comandos do chat

- `@orion /help`
- `@orion /setup`
- `@orion /review`
- `@orion /pipeline <nome>`
- `@orion /api <nome>`
- `@orion /blazor <nome>`
- `@orion /doc`
- `@orion /standards`
- `@orion /checklist`

Tambem e possivel usar linguagem natural para recursos claros:

- `@orion crie uma API para risco credito`
- `@orion gerar pipeline Databricks fraude transacional`
- `@orion revisar o arquivo aberto`
- `@orion configurar workspace`

Quando nao houver um recurso aplicavel, a ORION responde conforme o modo de IA selecionado. Em fallback local, ela usa respostas especificas por area, como Databricks, .NET, Blazor e SQL.

## Command Palette

- `ORION: Abrir Ajuda`
- `ORION: Guia Rapido de Primeiro Uso`
- `ORION: Abrir Logs`
- `ORION: Configurar Workspace`
- `ORION: Revisar Arquivo Atual`
- `ORION: Criar Pipeline Databricks`
- `ORION: Gerar Copilot Instructions`
- `ORION: Gerar Documentacao Tecnica`
- `ORION: Gerar API .NET 8 Basica`
- `ORION: Gerar Pagina Blazor Basica`
- `ORION: Configurar IA e Selecionar Modelo`
- `ORION: Testar Conexao Ollama`
- `ORION: Diagnosticar IA`
- `ORION: Selecionar Modelo Ollama Instalado`

## Instalar dependencias

```powershell
npm install
```

## Compilar

```powershell
npm run compile
```

No Windows, se o wrapper `npm.ps1` falhar por permissao no npm global, use:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run compile
```

## Testar

```powershell
npm test
```

Alternativa Windows:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' test
```

## Empacotar VSIX

```powershell
npm run package
```

Alternativa Windows:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run package
```

O arquivo `.vsix` gerado pode ser instalado no VS Code por `Extensions: Install from VSIX...`.

Alternativa via CLI do VS Code no Windows:

```powershell
& "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd" --install-extension .\orion-vscode-0.1.16.vsix --force
```

Para confirmar a versao instalada:

```powershell
& "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd" --list-extensions --show-versions | Select-String -Pattern 'orion|engenharia-riscos'
```

## Primeiro uso apos instalar a VSIX

1. Recarregue a janela do VS Code/Cursor.
2. Execute `ORION: Guia Rapido de Primeiro Uso`.
3. Execute `ORION: Configurar IA e Selecionar Modelo`.
4. Escolha o modo desejado: `Auto`, `Local`, `Copilot` ou `Ollama local`.
5. Abra o painel lateral ORION e confira a secao `IA ativa`.
6. Execute `ORION: Diagnosticar IA`.
7. Teste no chat: `@orion o que e natureza`.
8. Teste um recurso especifico: `@orion crie uma API para risco credito`.
9. Se algo parecer errado, execute `ORION: Abrir Logs`.

Se escolher `Ollama local`, a ORION tambem pede a URL base, consulta `/api/tags`, lista os modelos instalados e salva o modelo selecionado.

## Configuracoes

- `orion.ai.mode`: `auto`, `local`, `copilot` ou `ollama`. Padrao: `auto`.
- `orion.ollama.baseUrl`: URL do Ollama local. Padrao: `http://localhost:11434`.
- `orion.ollama.model`: modelo local, como `qwen2.5-coder:3b`. Padrao: `qwen2.5-coder:3b`.
- Se o modelo configurado nao estiver instalado, a ORION tenta usar automaticamente um modelo local disponivel, priorizando `qwen2.5-coder:3b`, `qwen2.5-coder:7b`, `qwen3.5`, `llama3.1:8b`, `granite-code:3b` e `gemma4:e2b`.
- `orion.ollama.autoFallbackToLocal`: volta para resposta local quando o Ollama falhar. Quando `false`, a ORION informa que o Ollama nao respondeu em vez de mascarar a falha. Padrao: `true`.
- `orion.docs.mode`: fonte governada de documentacao. Padrao: `internal`. Valores: `internal`, `off`.
- `orion.docs.endpoint`: endpoint HTTP da API interna de documentacao. Padrao vazio; sem endpoint a ORION nao chama a API.
- `orion.docs.requireCitations`: instrui a ORION a usar fontes internas citadas quando houver evidencias. Padrao: `true`.
- `orion.internet.mode`: politica de internet da ORION. Padrao: `off`. Valores: `off`, `ask`, `auto`.
- `orion.templates.overwriteExistingFiles`: permite sobrescrever templates existentes. Padrao: `false`.
- `orion.workspace.defaultDataBase`: base logica usada nos templates Databricks. Padrao: `dev_riscos`.

O comando guiado `ORION: Configurar IA e Selecionar Modelo` salva `orion.ai.mode`, `orion.ollama.model` e `orion.ollama.baseUrl` em **User Settings**. Isso evita erro de Folder Settings e deixa a escolha do modo consistente entre workspaces.

Se um workspace antigo tiver `orion.ai.mode` ou `orion.ollama.*` dentro de `.vscode/settings.json`, esse override local vence User Settings. Remova essas entradas do `.vscode/settings.json` para a escolha global voltar a aparecer corretamente.

### Modos de IA

| Modo | Comportamento | Secao `IA ativa` |
| --- | --- | --- |
| `auto` | Prioriza recursos ORION quando detecta intencao clara e usa a politica interna para conversa livre. | Mostra politica automatica, sem expor configuracao Ollama como se fosse o modo ativo. |
| `local` | Usa respostas locais e comandos ORION sem provider de modelo. | Mostra provider local e nao exibe modelo/servidor Ollama. |
| `copilot` | Usa a Language Model API do VS Code quando o Chat fornece `request.model`. Envia o pedido original, a resposta/base local da ORION e o historico recente. | Mostra Copilot como provider e nao exibe acoes Ollama. |
| `ollama` | Usa servidor Ollama local configurado. | Mostra servidor, modelo resolvido, status e acoes `Modelos Ollama` / `Testar Ollama`. |

O comando `ORION: Diagnosticar IA` tambem respeita o modo. Ele so testa `/api/tags` e `/v1/chat/completions` quando `orion.ai.mode = ollama`.

No modo `copilot`, a ORION nao chama Ollama. A resposta vem do modelo disponibilizado pelo VS Code/Copilot para o Chat, com streaming e fallback local caso esse modelo nao esteja disponivel. A politica `orion.internet.mode` controla se a ORION pode usar contexto externo: por padrao fica `off`, entao ela nao deve afirmar pesquisa na internet.

### Documentacao interna

A ORION prioriza documentacao interna quando `orion.docs.mode = internal`. Para ativar a consulta real, configure `orion.docs.endpoint` com uma API HTTP interna que aceite:

```json
{ "query": "texto da pergunta", "limit": 5 }
```

A API pode responder com `results`, `documents` ou `items`, contendo objetos com `title`, `source`, `url`, `content` ou `snippet`. Essas evidencias entram no prompt do modo `copilot` antes de qualquer contexto externo. Internet permanece separada e desligada por padrao.

## Painel lateral ORION

O painel lateral organiza as acoes em secoes recolhiveis:

- `Sessoes`: chat operacional, setup de workspace e revisao local.
- `Acoes rapidas`: primeiro uso, configurar IA, diagnosticar IA, abrir logs e gerar docs.
- `IA ativa`: detalhes e acoes dinamicas conforme o modo selecionado.
- `Templates`: Databricks pipeline, .NET 8 API e Blazor page.
- `Governanca`: lembretes de secrets, dados sensiveis e qualidade de dados.
- `Instalacao`: versao, pasta instalada, storage e caminho do `.vscode/settings.json`.

Os caminhos exibidos em `Instalacao` ajudam a verificar onde a extensao esta instalada e qual arquivo de configuracao do workspace esta sendo considerado.

## Garantias da primeira versao

- Sem acesso a producao.
- Sem secrets.
- Sem chamadas a Databricks real.
- Sem APIs internas.
- Fallback local para toda funcionalidade de IA.

## Ollama

```powershell
ollama pull qwen2.5-coder:3b
```

Depois mude `orion.ai.mode` para `ollama`. Se necessario, ajuste `orion.ollama.model` e `orion.ollama.baseUrl`.

## Testar conexao Ollama

Use o comando `ORION: Testar Conexao Ollama` para validar o servidor local e o modelo configurado.

## Configurar IA e selecionar modelo Ollama

Use `ORION: Configurar IA` ou o botao `Configurar IA` no painel lateral para escolher o modo de resposta por lista:

- Ollama local.
- Auto.
- Local.
- Copilot.

Ao escolher Ollama, a ORION pede a URL base, consulta `${orion.ollama.baseUrl}/api/tags`, mostra uma lista pesquisavel com os modelos instalados e exibe detalhes retornados pelo Ollama, como familia, tamanho de parametros, quantizacao, tamanho em disco e data de atualizacao.

Use `ORION: Selecionar Modelo Ollama` ou o botao `Modelos Ollama` para ir direto ao fluxo de modelos.

A ORION consulta `${orion.ollama.baseUrl}/api/tags`, mostra os modelos instalados em uma lista e salva em User Settings:

- `orion.ai.mode = ollama`
- `orion.ollama.model = <modelo selecionado>`
- `orion.ollama.baseUrl = <URL configurada>`

Depois de salvar, a ORION faz um teste rapido com o modelo selecionado e informa se ele respondeu.

## Notas da versao 0.1.16

- Adicionada camada de documentacao interna governada por `orion.docs.mode`, `orion.docs.endpoint` e `orion.docs.requireCitations`.
- O modo `copilot` passa a consultar a API interna de docs quando `orion.docs.mode = internal` e o endpoint estiver configurado.
- Evidencias internas retornadas pela API entram no prompt antes de qualquer contexto externo; internet continua `off` por padrao.

## Notas da versao 0.1.15

- Adicionada configuracao `orion.internet.mode` com padrao `off`.
- O prompt do modo `copilot` agora recebe explicitamente a politica de internet.
- Com internet `off`, a ORION instrui o Copilot a nao afirmar pesquisa web e a avisar quando o pedido exigir fonte atual externa.

## Notas da versao 0.1.14

- O modo `copilot` agora envia o pedido original, a resposta/base local e o historico recente para o VS Code Language Model API.
- A resposta do Copilot e transmitida em streaming no chat.
- Foram adicionados logs especificos para confirmar quando o Copilot foi chamado e quando caiu para fallback local.

## Notas da versao 0.1.11

- A secao `IA ativa` agora caminha junto com o modo selecionado.
- `Auto`, `Local` e `Copilot` nao mostram mais configuracoes ou acoes de Ollama.
- `ORION: Diagnosticar IA` evita testes Ollama quando o modo ativo nao e `ollama`.

## Notas da versao 0.1.13

- `ORION: Configurar IA e Selecionar Modelo` passa a salvar escolhas de IA em User Settings.
- O template `ORION: Configurar Workspace` nao grava mais `orion.ai.mode` nem `orion.ollama.*` em `.vscode/settings.json`.
- Quando um override antigo no workspace ainda vence o valor de usuario, a ORION avisa para remover a entrada local.
