export interface OllamaChatMessage {
  readonly role: 'system' | 'user' | 'assistant';
  readonly content: string;
}

export interface OllamaChatRequest {
  readonly model: string;
  readonly messages: OllamaChatMessage[];
  readonly stream: boolean;
  readonly temperature: number;
  readonly max_tokens: number;
}

export interface OllamaModelInfo {
  readonly name?: string;
  readonly model?: string;
  readonly modified_at?: string;
  readonly size?: number;
  readonly details?: {
    readonly family?: string;
    readonly parameter_size?: string;
    readonly quantization_level?: string;
  };
}

export interface OllamaModelQuickPickItem {
  readonly label: string;
  readonly description?: string;
  readonly detail?: string;
}

const ollamaModelPriority = [
  'qwen2.5-coder:3b',
  'qwen2.5-coder:7b',
  'qwen3.5:4b',
  'qwen3.5:latest',
  'llama3.1:8b',
  'granite-code:3b',
  'gemma4:e2b'
];

export function normalizeOllamaBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  return trimmed || 'http://localhost:11434';
}

export function buildOllamaFallbackMessage(model: string, baseUrl: string): string {
  return [
    'Nao foi possivel obter resposta do Ollama local.',
    `Modelo configurado: ${model}.`,
    `Servidor configurado: ${normalizeOllamaBaseUrl(baseUrl)}.`,
    'Verifique se o Ollama esta em execucao, se o modelo foi baixado e se `orion.ollama.autoFallbackToLocal` deve permanecer desativado.'
  ].join('\n');
}

export function chooseOllamaModel(preferredModel: string, availableModels: readonly string[]): string {
  if (availableModels.includes(preferredModel)) {
    return preferredModel;
  }

  return ollamaModelPriority.find((model) => availableModels.includes(model)) ?? availableModels[0] ?? preferredModel;
}

function modelName(model: string | OllamaModelInfo): string {
  return typeof model === 'string' ? model : model.model ?? model.name ?? '';
}

function formatModelSize(bytes?: number): string | undefined {
  if (!bytes || bytes <= 0) {
    return undefined;
  }

  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatModelDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, 10);
}

function formatModelDetail(model: OllamaModelInfo): string | undefined {
  const parts = [
    model.details?.family ? `familia ${model.details.family}` : undefined,
    model.details?.parameter_size,
    model.details?.quantization_level,
    formatModelSize(model.size),
    formatModelDate(model.modified_at) ? `atualizado ${formatModelDate(model.modified_at)}` : undefined
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

export function buildOllamaModelQuickPickItems(currentModel: string, availableModels: readonly (string | OllamaModelInfo)[]): OllamaModelQuickPickItem[] {
  const normalized = availableModels
    .map((model) => typeof model === 'string' ? { model } : model)
    .filter((model) => modelName(model));

  const ordered = [...normalized].sort((a, b) => {
    const nameA = modelName(a);
    const nameB = modelName(b);
    const priorityA = ollamaModelPriority.indexOf(nameA);
    const priorityB = ollamaModelPriority.indexOf(nameB);
    const rankA = priorityA === -1 ? Number.MAX_SAFE_INTEGER : priorityA;
    const rankB = priorityB === -1 ? Number.MAX_SAFE_INTEGER : priorityB;
    return rankA - rankB || nameA.localeCompare(nameB);
  });

  const names = normalized.map((model) => modelName(model));
  const recommended = ollamaModelPriority.find((model) => names.includes(model)) ?? names[0];
  return ordered.map((model) => ({
    label: modelName(model),
    description: modelName(model) === currentModel ? 'modelo atual' : modelName(model) === recommended ? 'recomendado' : undefined,
    detail: formatModelDetail(model)
  }));
}

export function buildOllamaChatRequest(
  model: string,
  localAnswer: string,
  userPrompt: string,
  directConversation = false,
  history: readonly OllamaChatMessage[] = []
): OllamaChatRequest {
  const userContent = directConversation
    ? [
      'Responda diretamente a pergunta do usuario como a ORION.',
      'Funcione como um chat normal: responda a pergunta especifica, peca detalhe quando faltar contexto e evite repetir texto de ajuda.',
      'Para perguntas comuns e nao tecnicas, responda como conversa natural em 2 a 4 frases.',
      'Se o usuario perguntar "o que e natureza", interprete como mundo natural, meio ambiente, seres vivos e processos naturais, exceto se ele pedir filosofia ou conceito abstrato.',
      'Evite lista numerada em perguntas simples. Use lista apenas quando o usuario pedir passos, comparacao ou checklist.',
      'Seja curto e pratico por padrao: poucos paragrafos ou no maximo 4 bullets.',
      'Nao invente comandos, APIs ou capacidades. Se nao tiver certeza, diga a abordagem segura e o que validar.',
      'Use o catalogo de recursos ORION apenas quando a intencao do usuario combinar claramente com um recurso.',
      'Se houver recurso aplicavel, explique objetivamente qual recurso usar ou o que foi acionado.',
      '',
      'Pergunta do usuario:',
      userPrompt,
      '',
      'Catalogo de recursos ORION:',
      '- setup: configurar workspace com padroes da equipe.',
      '- review: revisar o arquivo aberto com checklist local.',
      '- pipeline: criar pipeline Databricks bronze/silver/gold.',
      '- api: criar API .NET 8 Minimal API basica.',
      '- blazor: criar pagina Blazor basica.',
      '- doc: gerar documentacao tecnica local.',
      '- standards/checklist: listar padroes e checklist de producao.',
      '',
      'Resposta local de fallback, use somente se o modelo precisar de contexto sobre capacidades:',
      localAnswer
    ].join('\n')
    : [
      'Melhore a resposta abaixo sem alterar a intencao principal.',
      'Mantenha o tom institucional da area de engenharia de dados do banco.',
      userPrompt ? `Contexto do pedido: ${userPrompt}` : '',
      '',
      'Resposta base:',
      localAnswer
    ].filter(Boolean).join('\n');

  return {
    model,
    stream: false,
    temperature: 0.2,
    max_tokens: directConversation ? 260 : 320,
    messages: [
      {
        role: 'system',
        content: 'Voce e a ORION. Responda em portugues brasileiro. Preserve seguranca, governanca e foco em uso local. Nao invente acessos externos, credenciais, comandos inexistentes ou integracoes reais. Seja especifica, curta e pratica.'
      },
      ...history.slice(-6),
      {
        role: 'user',
        content: userContent
      }
    ]
  };
}

export function buildOllamaReviewRequest(model: string, localAnswer: string, userPrompt: string, draft: string): OllamaChatRequest {
  return {
    model,
    stream: false,
    temperature: 0.15,
    max_tokens: 360,
    messages: [
      {
        role: 'system',
        content: 'Voce e a ORION revisando a propria resposta antes de enviar ao usuario. Seja direto, util e preciso. Responda em portugues brasileiro.'
      },
      {
        role: 'user',
        content: [
          'Avalie o rascunho abaixo e produza a resposta final.',
          'Regras:',
          '- Responda a pergunta real do usuario.',
          '- Nao mencione que houve rascunho, avaliacao ou revisao interna.',
          '- Nao invente acesso a sistemas, producao, secrets ou dados internos.',
          '- Se o usuario pediu capacidades, explique opcoes concretas.',
          '- Se o usuario pediu orientacao tecnica, organize a resposta em passos curtos.',
          '',
          'Pergunta do usuario:',
          userPrompt,
          '',
          'Contexto local da ORION:',
          localAnswer,
          '',
          'Rascunho gerado:',
          draft
        ].join('\n')
      }
    ]
  };
}

export async function probeOllamaConnection(baseUrl: string): Promise<{ ok: boolean; models: string[]; modelInfos: OllamaModelInfo[] }> {
  try {
    const response = await fetch(`${normalizeOllamaBaseUrl(baseUrl)}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { ok: false, models: [], modelInfos: [] };
    }

    const payload = await response.json() as { models?: OllamaModelInfo[] };
    const modelInfos = payload.models ?? [];
    const models = modelInfos.map((item) => item.model ?? item.name ?? '').filter(Boolean);
    return { ok: true, models, modelInfos };
  } catch {
    return { ok: false, models: [], modelInfos: [] };
  }
}

export async function generateOllamaResponse(
  baseUrl: string,
  model: string,
  localAnswer: string,
  userPrompt: string
): Promise<string> {
  try {
    const request = buildOllamaChatRequest(model, localAnswer, userPrompt);
    const response = await fetch(`${normalizeOllamaBaseUrl(baseUrl)}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      return localAnswer;
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      message?: { content?: string };
    };

    const content = payload.choices?.[0]?.message?.content ?? payload.message?.content ?? '';
    return content.trim() || localAnswer;
  } catch {
    return localAnswer;
  }
}

async function completeOllamaRequest(baseUrl: string, request: OllamaChatRequest): Promise<string | undefined> {
  try {
    const response = await fetch(`${normalizeOllamaBaseUrl(baseUrl)}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      message?: { content?: string };
    };

    const content = payload.choices?.[0]?.message?.content ?? payload.message?.content ?? '';
    return content.trim() || undefined;
  } catch {
    return undefined;
  }
}

export async function streamReviewedOllamaResponse(
  baseUrl: string,
  model: string,
  localAnswer: string,
  userPrompt: string,
  onChunk: (chunk: string) => void,
  autoFallbackToLocal = true,
  history: readonly OllamaChatMessage[] = []
): Promise<string | undefined> {
  const draftRequest = buildOllamaChatRequest(model, localAnswer, userPrompt, true, history);
  const draft = await completeOllamaRequest(baseUrl, draftRequest);
  if (!draft) {
    return autoFallbackToLocal ? localAnswer : undefined;
  }

  const reviewedRequest = buildOllamaReviewRequest(model, localAnswer, userPrompt, draft);
  return await streamOllamaRequest(baseUrl, reviewedRequest, onChunk) ?? (autoFallbackToLocal ? localAnswer : undefined);
}

async function streamOllamaRequest(
  baseUrl: string,
  request: OllamaChatRequest,
  onChunk: (chunk: string) => void
): Promise<string | undefined> {
  try {
    const response = await fetch(`${normalizeOllamaBaseUrl(baseUrl)}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...request, stream: true })
    });

    if (!response.ok || !response.body) {
      return undefined;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let collected = '';

    for (;;) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') {
          continue;
        }

        const jsonText = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
        try {
          const payload = JSON.parse(jsonText) as {
            choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
          };
          const chunk = payload.choices?.[0]?.delta?.content ?? payload.choices?.[0]?.message?.content ?? '';
          if (chunk) {
            collected += chunk;
            onChunk(chunk);
          }
        } catch {
          // Ignore malformed stream chunks and continue collecting valid chunks.
        }
      }
    }

    return collected.trim() || undefined;
  } catch {
    return undefined;
  }
}

export async function streamOllamaResponse(
  baseUrl: string,
  model: string,
  localAnswer: string,
  userPrompt: string,
  onChunk: (chunk: string) => void,
  directConversation = false,
  autoFallbackToLocal = true,
  history: readonly OllamaChatMessage[] = []
): Promise<string | undefined> {
  try {
    const request = buildOllamaChatRequest(model, localAnswer, userPrompt, directConversation, history);
    return await streamOllamaRequest(baseUrl, request, onChunk) ?? (autoFallbackToLocal ? localAnswer : undefined);
  } catch {
    return autoFallbackToLocal ? localAnswer : undefined;
  }
}
