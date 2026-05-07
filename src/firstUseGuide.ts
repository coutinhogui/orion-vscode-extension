export function buildFirstUseGuide(): string {
  return `# ORION - Guia rapido de primeiro uso

## 1. Abrir o painel

Use \`Ctrl+Shift+P\` e execute:

- \`ORION: Abrir Ajuda\`

O painel lateral mostra a IA ativa, modelo configurado, servidor Ollama e atalhos principais.

## 2. Configurar IA sem digitar modelo manualmente

Use:

- \`ORION: Configurar IA e Selecionar Modelo\`

Escolha \`Ollama local\`. A ORION consulta:

- \`http://localhost:11434/api/tags\`

Depois ela mostra uma lista pesquisavel com os modelos instalados, incluindo familia, tamanho, parametros e versao quando o Ollama retornar esses dados.

## 3. Modelo recomendado para o MVP

Para o ambiente local inicial, use:

- \`qwen2.5-coder:3b\`

Se ele nao aparecer na lista, instale pelo terminal:

\`\`\`powershell
ollama pull qwen2.5-coder:3b
\`\`\`

Depois execute novamente \`ORION: Configurar IA e Selecionar Modelo\`.

## 4. Testar se o Ollama responde

Use:

- \`ORION: Testar Conexao Ollama\`
- \`ORION: Diagnosticar IA\`

O diagnostico valida \`/api/tags\`, modelo resolvido e uma chamada de chat simples.

## 5. Testar conversa livre

No chat do VS Code/Cursor:

\`\`\`text
@orion o que e natureza
@orion fale sobre vida de forma simples
@orion continue
\`\`\`

Quando o modo estiver em Ollama, a resposta deve vir do modelo local, nao do fallback local.

## 6. Testar recursos especificos da ORION

Use exemplos diretos:

\`\`\`text
@orion crie uma API para risco credito
@orion gerar pipeline Databricks fraude transacional
@orion revisar o arquivo aberto
@orion configurar workspace
@orion /checklist
\`\`\`

Pedidos de recurso devem acionar a funcionalidade especifica. Perguntas livres devem ir para o modelo configurado.

## 7. Ver logs quando algo parecer errado

Use:

- \`ORION: Abrir Logs\`

Os logs mostram modo resolvido, recurso detectado, modelo usado, probe do Ollama e fallback. A ORION registra tamanho do prompt, mas nao grava o texto completo da pergunta.

## Fluxo recomendado de aceite do MVP

1. Instalar a VSIX.
2. Recarregar a janela do VS Code/Cursor.
3. Abrir \`ORION: Configurar IA e Selecionar Modelo\`.
4. Selecionar \`qwen2.5-coder:3b\`.
5. Rodar \`ORION: Diagnosticar IA\`.
6. Perguntar \`@orion o que e natureza\`.
7. Testar um recurso especifico, como \`@orion crie uma API para risco credito\`.
8. Abrir \`ORION: Abrir Logs\` e confirmar que o caminho usado foi Ollama ou recurso ORION.
`;
}
