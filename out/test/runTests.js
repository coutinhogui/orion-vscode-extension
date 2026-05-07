"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_fs_1 = require("node:fs");
const naming_1 = require("../src/naming");
const review_1 = require("../src/review");
const templates_1 = require("../src/templates");
const helpHtml_1 = require("../src/helpHtml");
const ollama_1 = require("../src/ollama");
const conversation_1 = require("../src/conversation");
const aiMode_1 = require("../src/aiMode");
const resourceIntent_1 = require("../src/resourceIntent");
const diagnostics_1 = require("../src/diagnostics");
const logging_1 = require("../src/logging");
const firstUseGuide_1 = require("../src/firstUseGuide");
const aiStatus_1 = require("../src/aiStatus");
function testNormalizeName() {
    strict_1.default.equal((0, naming_1.normalizeName)('Risco Credito Banco'), 'risco-credito-banco');
    strict_1.default.equal((0, naming_1.normalizeName)('../Prod Secret'), 'prod-secret');
    strict_1.default.equal((0, naming_1.toPascalCase)('risco credito'), 'RiscoCredito');
}
function testReviewFindsSecurityAndPerformanceRisks() {
    const result = (0, review_1.reviewText)('consulta.sql', "select * from cliente where cpf = '123';\n-- password=abc");
    strict_1.default.ok(result.critical.some((item) => item.includes('secret')));
    strict_1.default.ok(result.performance.some((item) => item.includes('SELECT *')));
    strict_1.default.ok(result.security.some((item) => item.includes('SQL parametrizado')));
}
function testDatabricksPipelineTemplate() {
    const files = (0, templates_1.buildDatabricksPipelineFiles)('risco credito', 'dev_riscos');
    const paths = files.map((file) => file.relativePath);
    strict_1.default.ok(paths.includes('pipelines/risco-credito/01_bronze_risco-credito.py'));
    strict_1.default.ok(paths.includes('pipelines/risco-credito/data_quality.sql'));
    strict_1.default.ok(files.some((file) => file.content.includes('reference_date')));
    strict_1.default.ok(files.every((file) => !file.content.includes('prod_password')));
}
function testDotnetApiTemplate() {
    const files = (0, templates_1.buildDotnetApiFiles)('exposicao risco');
    strict_1.default.ok(files.some((file) => file.relativePath.endsWith('Program.cs')));
    strict_1.default.ok(files.some((file) => file.content.includes('MapGet')));
    strict_1.default.ok(files.some((file) => file.content.includes('ExposicaoRiscoDto')));
}
function testHelpViewHasModernSections() {
    const html = (0, helpHtml_1.renderOrionHelpHtml)();
    strict_1.default.ok(html.includes('Sessões'));
    strict_1.default.ok(html.includes('Ações rápidas'));
    strict_1.default.ok(html.includes('Templates'));
    strict_1.default.ok(html.includes('Governança'));
    strict_1.default.ok(html.includes('Instalação'));
    strict_1.default.ok(html.includes('IA verificando'));
    strict_1.default.ok(html.includes('<details open>'));
    strict_1.default.ok(html.includes('Configurar IA'));
    strict_1.default.ok(html.includes('Primeiro uso'));
    strict_1.default.ok(html.includes('Diagnosticar IA'));
    strict_1.default.ok(html.includes('Abrir logs'));
    strict_1.default.ok(html.includes('orion.diagnoseAi'));
    strict_1.default.ok(html.includes('orion.openFirstUseGuide'));
    strict_1.default.ok(html.includes('orion.showLogs'));
    strict_1.default.ok(html.includes('IA ativa'));
    strict_1.default.ok(html.includes('orion-ai-provider'));
    strict_1.default.ok(html.includes('orion-ai-details'));
    strict_1.default.ok(html.includes('orion-ai-actions'));
    strict_1.default.ok(html.includes('orion-extension-version'));
    strict_1.default.ok(html.includes('orion-extension-path'));
    strict_1.default.ok(html.includes('orion-workspace-config-path'));
    strict_1.default.ok(html.includes('getAiStatus'));
    strict_1.default.ok(html.includes('orion.configureAi'));
    strict_1.default.ok(html.includes('#CC092F'));
    strict_1.default.ok(html.includes('Riscos, integrações, operações e normas'));
}
function testWorkspaceSetupDoesNotPersistAiProviderSettings() {
    const settingsFile = (0, templates_1.buildWorkspaceSetupFiles)('dev_riscos').find((file) => file.relativePath === '.vscode/settings.json');
    strict_1.default.ok(settingsFile);
    const settings = JSON.parse(settingsFile.content);
    strict_1.default.equal(settings['orion.ai.mode'], undefined);
    strict_1.default.equal(settings['orion.ollama.baseUrl'], undefined);
    strict_1.default.equal(settings['orion.ollama.model'], undefined);
    strict_1.default.equal(settings['orion.ollama.autoFallbackToLocal'], undefined);
    strict_1.default.equal(settings['orion.workspace.defaultDataBase'], 'dev_riscos');
}
function testIconUsesBradescoInspiredPalette() {
    const icon = (0, node_fs_1.readFileSync)('resources/orion.svg', 'utf8');
    strict_1.default.ok(icon.includes('#CC092F'));
    strict_1.default.ok(icon.includes('ORION'));
}
function testOllamaHelpers() {
    strict_1.default.equal((0, ollama_1.normalizeOllamaBaseUrl)('http://localhost:11434'), 'http://localhost:11434');
    strict_1.default.equal((0, ollama_1.normalizeOllamaBaseUrl)('http://localhost:11434/'), 'http://localhost:11434');
    const request = (0, ollama_1.buildOllamaChatRequest)('llama3.2', 'resposta local', 'melhore isso');
    const direct = (0, ollama_1.buildOllamaChatRequest)('qwen2.5:3b', 'contexto local', 'quais são suas utilidades?', true);
    const continued = (0, ollama_1.buildOllamaChatRequest)('qwen2.5:3b', 'contexto local', 'continue', true, [
        { role: 'user', content: 'Fale sobre natureza.' },
        { role: 'assistant', content: 'A natureza organiza ciclos de vida.' }
    ]);
    const review = (0, ollama_1.buildOllamaReviewRequest)('qwen2.5:3b', 'contexto local', 'quais são suas utilidades?', 'rascunho');
    strict_1.default.equal(request.model, 'llama3.2');
    strict_1.default.equal(request.messages[0].role, 'system');
    strict_1.default.ok(request.messages[1].content.includes('resposta local'));
    strict_1.default.ok(request.messages[1].content.includes('melhore isso'));
    strict_1.default.ok(direct.messages[1].content.includes('Responda diretamente'));
    strict_1.default.ok(direct.messages[1].content.includes('quais são suas utilidades?'));
    strict_1.default.ok(direct.messages[1].content.includes('perguntas comuns'));
    strict_1.default.ok(direct.messages[1].content.includes('Evite lista numerada'));
    strict_1.default.equal(direct.max_tokens, 260);
    strict_1.default.ok(review.messages[1].content.includes('Avalie o rascunho'));
    strict_1.default.ok(review.messages[1].content.includes('rascunho'));
    strict_1.default.ok(direct.messages[1].content.includes('Catalogo de recursos ORION'));
    strict_1.default.ok(!direct.messages[1].content.includes('Melhore a resposta abaixo'));
    strict_1.default.equal(continued.messages[1].role, 'user');
    strict_1.default.equal(continued.messages[2].role, 'assistant');
    strict_1.default.ok(continued.messages[3].content.includes('continue'));
}
function testResourceIntentDetection() {
    strict_1.default.deepEqual((0, resourceIntent_1.detectResourceIntent)('crie uma api para risco credito'), { command: 'api', prompt: 'risco credito' });
    strict_1.default.deepEqual((0, resourceIntent_1.detectResourceIntent)('gerar pipeline databricks fraude transacional'), { command: 'pipeline', prompt: 'fraude transacional' });
    strict_1.default.deepEqual((0, resourceIntent_1.detectResourceIntent)('revisar o arquivo aberto'), { command: 'review', prompt: '' });
    strict_1.default.deepEqual((0, resourceIntent_1.detectResourceIntent)('configurar workspace'), { command: 'setup', prompt: '' });
    strict_1.default.equal((0, resourceIntent_1.detectResourceIntent)('explique particionamento em delta lake'), undefined);
}
function testAiModeResolutionKeepsExplicitLocalMode() {
    strict_1.default.equal((0, aiMode_1.resolveAiMode)('local', true), 'local');
    strict_1.default.equal((0, aiMode_1.resolveAiMode)('local', false), 'local');
    strict_1.default.equal((0, aiMode_1.resolveAiMode)('auto', true), 'ollama');
    strict_1.default.equal((0, aiMode_1.resolveAiMode)('auto', false), 'auto');
    strict_1.default.equal((0, aiMode_1.resolveAiMode)('ollama', true), 'ollama');
    strict_1.default.equal((0, aiMode_1.shouldFallbackToLocalAnswer)(true, true), false);
    strict_1.default.equal((0, aiMode_1.shouldFallbackToLocalAnswer)(true, false), false);
    strict_1.default.equal((0, aiMode_1.shouldFallbackToLocalAnswer)(false, true), true);
}
function testOllamaFallbackMessage() {
    const message = (0, ollama_1.buildOllamaFallbackMessage)('qwen2.5:3b', 'http://localhost:11434');
    strict_1.default.ok(message.includes('Nao foi possivel obter resposta do Ollama'));
    strict_1.default.ok(message.includes('qwen2.5:3b'));
    strict_1.default.ok(message.includes('http://localhost:11434'));
}
function testChooseOllamaModel() {
    strict_1.default.equal((0, ollama_1.chooseOllamaModel)('qwen2.5:3b', ['qwen2.5:3b', 'llama3.1:8b']), 'qwen2.5:3b');
    strict_1.default.equal((0, ollama_1.chooseOllamaModel)('qwen2.5:3b', ['qwen2.5-coder:3b', 'llama3.1:8b']), 'qwen2.5-coder:3b');
    strict_1.default.equal((0, ollama_1.chooseOllamaModel)('qwen2.5:3b', ['gemma4:e2b', 'llama3.1:8b', 'qwen2.5-coder:3b']), 'qwen2.5-coder:3b');
    strict_1.default.equal((0, ollama_1.chooseOllamaModel)('qwen2.5:3b', []), 'qwen2.5:3b');
}
function testBuildOllamaModelQuickPickItems() {
    const items = (0, ollama_1.buildOllamaModelQuickPickItems)('llama3.1:8b', [
        { model: 'gemma4:e2b', modified_at: '2026-04-27T01:10:20.2274426-03:00', size: 7162405886, details: { family: 'gemma4', parameter_size: '5.1B' } },
        { model: 'llama3.1:8b', modified_at: '2026-04-27T01:02:37.1611696-03:00', size: 4920753328, details: { family: 'llama', parameter_size: '8.0B' } },
        { model: 'qwen2.5-coder:3b', modified_at: '2026-04-09T02:55:30.6952272-03:00', size: 1929912626, details: { family: 'qwen2', parameter_size: '3.1B' } }
    ]);
    strict_1.default.deepEqual(items.map((item) => item.label), ['qwen2.5-coder:3b', 'llama3.1:8b', 'gemma4:e2b']);
    strict_1.default.equal(items[1].description, 'modelo atual');
    strict_1.default.equal(items[0].description, 'recomendado');
    strict_1.default.ok(items[0].detail?.includes('familia qwen2'));
    strict_1.default.ok(items[0].detail?.includes('3.1B'));
    strict_1.default.ok(items[0].detail?.includes('1.8 GB'));
}
function testConversationGreeting() {
    const greeting = (0, conversation_1.buildConversationReply)('Oi');
    const utilities = (0, conversation_1.buildConversationReply)('quais são suas utilidades');
    const databricks = (0, conversation_1.buildConversationReply)('como particionar uma tabela delta no Databricks?');
    strict_1.default.ok(greeting.includes('Eu sou a ORION'));
    strict_1.default.ok(greeting.includes('@orion /help'));
    strict_1.default.ok(utilities.includes('Minhas utilidades principais'));
    strict_1.default.ok(databricks.includes('Databricks'));
    strict_1.default.ok(databricks.includes('partition'));
    strict_1.default.ok(!databricks.includes('Entendi seu pedido'));
    strict_1.default.notEqual(greeting, utilities);
}
function testAiDiagnosticsReport() {
    const report = (0, diagnostics_1.buildAiDiagnosticsReport)({
        mode: 'ollama',
        baseUrl: 'http://localhost:11434',
        configuredModel: 'qwen2.5-coder:3b',
        resolvedModel: 'qwen2.5-coder:3b',
        tagsOk: true,
        models: ['qwen2.5-coder:3b', 'llama3.1:8b'],
        completionOk: true,
        completionMessage: 'OK'
    });
    strict_1.default.ok(report.includes('# Diagnostico ORION IA'));
    strict_1.default.ok(report.includes('Modo configurado'));
    strict_1.default.ok(report.includes('/api/tags'));
    strict_1.default.ok(report.includes('/v1/chat/completions'));
    strict_1.default.ok(report.includes('qwen2.5-coder:3b'));
    const copilotReport = (0, diagnostics_1.buildAiDiagnosticsReport)({
        mode: 'copilot',
        baseUrl: 'http://localhost:11434',
        configuredModel: 'qwen2.5-coder:3b',
        resolvedModel: 'qwen2.5-coder:3b',
        tagsOk: false,
        models: [],
        completionOk: false,
        completionMessage: 'Nao executado para modo Copilot.'
    });
    strict_1.default.ok(copilotReport.includes('Modo configurado: copilot'));
    strict_1.default.ok(copilotReport.includes('VS Code Language Model API'));
    strict_1.default.equal(copilotReport.includes('Servidor Ollama'), false);
    strict_1.default.equal(copilotReport.includes('/api/tags'), false);
}
function testAiPanelStatusIsModeSpecific() {
    const runtime = {
        version: '0.1.11',
        extensionPath: 'C:\\Users\\couti\\.vscode\\extensions\\engenharia-riscos.orion-vscode-0.1.11',
        globalStoragePath: 'C:\\Users\\couti\\AppData\\Roaming\\Code\\User\\globalStorage\\engenharia-riscos.orion-vscode',
        workspaceConfigPath: 'C:\\Users\\couti\\source\\orion-vscode-extension\\.vscode\\settings.json'
    };
    const copilot = (0, aiStatus_1.buildAiPanelStatus)({
        mode: 'copilot',
        baseUrl: 'http://localhost:11434',
        configuredModel: 'qwen2.5-coder:3b',
        runtime
    });
    strict_1.default.equal(copilot.providerLabel, 'Copilot');
    strict_1.default.equal(copilot.details.some((detail) => detail.label.includes('Ollama')), false);
    strict_1.default.equal(copilot.actions.some((action) => action.label.includes('Ollama')), false);
    const local = (0, aiStatus_1.buildAiPanelStatus)({
        mode: 'local',
        baseUrl: 'http://localhost:11434',
        configuredModel: 'qwen2.5-coder:3b',
        runtime
    });
    strict_1.default.equal(local.providerLabel, 'Local');
    strict_1.default.equal(local.details.some((detail) => detail.value.includes('qwen2.5-coder')), false);
    const auto = (0, aiStatus_1.buildAiPanelStatus)({
        mode: 'auto',
        baseUrl: 'http://localhost:11434',
        configuredModel: 'qwen2.5-coder:3b',
        runtime
    });
    strict_1.default.equal(auto.providerLabel, 'Auto');
    strict_1.default.equal(auto.details.some((detail) => detail.label.includes('Servidor')), false);
    strict_1.default.equal(auto.actions.some((action) => action.label.includes('Ollama')), false);
    const ollama = (0, aiStatus_1.buildAiPanelStatus)({
        mode: 'ollama',
        baseUrl: 'http://localhost:11434',
        configuredModel: 'qwen2.5-coder:3b',
        runtime,
        ollama: {
            ok: true,
            resolvedModel: 'qwen2.5-coder:3b',
            modelPresent: true,
            modelCount: 2
        }
    });
    strict_1.default.equal(ollama.providerLabel, 'Ollama');
    strict_1.default.equal(ollama.details.some((detail) => detail.label === 'Servidor'), true);
    strict_1.default.equal(ollama.actions.some((action) => action.command === 'orion.selectOllamaModel'), true);
}
function testLogFormattingDoesNotExposePrompt() {
    const summary = (0, logging_1.summarizeText)('um prompt sensivel com detalhes internos');
    strict_1.default.equal(summary, '40 chars');
    const entry = (0, logging_1.formatLogEntry)('info', 'ollama request', { prompt: summary, model: 'qwen2.5-coder:3b' });
    strict_1.default.ok(entry.includes('[INFO] ollama request'));
    strict_1.default.ok(entry.includes('qwen2.5-coder:3b'));
    strict_1.default.ok(!entry.includes('prompt sensivel'));
}
function testFirstUseGuideDocumentsMvpAcceptanceFlow() {
    const guide = (0, firstUseGuide_1.buildFirstUseGuide)();
    strict_1.default.ok(guide.includes('ORION - Guia rapido de primeiro uso'));
    strict_1.default.ok(guide.includes('http://localhost:11434/api/tags'));
    strict_1.default.ok(guide.includes('qwen2.5-coder:3b'));
    strict_1.default.ok(guide.includes('@orion o que e natureza'));
    strict_1.default.ok(guide.includes('ORION: Abrir Logs'));
    strict_1.default.ok(guide.includes('Fluxo recomendado de aceite do MVP'));
}
function run() {
    testNormalizeName();
    testReviewFindsSecurityAndPerformanceRisks();
    testDatabricksPipelineTemplate();
    testDotnetApiTemplate();
    testHelpViewHasModernSections();
    testWorkspaceSetupDoesNotPersistAiProviderSettings();
    testIconUsesBradescoInspiredPalette();
    testOllamaHelpers();
    testResourceIntentDetection();
    testAiModeResolutionKeepsExplicitLocalMode();
    testOllamaFallbackMessage();
    testChooseOllamaModel();
    testBuildOllamaModelQuickPickItems();
    testConversationGreeting();
    testAiDiagnosticsReport();
    testAiPanelStatusIsModeSpecific();
    testLogFormattingDoesNotExposePrompt();
    testFirstUseGuideDocumentsMvpAcceptanceFlow();
    console.log('ORION unit tests passed');
}
run();
//# sourceMappingURL=runTests.js.map