# ORION

ORION - Orquestrador de Riscos, Integracoes, Operacoes e Normas.

Extensao interna para VS Code voltada a equipes de engenharia de dados em banco com foco em riscos financeiros. A extensao funciona localmente por padrao, sem backend externo, sem secrets e sem acesso real a Databricks, producao ou APIs internas.

## Recursos

- Participante de chat `@orion` no Chat do VS Code/Copilot.
- Menu lateral ORION com ajuda e boas-vindas.
- Comandos no Command Palette.
- Setup automatico de workspace.
- Geracao de `.github/copilot-instructions.md`.
- Revisao local do arquivo atual.
- Templates Databricks, .NET 8 Minimal API, Blazor, documentacao tecnica e padroes de engenharia.
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

Quando nao houver um recurso aplicavel, a ORION responde como conversa livre via Ollama/Copilot quando configurado. Em fallback local, ela usa respostas especificas por area, como Databricks, .NET, Blazor e SQL.

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

## Primeiro uso apos instalar a VSIX

1. Recarregue a janela do VS Code/Cursor.
2. Execute `ORION: Guia Rapido de Primeiro Uso`.
3. Execute `ORION: Configurar IA e Selecionar Modelo`.
4. Escolha `Ollama local`.
5. Selecione `qwen2.5-coder:3b` na lista de modelos instalados.
6. Execute `ORION: Diagnosticar IA`.
7. Teste no chat: `@orion o que e natureza`.
8. Teste um recurso especifico: `@orion crie uma API para risco credito`.
9. Se algo parecer errado, execute `ORION: Abrir Logs`.

## Configuracoes

- `orion.ai.mode`: `auto`, `local`, `copilot` ou `ollama`. Padrao: `auto`. Em conversa livre, `auto` tenta Ollama; `local` nunca chama IA externa/local de modelo.
- `orion.ollama.baseUrl`: URL do Ollama local. Padrao: `http://localhost:11434`.
- `orion.ollama.model`: modelo local, como `qwen2.5-coder:3b`. Padrao: `qwen2.5-coder:3b`.
- Se o modelo configurado nao estiver instalado, a ORION tenta usar automaticamente um modelo local disponivel, priorizando `qwen2.5-coder:3b`, `qwen2.5-coder:7b`, `qwen3.5`, `llama3.1:8b`, `granite-code:3b` e `gemma4:e2b`.
- `orion.ollama.autoFallbackToLocal`: volta para resposta local quando o Ollama falhar. Quando `false`, a ORION informa que o Ollama nao respondeu em vez de mascarar a falha. Padrao: `true`.
- `orion.templates.overwriteExistingFiles`: permite sobrescrever templates existentes. Padrao: `false`.
- `orion.workspace.defaultDataBase`: base logica usada nos templates Databricks. Padrao: `dev_riscos`.

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

A ORION consulta `${orion.ollama.baseUrl}/api/tags`, mostra os modelos instalados em uma lista e salva:

- `orion.ai.mode = ollama`
- `orion.ollama.model = <modelo selecionado>`
- `orion.ollama.baseUrl = <URL configurada>`

Depois de salvar, a ORION faz um teste rapido com o modelo selecionado e informa se ele respondeu.
