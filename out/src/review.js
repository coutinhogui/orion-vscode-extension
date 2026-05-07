"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedForReview = isSupportedForReview;
exports.reviewText = reviewText;
exports.formatReview = formatReview;
const supportedExtensions = ['.py', '.sql', '.cs', '.java', '.razor', '.json', '.yml', '.yaml'];
function isSupportedForReview(fileName) {
    return supportedExtensions.some((extension) => fileName.toLowerCase().endsWith(extension));
}
function reviewText(fileName, text) {
    const lower = text.toLowerCase();
    const critical = [];
    const medium = [];
    const suggestions = [];
    const governance = [];
    const performance = [];
    const security = [];
    if (/(password|passwd|secret|token|client_secret|access_key)\s*[:=]/i.test(text)) {
        critical.push('Possivel secret hardcoded detectado. Remova credenciais do codigo e use cofre/variaveis seguras.');
        security.push('Validar se configuracoes sensiveis estao fora do repositorio e sem valores reais.');
    }
    if (/\bprod\b|producao|production/i.test(text)) {
        critical.push('Referencia a producao encontrada. Esta versao da ORION nao deve criar acesso real a ambientes produtivos.');
        governance.push('Confirmar segregacao de ambientes e ausencia de credenciais ou endpoints produtivos.');
    }
    if (/select\s+\*/i.test(text)) {
        performance.push('Evite SELECT *; selecione colunas explicitamente para reduzir custo e risco de mudanca de schema.');
    }
    if (/where\s+[^;\n]*(=|like)\s*['"`]/i.test(text)) {
        security.push('Prefira SQL parametrizado para reduzir risco de injecao e melhorar rastreabilidade.');
    }
    if (fileName.endsWith('.py') && !/logging|getLogger|logger\./i.test(text)) {
        medium.push('Adicionar logging estruturado para auditoria, observabilidade e troubleshooting.');
    }
    if (fileName.endsWith('.sql') && !/(count\(|quality|duplic|schema|not null)/i.test(text)) {
        governance.push('Adicionar validacoes de qualidade: schema, nulos, duplicidade e contagens antes/depois.');
    }
    if ((fileName.endsWith('.cs') || fileName.endsWith('.java')) && !/(try\s*\{|catch\s*\()/i.test(text)) {
        medium.push('Adicionar tratamento de erro explicito nas bordas de I/O, API, banco e integracoes.');
    }
    if (fileName.endsWith('.razor') && !/(loading|carregando|erro|empty|vazio)/i.test(lower)) {
        suggestions.push('Adicionar estados de loading, erro e lista vazia na pagina Blazor.');
    }
    if (fileName.endsWith('.json') || fileName.endsWith('.yml') || fileName.endsWith('.yaml')) {
        if (/password|secret|token/i.test(text)) {
            security.push('Arquivos de configuracao nao devem carregar secrets reais.');
        }
        governance.push('Validar padrao de configuracao por ambiente e revisao por pares antes de promover.');
    }
    if (!/(test|spec|validacao|quality|assert|pytest|xunit|junit)/i.test(text)) {
        suggestions.push('Adicionar ou referenciar testes automatizados/checklists de validacao para a entrega.');
    }
    return {
        fileName,
        critical,
        medium,
        suggestions,
        governance,
        performance,
        security,
        productionChecklist: [
            'Sem secrets, endpoints produtivos ou dados sensiveis no repositorio.',
            'Logs suficientes para auditoria sem expor PII ou informacoes bancarias sensiveis.',
            'Validacao de schema, duplicidade, nulos e contagem de registros quando houver dados.',
            'Execucao idempotente e reversivel quando aplicavel.',
            'Revisao por pares, testes automatizados e evidencia de homologacao antes de producao.'
        ]
    };
}
function formatReview(result) {
    const section = (title, items) => {
        const body = items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : '- Nenhum item encontrado pelo checklist local.';
        return `## ${title}\n${body}`;
    };
    return [
        `# Revisao ORION: ${result.fileName}`,
        section('Problemas criticos', result.critical),
        section('Problemas medios', result.medium),
        section('Sugestoes', result.suggestions),
        section('Riscos de governanca', result.governance),
        section('Riscos de performance', result.performance),
        section('Riscos de seguranca', result.security),
        section('Checklist de producao', result.productionChecklist)
    ].join('\n\n');
}
//# sourceMappingURL=review.js.map