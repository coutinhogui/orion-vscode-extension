import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeName, toPascalCase } from '../src/naming';
import { reviewText } from '../src/review';
import { buildDatabricksPipelineFiles, buildDotnetApiFiles } from '../src/templates';
import { renderOrionHelpHtml } from '../src/helpHtml';
import { buildOllamaChatRequest, buildOllamaFallbackMessage, buildOllamaModelQuickPickItems, buildOllamaReviewRequest, chooseOllamaModel, normalizeOllamaBaseUrl } from '../src/ollama';
import { buildConversationReply } from '../src/conversation';
import { shouldFallbackToLocalAnswer, resolveAiMode } from '../src/aiMode';
import { detectResourceIntent } from '../src/resourceIntent';
import { buildAiDiagnosticsReport } from '../src/diagnostics';
import { formatLogEntry, summarizeText } from '../src/logging';
import { buildFirstUseGuide } from '../src/firstUseGuide';

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
  assert.ok(html.includes('IA configuravel'));
  assert.ok(html.includes('Modelos por seleção'));
  assert.ok(html.includes('Configurar IA'));
  assert.ok(html.includes('Primeiro uso'));
  assert.ok(html.includes('Modelos Ollama'));
  assert.ok(html.includes('Diagnosticar IA'));
  assert.ok(html.includes('Abrir logs'));
  assert.ok(html.includes('orion.diagnoseAi'));
  assert.ok(html.includes('orion.openFirstUseGuide'));
  assert.ok(html.includes('orion.showLogs'));
  assert.ok(html.includes('IA ativa'));
  assert.ok(html.includes('orion-ai-mode'));
  assert.ok(html.includes('getAiStatus'));
  assert.ok(html.includes('orion.configureAi'));
  assert.ok(html.includes('orion.selectOllamaModel'));
  assert.ok(html.includes('#CC092F'));
  assert.ok(html.includes('Bradesco principal'));
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
  testIconUsesBradescoInspiredPalette();
  testOllamaHelpers();
  testResourceIntentDetection();
  testAiModeResolutionKeepsExplicitLocalMode();
  testOllamaFallbackMessage();
  testChooseOllamaModel();
  testBuildOllamaModelQuickPickItems();
  testConversationGreeting();
  testAiDiagnosticsReport();
  testLogFormattingDoesNotExposePrompt();
  testFirstUseGuideDocumentsMvpAcceptanceFlow();
  console.log('ORION unit tests passed');
}

run();
