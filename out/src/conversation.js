"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConversationReply = buildConversationReply;
function buildConversationReply(prompt) {
    const normalized = prompt.toLowerCase().trim();
    if (!normalized || /^(oi|ol[aá]|hello|bom dia|boa tarde|boa noite)\b/.test(normalized)) {
        return [
            'Oi. Eu sou a ORION.',
            'Posso ajudar com setup do workspace, revisão de arquivos, templates Databricks, API .NET, Blazor, documentação e padrões.',
            'Se quiser seguir por comando, use `@orion /help`.'
        ].join('\n\n');
    }
    if (/(op[cç]?[ií]es|utilidades|o que voc[eê] faz|como voc[eê] pode me ajudar|ajuda)/.test(normalized)) {
        return [
            'Minhas utilidades principais são estas:',
            '- Configurar workspace com padrões da equipe.',
            '- Revisar o arquivo aberto com checklist local.',
            '- Gerar pipeline Databricks bronze/silver/gold.',
            '- Gerar API .NET 8 e página Blazor básicas.',
            '- Gerar documentação técnica e instruções do Copilot.',
            '- Resumir padrões de governança, segurança e performance.',
            '',
            'Se quiser, posso te mostrar exemplos por área: Databricks, .NET, Blazor, Python, SQL ou Java.'
        ].join('\n');
    }
    if (/(quais s[aã]o suas utilidades|suas fun[cç][oõ]es|o que faz|o que voc[eê] faz)/.test(normalized)) {
        return [
            'Eu atuo como assistente local da equipe de engenharia de dados.',
            'Consigo gerar estruturas, revisar arquivos, orientar padrões e preparar workspace.',
            'Também consigo operar com Ollama local se você colocar `orion.ai.mode = ollama`.'
        ].join('\n\n');
    }
    if (/(qual(is)? (a|as) op[cç][oõ]es|quais s[aã]o as op[cç][oõ]es|o que posso pedir|exemplos?)/.test(normalized)) {
        return [
            'Você pode pedir coisas em duas formas:',
            '1. Conversa livre, por exemplo: "como você me ajuda?"',
            '2. Comandos, por exemplo: `@orion /api risco credito`, `@orion /pipeline fraude`, `@orion /review`.',
            '',
            'Se quiser uma resposta mais objetiva, diga a área: Databricks, .NET, Blazor, SQL, Python ou Java.'
        ].join('\n');
    }
    if (/(databricks|delta|spark|bronze|silver|gold|pipeline|particion)/.test(normalized)) {
        return [
            'Para Databricks, eu seguiria este caminho:',
            '- Use bronze/silver/gold com `reference_date` como parametro de carga.',
            '- Use `partitionBy("reference_date")` quando a coluna for filtro recorrente e tiver cardinalidade adequada; evite particionar por IDs muito granulares.',
            '- Registre contagens antes/depois, validacao de schema, nulos e duplicidades.',
            '- Para criar a estrutura padrao, use `@orion /pipeline <nome>` ou peça em linguagem natural: "crie um pipeline Databricks para <nome>".'
        ].join('\n');
    }
    if (/(\.net|dotnet|api|minimal api|endpoint|controller|repository|service)/.test(normalized)) {
        return [
            'Para API .NET, eu separaria a entrega em endpoint, service, repository e DTO.',
            '- Use logs estruturados nas bordas de I/O.',
            '- Trate erro no endpoint sem expor detalhe interno.',
            '- Use consultas parametrizadas e configuracao por ambiente.',
            '- Para gerar um template, use `@orion /api <nome>` ou peça: "crie uma API para <nome>".'
        ].join('\n');
    }
    if (/(sql|query|consulta|select|join|indice|índice)/.test(normalized)) {
        return [
            'Para SQL, eu revisaria estes pontos:',
            '- Evite `SELECT *`; selecione colunas explicitamente.',
            '- Prefira parametros em vez de concatenar valores.',
            '- Valide filtros, joins, nulos, duplicidades e cardinalidade.',
            '- Se houver arquivo aberto, peça "revisar o arquivo aberto" para acionar a revisão local.'
        ].join('\n');
    }
    if (/(blazor|razor|pagina|p[aá]gina|componente)/.test(normalized)) {
        return [
            'Para Blazor, garanta uma pagina com estados reais:',
            '- Loading, erro, vazio e dados carregados.',
            '- Client/service separado da view.',
            '- Filtro ou acao principal funcionando.',
            '- Para gerar um template, use `@orion /blazor <nome>` ou peça: "crie uma pagina Blazor para <nome>".'
        ].join('\n');
    }
    return [
        'Estou em modo local e nao identifiquei um recurso ORION especifico para esse pedido.',
        'Para conversa livre como ChatGPT/Ollama, use `ORION: Configurar IA e Selecionar Modelo` e escolha `Ollama local`.',
        'Quando quiser usar um recurso, escreva diretamente algo como "crie uma API para risco credito", "gerar pipeline Databricks fraude" ou "revisar o arquivo aberto".'
    ].join('\n\n');
}
//# sourceMappingURL=conversation.js.map