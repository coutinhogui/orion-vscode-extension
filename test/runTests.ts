import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeName, toPascalCase } from '../src/naming';
import { reviewText } from '../src/review';
import { buildDatabricksPipelineFiles, buildDotnetApiFiles, buildWorkspaceSetupFiles } from '../src/templates';
import { renderOrionHelpHtml } from '../src/helpHtml';
import { buildOllamaChatRequest, buildOllamaFallbackMessage, buildOllamaModelQuickPickItems, buildOllamaReviewRequest, chooseOllamaModel, normalizeOllamaBaseUrl } from '../src/ollama';
import { buildConversationReply } from '../src/conversation';
import { shouldFallbackToLocalAnswer, resolveAiMode } from '../src/aiMode';
import { detectResourceIntent } from '../src/resourceIntent';
import { buildAiDiagnosticsReport } from '../src/diagnostics';
import { formatLogEntry, summarizeText } from '../src/logging';
import { buildFirstUseGuide } from '../src/firstUseGuide';
import { buildAiPanelStatus } from '../src/aiStatus';
import { buildCopilotPrompt } from '../src/copilot';
import { buildInternalDocsContext } from '../src/internalDocs';

function testNormalizeName(): void {
  assert.equal(normalizeName('Risco Credito Banco'), 'risco-credito-banco');
  assert.equal(normalizeName('../Prod Secret'), 'prod-secret');
  assert.equal(toPascalCase('risco credito'), 'RiscoCredito');
}

function testReviewFindsSecurityAndPerformanceRisks(): void {
  const result = reviewText('consulta.sql', "select * from cliente where cpf = '123';\n-- password=abc");
  assert.ok(result.critical.some((item) => item.includes('secret')));
  assert.ok(result.performance.some((item) => item.includes('SELECT *')));
  assert.ok(result.security.some((item) => item.includes('SQL parametrizado')));
}

function testDatabricksPipelineTemplate(): void {
  const files = buildDatabricksPipelineFiles('risco credito', 'dev_riscos');
  const paths = files.map((file) => file.relativePath);
  assert.ok(paths.includes('pipelines/risco-credito/01_bronze_risco-credito.py'));
  assert.ok(paths.includes('pipelines/risco-credito/data_quality.sql'));
  assert.ok(files.some((file) => file.content.includes('reference_date')));
  assert.ok(files.every((file) => !file.content.includes('prod_password')));
}

function testDotnetApiTemplate(): void {
  const files = buildDotnetApiFiles('exposicao risco');
  assert.ok(files.some((file) => file.relativePath.endsWith('Program.cs')));
  assert.ok(files.some((file) => file.content.includes('MapGet')));
  assert.ok(files.some((file) => file.content.includes('ExposicaoRiscoDto')));
}

function testHelpViewHasModernSections(): void {
  const html = renderOrionHelpHtml();
  assert.ok(html.includes('Sessões'));
  assert.ok(html.includes('Ações rápidas'));
  assert.ok(html.includes('Templates'));
  assert.ok(html.includes('Governança'));
  assert.ok(html.includes('Instalação'));
  assert.ok(html.includes('IA verificando'));
  assert.ok(html.includes('<details open>'));
  assert.ok(html.includes('Configurar IA'));
  assert.ok(html.includes('Primeiro uso'));
  assert.ok(html.includes('Diagnosticar IA'));
  assert.ok(html.includes('Abrir logs'));
  assert.ok(html.includes('orion.diagnoseAi'));
  assert.ok(html.includes('orion.openFirstUseGuide'));
  assert.ok(html.includes('orion.showLogs'));
  assert.ok(html.includes('IA ativa'));
  assert.ok(html.includes('orion-ai-provider'));
  assert.ok(html.includes('orion-ai-details'));
  assert.ok(html.includes('orion-ai-actions'));
  assert.ok(html.includes('orion-extension-version'));
  assert.ok(html.includes('orion-extension-path'));
  assert.ok(html.includes('orion-workspace-config-path'));
  assert.ok(html.includes('getAiStatus'));
  assert.ok(html.includes('orion.configureAi'));
  assert.ok(html.includes('#CC092F'));
  assert.ok(html.includes('Riscos, integrações, operações e normas'));
}

function testWorkspaceSetupDoesNotPersistAiProviderSettings(): void {
  const settingsFile = buildWorkspaceSetupFiles('dev_riscos').find((file) => file.relativePath === '.vscode/settings.json');
  assert.ok(settingsFile);
  const settings = JSON.parse(settingsFile.content) as Record<string, unknown>;
  assert.equal(settings['orion.ai.mode'], undefined);
  assert.equal(settings['orion.ollama.baseUrl'], undefined);
  assert.equal(settings['orion.ollama.model'], undefined);
  assert.equal(settings['orion.ollama.autoFallbackToLocal'], undefined);
  assert.equal(settings['orion.workspace.defaultDataBase'], 'dev_riscos');
}

function testIconUsesBradescoInspiredPalette(): void {
  const icon = readFileSync('resources/orion.svg', 'utf8');
  assert.ok(icon.includes('#CC092F'));
  assert.ok(icon.includes('ORION'));
}

function testOllamaHelpers(): void {
  assert.equal(normalizeOllamaBaseUrl('http://localhost:11434'), 'http://localhost:11434');
  assert.equal(normalizeOllamaBaseUrl('http://localhost:11434/'), 'http://localhost:11434');

  const request = buildOllamaChatRequest('llama3.2', 'resposta local', 'melhore isso');
  const direct = buildOllamaChatRequest('qwen2.5:3b', 'contexto local', 'quais são suas utilidades?', true);
  const continued = buildOllamaChatRequest('qwen2.5:3b', 'contexto local', 'continue', true, [
    { role: 'user', content: 'Fale sobre natureza.' },
    { role: 'assistant', content: 'A natureza organiza ciclos de vida.' }
  ]);
  const review = buildOllamaReviewRequest('qwen2.5:3b', 'contexto local', 'quais são suas utilidades?', 'rascunho');
  assert.equal(request.model, 'llama3.2');
  assert.equal(request.messages[0].role, 'system');
  assert.ok(request.messages[1].content.includes('resposta local'));
  assert.ok(request.messages[1].content.includes('melhore isso'));
  assert.ok(direct.messages[1].content.includes('Responda diretamente'));
  assert.ok(direct.messages[1].content.includes('quais são suas utilidades?'));
  assert.ok(direct.messages[1].content.includes('perguntas comuns'));
  assert.ok(direct.messages[1].content.includes('Evite lista numerada'));
  assert.equal(direct.max_tokens, 260);
  assert.ok(review.messages[1].content.includes('Avalie o rascunho'));
  assert.ok(review.messages[1].content.includes('rascunho'));
  assert.ok(direct.messages[1].content.includes('Catalogo de recursos ORION'));
  assert.ok(!direct.messages[1].content.includes('Melhore a resposta abaixo'));
  assert.equal(continued.messages[1].role, 'user');
  assert.equal(continued.messages[2].role, 'assistant');
  assert.ok(continued.messages[3].content.includes('continue'));
}

function testResourceIntentDetection(): void {
  assert.deepEqual(detectResourceIntent('crie uma api para risco credito'), { command: 'api', prompt: 'risco credito' });
  assert.deepEqual(detectResourceIntent('gerar pipeline databricks fraude transacional'), { command: 'pipeline', prompt: 'fraude transacional' });
  assert.deepEqual(detectResourceIntent('revisar o arquivo aberto'), { command: 'review', prompt: '' });
  assert.deepEqual(detectResourceIntent('configurar workspace'), { command: 'setup', prompt: '' });
  assert.equal(detectResourceIntent('explique particionamento em delta lake'), undefined);
}

function testAiModeResolutionKeepsExplicitLocalMode(): void {
  assert.equal(resolveAiMode('local', true), 'local');
  assert.equal(resolveAiMode('local', false), 'local');
  assert.equal(resolveAiMode('auto', true), 'ollama');
  assert.equal(resolveAiMode('auto', false), 'auto');
  assert.equal(resolveAiMode('ollama', true), 'ollama');
  assert.equal(shouldFallbackToLocalAnswer(true, true), false);
  assert.equal(shouldFallbackToLocalAnswer(true, false), false);
  assert.equal(shouldFallbackToLocalAnswer(false, true), true);
}

function testCopilotPromptIncludesOriginalRequestAndHistory(): void {
  const docsContext = buildInternalDocsContext([
    {
      title: 'Padrao Databricks interno',
      source: 'docs/databricks.md',
      content: 'Use bronze, silver e gold com reference_date.'
    }
  ], true);
  const prompt = buildCopilotPrompt({
    command: '',
    userPrompt: 'pesquise boas praticas para delta lake',
    localAnswer: 'Resposta local limitada.',
    internetMode: 'off',
    internalDocsContext: docsContext,
    history: [
      { role: 'user', content: 'quero algo para Databricks' },
      { role: 'assistant', content: 'Podemos focar em bronze/silver/gold.' }
    ]
  });

  assert.ok(prompt.includes('Pedido original do usuario'));
  assert.ok(prompt.includes('pesquise boas praticas para delta lake'));
  assert.ok(prompt.includes('Resposta/base local da ORION'));
  assert.ok(prompt.includes('Resposta local limitada.'));
  assert.ok(prompt.includes('Historico recente'));
  assert.ok(prompt.includes('quero algo para Databricks'));
  assert.ok(prompt.includes('Responda diretamente ao pedido original'));
  assert.ok(prompt.includes('Politica de internet: off'));
  assert.ok(prompt.includes('Nao afirme que pesquisou na internet'));
  assert.ok(prompt.includes('Documentacao interna ORION'));
  assert.ok(prompt.includes('Padrao Databricks interno'));
  assert.ok(prompt.includes('Use fontes internas citadas'));
  assert.equal(prompt.includes('Melhore a resposta abaixo'), false);
}

function testDocsAndInternetDefaults(): void {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8')) as {
    contributes?: { configuration?: { properties?: Record<string, { default?: string | boolean; enum?: string[] }> } };
  };
  const internetMode = manifest.contributes?.configuration?.properties?.['orion.internet.mode'];
  assert.equal(internetMode?.default, 'off');
  assert.deepEqual(internetMode?.enum, ['off', 'ask', 'auto']);

  const docsMode = manifest.contributes?.configuration?.properties?.['orion.docs.mode'];
  assert.equal(docsMode?.default, 'internal');
  assert.deepEqual(docsMode?.enum, ['internal', 'off']);
  assert.equal(manifest.contributes?.configuration?.properties?.['orion.docs.endpoint']?.default, '');
  assert.equal(manifest.contributes?.configuration?.properties?.['orion.docs.requireCitations']?.default, true);
}

function testInternalDocsContextFormatsSources(): void {
  const context = buildInternalDocsContext([
    { title: 'Runbook ORION', source: 'runbooks/orion.md', content: 'Sempre validar governanca.' },
    { title: 'Template API', url: 'https://docs.interna/api', content: 'Use DTO e service.' }
  ], true);

  assert.ok(context.includes('Documentacao interna ORION'));
  assert.ok(context.includes('[1] Runbook ORION'));
  assert.ok(context.includes('Fonte: runbooks/orion.md'));
  assert.ok(context.includes('[2] Template API'));
  assert.ok(context.includes('Fonte: https://docs.interna/api'));
  assert.ok(context.includes('Use fontes internas citadas'));
}

function testOllamaFallbackMessage(): void {
  const message = buildOllamaFallbackMessage('qwen2.5:3b', 'http://localhost:11434');
  assert.ok(message.includes('Nao foi possivel obter resposta do Ollama'));
  assert.ok(message.includes('qwen2.5:3b'));
  assert.ok(message.includes('http://localhost:11434'));
}

function testChooseOllamaModel(): void {
  assert.equal(chooseOllamaModel('qwen2.5:3b', ['qwen2.5:3b', 'llama3.1:8b']), 'qwen2.5:3b');
  assert.equal(chooseOllamaModel('qwen2.5:3b', ['qwen2.5-coder:3b', 'llama3.1:8b']), 'qwen2.5-coder:3b');
  assert.equal(chooseOllamaModel('qwen2.5:3b', ['gemma4:e2b', 'llama3.1:8b', 'qwen2.5-coder:3b']), 'qwen2.5-coder:3b');
  assert.equal(chooseOllamaModel('qwen2.5:3b', []), 'qwen2.5:3b');
}

function testBuildOllamaModelQuickPickItems(): void {
  const items = buildOllamaModelQuickPickItems('llama3.1:8b', [
    { model: 'gemma4:e2b', modified_at: '2026-04-27T01:10:20.2274426-03:00', size: 7162405886, details: { family: 'gemma4', parameter_size: '5.1B' } },
    { model: 'llama3.1:8b', modified_at: '2026-04-27T01:02:37.1611696-03:00', size: 4920753328, details: { family: 'llama', parameter_size: '8.0B' } },
    { model: 'qwen2.5-coder:3b', modified_at: '2026-04-09T02:55:30.6952272-03:00', size: 1929912626, details: { family: 'qwen2', parameter_size: '3.1B' } }
  ]);
  assert.deepEqual(items.map((item) => item.label), ['qwen2.5-coder:3b', 'llama3.1:8b', 'gemma4:e2b']);
  assert.equal(items[1].description, 'modelo atual');
  assert.equal(items[0].description, 'recomendado');
  assert.ok(items[0].detail?.includes('familia qwen2'));
  assert.ok(items[0].detail?.includes('3.1B'));
  assert.ok(items[0].detail?.includes('1.8 GB'));
}

function testConversationGreeting(): void {
  const greeting = buildConversationReply('Oi');
  const utilities = buildConversationReply('quais são suas utilidades');
  const databricks = buildConversationReply('como particionar uma tabela delta no Databricks?');
  assert.ok(greeting.includes('Eu sou a ORION'));
  assert.ok(greeting.includes('@orion /help'));
  assert.ok(utilities.includes('Minhas utilidades principais'));
  assert.ok(databricks.includes('Databricks'));
  assert.ok(databricks.includes('partition'));
  assert.ok(!databricks.includes('Entendi seu pedido'));
  assert.notEqual(greeting, utilities);
}

function testAiDiagnosticsReport(): void {
  const report = buildAiDiagnosticsReport({
    mode: 'ollama',
    baseUrl: 'http://localhost:11434',
    configuredModel: 'qwen2.5-coder:3b',
    resolvedModel: 'qwen2.5-coder:3b',
    tagsOk: true,
    models: ['qwen2.5-coder:3b', 'llama3.1:8b'],
    completionOk: true,
    completionMessage: 'OK'
  });
  assert.ok(report.includes('# Diagnostico ORION IA'));
  assert.ok(report.includes('Modo configurado'));
  assert.ok(report.includes('/api/tags'));
  assert.ok(report.includes('/v1/chat/completions'));
  assert.ok(report.includes('qwen2.5-coder:3b'));

  const copilotReport = buildAiDiagnosticsReport({
    mode: 'copilot',
    baseUrl: 'http://localhost:11434',
    configuredModel: 'qwen2.5-coder:3b',
    resolvedModel: 'qwen2.5-coder:3b',
    tagsOk: false,
    models: [],
    completionOk: false,
    completionMessage: 'Nao executado para modo Copilot.'
  });
  assert.ok(copilotReport.includes('Modo configurado: copilot'));
  assert.ok(copilotReport.includes('VS Code Language Model API'));
  assert.equal(copilotReport.includes('Servidor Ollama'), false);
  assert.equal(copilotReport.includes('/api/tags'), false);
}

function testAiPanelStatusIsModeSpecific(): void {
  const runtime = {
    version: '0.1.11',
    extensionPath: 'C:\\Users\\couti\\.vscode\\extensions\\engenharia-riscos.orion-vscode-0.1.11',
    globalStoragePath: 'C:\\Users\\couti\\AppData\\Roaming\\Code\\User\\globalStorage\\engenharia-riscos.orion-vscode',
    workspaceConfigPath: 'C:\\Users\\couti\\source\\orion-vscode-extension\\.vscode\\settings.json'
  };

  const copilot = buildAiPanelStatus({
    mode: 'copilot',
    baseUrl: 'http://localhost:11434',
    configuredModel: 'qwen2.5-coder:3b',
    runtime
  });
  assert.equal(copilot.providerLabel, 'Copilot');
  assert.equal(copilot.details.some((detail) => detail.label.includes('Ollama')), false);
  assert.equal(copilot.actions.some((action) => action.label.includes('Ollama')), false);

  const local = buildAiPanelStatus({
    mode: 'local',
    baseUrl: 'http://localhost:11434',
    configuredModel: 'qwen2.5-coder:3b',
    runtime
  });
  assert.equal(local.providerLabel, 'Local');
  assert.equal(local.details.some((detail) => detail.value.includes('qwen2.5-coder')), false);

  const auto = buildAiPanelStatus({
    mode: 'auto',
    baseUrl: 'http://localhost:11434',
    configuredModel: 'qwen2.5-coder:3b',
    runtime
  });
  assert.equal(auto.providerLabel, 'Auto');
  assert.equal(auto.details.some((detail) => detail.label.includes('Servidor')), false);
  assert.equal(auto.actions.some((action) => action.label.includes('Ollama')), false);

  const ollama = buildAiPanelStatus({
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
  assert.equal(ollama.providerLabel, 'Ollama');
  assert.equal(ollama.details.some((detail) => detail.label === 'Servidor'), true);
  assert.equal(ollama.actions.some((action) => action.command === 'orion.selectOllamaModel'), true);
}

function testLogFormattingDoesNotExposePrompt(): void {
  const summary = summarizeText('um prompt sensivel com detalhes internos');
  assert.equal(summary, '40 chars');
  const entry = formatLogEntry('info', 'ollama request', { prompt: summary, model: 'qwen2.5-coder:3b' });
  assert.ok(entry.includes('[INFO] ollama request'));
  assert.ok(entry.includes('qwen2.5-coder:3b'));
  assert.ok(!entry.includes('prompt sensivel'));
}

function testFirstUseGuideDocumentsMvpAcceptanceFlow(): void {
  const guide = buildFirstUseGuide();
  assert.ok(guide.includes('ORION - Guia rapido de primeiro uso'));
  assert.ok(guide.includes('http://localhost:11434/api/tags'));
  assert.ok(guide.includes('qwen2.5-coder:3b'));
  assert.ok(guide.includes('@orion o que e natureza'));
  assert.ok(guide.includes('ORION: Abrir Logs'));
  assert.ok(guide.includes('Fluxo recomendado de aceite do MVP'));
}

function run(): void {
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
  testCopilotPromptIncludesOriginalRequestAndHistory();
  testDocsAndInternetDefaults();
  testInternalDocsContextFormatsSources();
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
