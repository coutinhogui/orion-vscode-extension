"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
exports.openFirstUseGuideCommand = openFirstUseGuideCommand;
exports.diagnoseAiCommand = diagnoseAiCommand;
exports.setupWorkspaceCommand = setupWorkspaceCommand;
exports.reviewCurrentFileCommand = reviewCurrentFileCommand;
exports.createDatabricksPipelineCommand = createDatabricksPipelineCommand;
exports.generateCopilotInstructionsCommand = generateCopilotInstructionsCommand;
exports.generateTechnicalDocumentationCommand = generateTechnicalDocumentationCommand;
exports.createDotnetApiCommand = createDotnetApiCommand;
exports.createBlazorPageCommand = createBlazorPageCommand;
exports.testOllamaConnectionCommand = testOllamaConnectionCommand;
exports.selectOllamaModelCommand = selectOllamaModelCommand;
exports.configureAiCommand = configureAiCommand;
const vscode = __importStar(require("vscode"));
const templates_1 = require("./templates");
const review_1 = require("./review");
const workspace_1 = require("./workspace");
const ollama_1 = require("./ollama");
const diagnostics_1 = require("./diagnostics");
const output_1 = require("./output");
const firstUseGuide_1 = require("./firstUseGuide");
function registerCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand('orion.openHelp', () => vscode.commands.executeCommand('orionHelp.focus')), vscode.commands.registerCommand('orion.openFirstUseGuide', openFirstUseGuideCommand), vscode.commands.registerCommand('orion.showLogs', output_1.showOrionLogs), vscode.commands.registerCommand('orion.setupWorkspace', setupWorkspaceCommand), vscode.commands.registerCommand('orion.reviewCurrentFile', reviewCurrentFileCommand), vscode.commands.registerCommand('orion.createDatabricksPipeline', createDatabricksPipelineCommand), vscode.commands.registerCommand('orion.generateCopilotInstructions', generateCopilotInstructionsCommand), vscode.commands.registerCommand('orion.generateTechnicalDocumentation', generateTechnicalDocumentationCommand), vscode.commands.registerCommand('orion.createDotnetApi', createDotnetApiCommand), vscode.commands.registerCommand('orion.createBlazorPage', createBlazorPageCommand), vscode.commands.registerCommand('orion.testOllamaConnection', testOllamaConnectionCommand), vscode.commands.registerCommand('orion.diagnoseAi', diagnoseAiCommand), vscode.commands.registerCommand('orion.configureAi', configureAiCommand), vscode.commands.registerCommand('orion.selectOllamaModel', selectOllamaModelCommand));
}
async function openFirstUseGuideCommand() {
    const guide = (0, firstUseGuide_1.buildFirstUseGuide)();
    const doc = await vscode.workspace.openTextDocument({ content: guide, language: 'markdown' });
    await vscode.window.showTextDocument(doc, { preview: false });
    (0, output_1.logOrion)('info', 'first use guide opened');
    return guide;
}
async function diagnoseAiCommand() {
    (0, output_1.logOrion)('info', 'ai diagnostics started');
    const mode = vscode.workspace.getConfiguration('orion.ai').get('mode', 'auto');
    const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get('baseUrl', 'http://localhost:11434');
    const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get('model', 'qwen2.5-coder:3b');
    const tags = await (0, ollama_1.probeOllamaConnection)(baseUrl);
    const resolvedModel = (0, ollama_1.chooseOllamaModel)(configuredModel, tags.models);
    (0, output_1.logOrion)('info', 'ollama tags probe finished', { ok: tags.ok, modelCount: tags.models.length, baseUrl });
    let completionOk = false;
    let completionMessage = 'Teste nao executado porque /api/tags falhou.';
    if (tags.ok && tags.models.length > 0) {
        const answer = await (0, ollama_1.generateOllamaResponse)(baseUrl, resolvedModel, 'Responda apenas OK.', 'Diagnostico ORION IA.');
        completionOk = /\bok\b/i.test(answer);
        completionMessage = completionOk ? 'OK' : `Resposta inesperada: ${answer.slice(0, 180)}`;
        (0, output_1.logOrion)(completionOk ? 'info' : 'warn', 'ollama completion diagnostic finished', { ok: completionOk, model: resolvedModel });
    }
    const report = (0, diagnostics_1.buildAiDiagnosticsReport)({
        mode,
        baseUrl,
        configuredModel,
        resolvedModel,
        tagsOk: tags.ok,
        models: tags.models,
        completionOk,
        completionMessage
    });
    const doc = await vscode.workspace.openTextDocument({ content: report, language: 'markdown' });
    await vscode.window.showTextDocument(doc, { preview: false });
    return report;
}
async function setupWorkspaceCommand() {
    const written = await (0, workspace_1.writeGeneratedFiles)((0, templates_1.buildWorkspaceSetupFiles)((0, workspace_1.getDefaultDataBase)()), (0, workspace_1.getOverwriteSetting)());
    const message = summarizeFiles('Workspace ORION configurado', written);
    vscode.window.showInformationMessage(message);
    return message;
}
async function reviewCurrentFileCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error('Nenhum arquivo aberto para revisao.');
    }
    const fileName = editor.document.fileName;
    if (!(0, review_1.isSupportedForReview)(fileName)) {
        throw new Error('Tipo de arquivo ainda nao suportado pela revisao ORION.');
    }
    const markdown = (0, review_1.formatReview)((0, review_1.reviewText)(fileName, editor.document.getText()));
    const doc = await vscode.workspace.openTextDocument({ content: markdown, language: 'markdown' });
    await vscode.window.showTextDocument(doc, { preview: false });
    return markdown;
}
async function createDatabricksPipelineCommand(name) {
    const value = name ?? await askName('Nome do pipeline Databricks');
    const written = await (0, workspace_1.writeGeneratedFiles)((0, templates_1.buildDatabricksPipelineFiles)(value, (0, workspace_1.getDefaultDataBase)()), (0, workspace_1.getOverwriteSetting)());
    const message = summarizeFiles('Pipeline Databricks ORION criado', written);
    vscode.window.showInformationMessage(message);
    return message;
}
async function generateCopilotInstructionsCommand() {
    const written = await (0, workspace_1.writeGeneratedFiles)([{ relativePath: '.github/copilot-instructions.md', content: (0, templates_1.buildCopilotInstructions)() }], (0, workspace_1.getOverwriteSetting)());
    const message = summarizeFiles('Copilot instructions geradas', written);
    vscode.window.showInformationMessage(message);
    return message;
}
async function generateTechnicalDocumentationCommand() {
    const written = await (0, workspace_1.writeGeneratedFiles)((0, templates_1.buildTechnicalDocumentation)((0, workspace_1.workspaceDisplayName)()), (0, workspace_1.getOverwriteSetting)());
    const message = summarizeFiles('Documentacao tecnica ORION criada', written);
    vscode.window.showInformationMessage(message);
    return message;
}
async function createDotnetApiCommand(name) {
    const value = name ?? await askName('Nome da API .NET 8');
    const written = await (0, workspace_1.writeGeneratedFiles)((0, templates_1.buildDotnetApiFiles)(value), (0, workspace_1.getOverwriteSetting)());
    const message = summarizeFiles('API .NET 8 ORION criada', written);
    vscode.window.showInformationMessage(message);
    return message;
}
async function createBlazorPageCommand(name) {
    const value = name ?? await askName('Nome da pagina Blazor');
    const written = await (0, workspace_1.writeGeneratedFiles)((0, templates_1.buildBlazorFiles)(value), (0, workspace_1.getOverwriteSetting)());
    const message = summarizeFiles('Pagina Blazor ORION criada', written);
    vscode.window.showInformationMessage(message);
    return message;
}
async function testOllamaConnectionCommand() {
    const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get('baseUrl', 'http://localhost:11434');
    const model = vscode.workspace.getConfiguration('orion.ollama').get('model', 'qwen2.5-coder:3b');
    const result = await (0, ollama_1.probeOllamaConnection)(baseUrl);
    const hasModel = result.models.includes(model);
    const resolvedModel = (0, ollama_1.chooseOllamaModel)(model, result.models);
    const message = result.ok
        ? `Ollama conectado. Modelo configurado: ${model}. ${hasModel ? 'Modelo encontrado.' : `Modelo nao listado; a ORION usara ${resolvedModel}.`}`
        : 'Nao foi possivel conectar ao Ollama local.';
    (0, output_1.logOrion)(result.ok ? 'info' : 'warn', 'ollama connection test', { ok: result.ok, baseUrl, configuredModel: model, resolvedModel });
    vscode.window.showInformationMessage(message);
    return message;
}
async function selectOllamaModelCommand() {
    return await configureOllamaCommand();
}
async function configureAiCommand() {
    const currentMode = vscode.workspace.getConfiguration('orion.ai').get('mode', 'auto');
    const selected = await vscode.window.showQuickPick([
        { label: 'Ollama local', mode: 'ollama', description: currentMode === 'ollama' ? 'atual' : 'chat local com modelos instalados' },
        { label: 'Auto', mode: 'auto', description: currentMode === 'auto' ? 'atual' : 'tenta Ollama em conversa livre' },
        { label: 'Local', mode: 'local', description: currentMode === 'local' ? 'atual' : 'heuristicas sem modelo' },
        { label: 'Copilot', mode: 'copilot', description: currentMode === 'copilot' ? 'atual' : 'Language Model API do VS Code quando disponivel' }
    ], {
        title: 'Configurar IA da ORION',
        placeHolder: 'Escolha como a ORION deve responder'
    });
    if (!selected) {
        return 'Configuracao de IA cancelada.';
    }
    if (selected.mode === 'ollama') {
        return await configureOllamaCommand();
    }
    await vscode.workspace.getConfiguration('orion.ai').update('mode', selected.mode, vscode.ConfigurationTarget.Global);
    const message = `ORION configurada em modo ${selected.mode}.`;
    vscode.window.showInformationMessage(message);
    return message;
}
async function configureOllamaCommand() {
    const ollamaConfig = vscode.workspace.getConfiguration('orion.ollama');
    const aiConfig = vscode.workspace.getConfiguration('orion.ai');
    const configuredBaseUrl = ollamaConfig.get('baseUrl', 'http://localhost:11434');
    const currentModel = ollamaConfig.get('model', 'qwen2.5-coder:3b');
    const baseUrl = await vscode.window.showInputBox({
        title: 'URL do Ollama',
        prompt: 'A ORION vai consultar /api/tags nesta URL.',
        value: configuredBaseUrl,
        placeHolder: 'http://localhost:11434'
    });
    if (!baseUrl?.trim()) {
        return 'Configuracao do Ollama cancelada.';
    }
    const result = await (0, ollama_1.probeOllamaConnection)(baseUrl);
    (0, output_1.logOrion)(result.ok ? 'info' : 'warn', 'ollama model selection probe', { ok: result.ok, baseUrl, modelCount: result.models.length });
    if (!result.ok) {
        const message = `Nao foi possivel consultar modelos em ${baseUrl}/api/tags.`;
        vscode.window.showWarningMessage(message);
        return message;
    }
    if (result.models.length === 0) {
        const message = `Ollama respondeu em ${baseUrl}/api/tags, mas nao retornou modelos instalados.`;
        vscode.window.showWarningMessage(message);
        return message;
    }
    const selected = await vscode.window.showQuickPick((0, ollama_1.buildOllamaModelQuickPickItems)(currentModel, result.modelInfos), {
        title: 'Selecionar modelo Ollama para ORION',
        placeHolder: 'Pesquise por nome, familia, tamanho ou versao retornada por /api/tags',
        matchOnDescription: true,
        matchOnDetail: true
    });
    if (!selected) {
        return 'Selecao de modelo Ollama cancelada.';
    }
    await aiConfig.update('mode', 'ollama', vscode.ConfigurationTarget.Global);
    await ollamaConfig.update('model', selected.label, vscode.ConfigurationTarget.Global);
    await ollamaConfig.update('baseUrl', baseUrl, vscode.ConfigurationTarget.Global);
    const testAnswer = await (0, ollama_1.generateOllamaResponse)(baseUrl, selected.label, 'Responda apenas OK.', 'Teste de configuracao ORION.');
    const tested = /\bok\b/i.test(testAnswer);
    const message = tested
        ? `ORION configurada para Ollama com modelo ${selected.label}. Teste do modelo OK.`
        : `ORION configurada para Ollama com modelo ${selected.label}. O modelo foi salvo, mas o teste nao retornou OK.`;
    vscode.window.showInformationMessage(message);
    return message;
}
async function askName(prompt) {
    const value = await vscode.window.showInputBox({ prompt, placeHolder: 'exemplo: risco credito' });
    if (!value?.trim()) {
        throw new Error('Operacao cancelada: informe um nome valido.');
    }
    return value.trim();
}
function summarizeFiles(prefix, files) {
    if (files.length === 0) {
        return `${prefix}: nenhum arquivo alterado porque todos ja existiam.`;
    }
    return `${prefix}: ${files.length} arquivo(s) gravado(s).`;
}
//# sourceMappingURL=commands.js.map