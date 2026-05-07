"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInternalDocsContext = buildInternalDocsContext;
exports.retrieveInternalDocs = retrieveInternalDocs;
function buildInternalDocsContext(results, requireCitations) {
    const usable = results
        .map((item, index) => formatInternalDoc(item, index + 1))
        .filter(Boolean);
    if (usable.length === 0) {
        return 'Documentacao interna ORION: nenhuma evidencia interna retornada.';
    }
    return [
        'Documentacao interna ORION:',
        requireCitations ? 'Use fontes internas citadas ao responder quando elas sustentarem a resposta.' : 'Use este contexto interno como apoio governado.',
        '',
        ...usable
    ].join('\n');
}
async function retrieveInternalDocs(endpoint, query, limit = 5) {
    const normalizedEndpoint = endpoint.trim();
    const normalizedQuery = query.trim();
    if (!normalizedEndpoint || !normalizedQuery) {
        return [];
    }
    const response = await fetch(normalizedEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: normalizedQuery, limit })
    });
    if (!response.ok) {
        throw new Error(`API interna de docs respondeu HTTP ${response.status}.`);
    }
    const payload = await response.json();
    return payload.results ?? payload.documents ?? payload.items ?? [];
}
function formatInternalDoc(item, index) {
    const title = item.title?.trim() || `Documento ${index}`;
    const source = item.source?.trim() || item.url?.trim() || 'fonte interna nao informada';
    const content = item.content?.trim() || item.snippet?.trim();
    if (!content) {
        return '';
    }
    return [`[${index}] ${title}`, `Fonte: ${source}`, content.slice(0, 1200)].join('\n');
}
//# sourceMappingURL=internalDocs.js.map