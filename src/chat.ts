import * as vscode from 'vscode';
import { createBlazorPageCommand, createDatabricksPipelineCommand, createDotnetApiCommand, generateTechnicalDocumentationCommand, reviewCurrentFileCommand, setupWorkspaceCommand } from './commands';
import { buildChecklistMessage, buildHelpMessage, buildStandardsMessage } from './templates';
import { buildOllamaFallbackMessage, chooseOllamaModel, OllamaChatMessage, probeOllamaConnection, streamOllamaResponse } from './ollama';
import { buildConversationReply } from './conversation';
import { resolveAiMode, shouldFallbackToLocalAnswer } from './aiMode';
import { detectResourceIntent } from './resourceIntent';
import { summarizeText } from './logging';
import { logOrion } from './output';

export function registerChatParticipant(context: vscode.ExtensionContext): void {
  const chatApi = (vscode.chat as any);
  if (!chatApi?.createChatParticipant) {
    return;
  }

  const participant = chatApi.createChatParticipant('orion', async (request: any, context: any, response: any, token: vscode.CancellationToken) => {
    const command = String(request.command ?? '').toLowerCase();
    const prompt = String(request.prompt ?? '').trim();

    try {
      logOrion('info', 'chat request received', { command: command || 'free', prompt: summarizeText(prompt), historyTurns: Array.isArray(context?.history) ? context.history.length : 0 });
      const intent = command ? undefined : detectResourceIntent(prompt);
      const resolvedCommand = intent?.command ?? command;
      const resolvedPrompt = intent?.prompt ?? prompt;
      if (intent) {
        logOrion('info', 'resource intent detected', { command: resolvedCommand, prompt: summarizeText(resolvedPrompt) });
      }
      const local = await handleLocalCommand(resolvedCommand, resolvedPrompt);
      await maybeUseLanguageModel(request, resolvedCommand, local, prompt, response, token, extractOllamaHistory(context));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logOrion('error', 'chat request failed', { error: message });
      response.markdown(`ORION encontrou um erro: ${message}`);
    }
  });

  participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'orion.svg');
  context.subscriptions.push(participant);
}

async function handleLocalCommand(command: string, prompt: string): Promise<string> {
  switch (command) {
    case '':
      return buildConversationReply(prompt);
    case 'help':
      return buildHelpMessage();
    case 'setup':
      return await setupWorkspaceCommand();
    case 'review':
      return await reviewCurrentFileCommand();
    case 'pipeline':
      return await createDatabricksPipelineCommand(prompt);
    case 'api':
      return await createDotnetApiCommand(prompt);
    case 'blazor':
      return await createBlazorPageCommand(prompt);
    case 'doc':
      return await generateTechnicalDocumentationCommand();
    case 'standards':
      return buildStandardsMessage();
    case 'checklist':
      return buildChecklistMessage();
    default:
      return `${buildHelpMessage()}\n\nComando nao reconhecido: /${command}`;
  }
}


function stringifyChatContent(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyChatContent(item)).filter(Boolean).join('\n');
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return stringifyChatContent(record.value ?? record.content ?? record.markdown ?? record.text);
  }

  return '';
}

export function extractOllamaHistory(context: any): OllamaChatMessage[] {
  const turns = Array.isArray(context?.history) ? context.history : [];
  const messages: OllamaChatMessage[] = [];
  for (const turn of turns.slice(-6)) {
    const prompt = stringifyChatContent(turn?.prompt ?? turn?.request?.prompt);
    if (prompt.trim()) {
      messages.push({ role: 'user', content: prompt.trim() });
    }

    const answer = stringifyChatContent(turn?.response ?? turn?.result ?? turn?.answer);
    if (answer.trim()) {
      messages.push({ role: 'assistant', content: answer.trim() });
    }
  }

  return messages.slice(-6);
}

async function maybeUseLanguageModel(request: any, command: string, localAnswer: string, prompt: string, response: any, token: vscode.CancellationToken, history: readonly OllamaChatMessage[]): Promise<void> {
  const configuredMode = vscode.workspace.getConfiguration('orion.ai').get<string>('mode', 'auto');
  const freeConversation = command === '';
  const mode = resolveAiMode(configuredMode, freeConversation);
  logOrion('info', 'ai mode resolved', { configuredMode, mode, freeConversation });
  if (mode === 'local') {
    logOrion('info', 'local response used', { command: command || 'free' });
    response.markdown(localAnswer);
    return;
  }

  if (mode === 'ollama') {
    const baseUrl = vscode.workspace.getConfiguration('orion.ollama').get<string>('baseUrl', 'http://localhost:11434');
    const configuredModel = vscode.workspace.getConfiguration('orion.ollama').get<string>('model', 'qwen2.5-coder:3b');
    const probe = await probeOllamaConnection(baseUrl);
    const model = chooseOllamaModel(configuredModel, probe.models);
    logOrion(probe.ok ? 'info' : 'warn', 'ollama probe before chat', { ok: probe.ok, baseUrl, configuredModel, resolvedModel: model, modelCount: probe.models.length });
    const configuredFallback = vscode.workspace.getConfiguration('orion.ollama').get<boolean>('autoFallbackToLocal', true);
    const autoFallbackToLocal = shouldFallbackToLocalAnswer(freeConversation, configuredFallback);
    let streamed = '';
    if (typeof response.progress === 'function' && freeConversation) {
      response.progress('Consultando Ollama e revisando a resposta...');
    }
    const ollamaAnswer = freeConversation
      ? await streamOllamaResponse(baseUrl, model, localAnswer, prompt, (chunk) => {
        streamed += chunk;
        response.markdown(chunk);
      }, true, autoFallbackToLocal, history)
      : await streamOllamaResponse(baseUrl, model, localAnswer, prompt, (chunk) => {
        streamed += chunk;
        response.markdown(chunk);
      }, false, autoFallbackToLocal, history);
    if (!streamed.trim()) {
      logOrion(ollamaAnswer ? 'warn' : 'error', 'ollama stream produced no chunks', { model, fallback: Boolean(ollamaAnswer), freeConversation });
      response.markdown(ollamaAnswer || buildOllamaFallbackMessage(model, baseUrl));
    }
    return;
  }

  if (!request.model?.sendRequest) {
    logOrion('warn', 'copilot model unavailable; local response used', { command: command || 'free' });
    response.markdown(localAnswer);
    return;
  }

  try {
    const messages = [
      vscode.LanguageModelChatMessage.User(`Melhore a resposta abaixo em portugues brasileiro, mantendo seguranca, governanca, modo local por padrao e sem inventar acessos externos.\n\n${localAnswer}`)
    ];
    const result = await request.model.sendRequest(messages, {}, token);
    let text = '';
    for await (const fragment of result.text) {
      text += fragment;
    }
    response.markdown(text.trim() || localAnswer);
    return;
  } catch {
    logOrion('warn', 'copilot request failed; local response used', { command: command || 'free' });
    response.markdown(localAnswer);
    return;
  }
}
