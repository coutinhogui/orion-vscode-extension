export function renderOrionHelpHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --orion-bg: var(--vscode-sideBar-background, #111114);
      --orion-panel: color-mix(in srgb, var(--vscode-sideBar-background, #111114) 86%, #2a151b);
      --orion-panel-2: color-mix(in srgb, var(--vscode-sideBar-background, #111114) 72%, #3a1b24);
      --orion-text: var(--vscode-sideBar-foreground, #e7edf5);
      --orion-muted: var(--vscode-descriptionForeground, #9ca9ba);
      --orion-line: var(--vscode-sideBar-border, #2a333e);
      --orion-red: #CC092F;
      --orion-red-strong: #99000F;
      --orion-pink: #F7A6B7;
      --orion-blue: #5AA9FF;
      --orion-green: #34d399;
      --orion-amber: #F7B500;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--orion-bg);
      color: var(--orion-text);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.42;
    }

    .masthead {
      padding: 16px 14px 13px;
      background:
        linear-gradient(135deg, rgba(204, 9, 47, 0.3), rgba(153, 0, 15, 0.18) 54%, rgba(247, 166, 183, 0.1)),
        var(--orion-panel);
      border-bottom: 1px solid var(--orion-line);
    }

    .brand {
      display: flex;
      gap: 11px;
      align-items: center;
    }

    .mark {
      width: 39px;
      height: 39px;
      border-radius: 9px;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg, var(--orion-red), var(--orion-red-strong));
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #fff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0;
      flex: 0 0 auto;
    }

    .title { min-width: 0; }
    .title h1 { margin: 0; font-size: 17px; line-height: 1.1; letter-spacing: 0; }
    .title p { margin: 4px 0 0; color: var(--orion-muted); font-size: 12px; }

    .status {
      margin-top: 13px;
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 23px;
      padding: 3px 8px;
      border: 1px solid var(--orion-line);
      border-radius: 6px;
      background: rgba(16, 19, 23, 0.52);
      color: var(--orion-muted);
      font-size: 12px;
      white-space: nowrap;
    }

    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--orion-green); }
    .tree { padding: 7px 0 14px; }

    details {
      border-bottom: 1px solid color-mix(in srgb, var(--orion-line) 72%, transparent);
    }

    summary {
      min-height: 34px;
      padding: 7px 12px;
      display: grid;
      grid-template-columns: 18px 1fr auto;
      align-items: center;
      gap: 5px;
      cursor: default;
      list-style: none;
      color: color-mix(in srgb, var(--orion-text) 88%, var(--orion-blue));
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      user-select: none;
    }

    summary::-webkit-details-marker { display: none; }
    summary:hover { background: rgba(255, 255, 255, 0.035); }

    .chevron::before {
      content: ">";
      color: var(--orion-muted);
      display: inline-block;
      transform: rotate(0deg);
      transition: transform 140ms ease;
    }

    details[open] .chevron::before { transform: rotate(90deg); }

    .count {
      color: var(--orion-muted);
      font-size: 11px;
      letter-spacing: 0;
      text-transform: none;
      font-weight: 600;
    }

    .item,
    .action {
      width: 100%;
      min-height: 36px;
      padding: 6px 12px 6px 30px;
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr) auto;
      align-items: center;
      gap: 7px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--orion-text);
      text-align: left;
      font: inherit;
    }

    .action { cursor: pointer; }
    .item:hover,
    .action:hover { background: rgba(255, 255, 255, 0.04); }
    .item.active { background: rgba(204, 9, 47, 0.16); box-shadow: inset 3px 0 0 var(--orion-red); }

    .icon {
      width: 20px;
      height: 20px;
      border-radius: 5px;
      display: grid;
      place-items: center;
      background: var(--orion-panel-2);
      color: var(--orion-blue);
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
    }

    .icon.red { color: var(--orion-pink); }
    .icon.amber { color: var(--orion-amber); }
    .icon.green { color: var(--orion-green); }

    .label { min-width: 0; }
    .label strong {
      display: block;
      font-size: 13px;
      font-weight: 620;
      line-height: 1.16;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .label span {
      display: block;
      margin-top: 1px;
      color: var(--orion-muted);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .kbd,
    code {
      color: var(--orion-blue);
      font-family: var(--vscode-editor-font-family), ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
    }

    .metric {
      min-height: 31px;
      display: grid;
      grid-template-columns: minmax(78px, 0.42fr) minmax(0, 1fr);
      gap: 10px;
      align-items: start;
      padding: 6px 12px 6px 30px;
      color: var(--orion-muted);
    }

    .metric span { font-size: 12px; }
    .metric strong { color: var(--orion-text); font-weight: 620; }
    .metric code {
      color: var(--orion-text);
      text-align: right;
      overflow-wrap: anywhere;
      word-break: break-word;
      line-height: 1.35;
    }

    .footer-note {
      padding: 10px 12px 0;
      color: var(--orion-muted);
      font-size: 11px;
    }

    .accent-blue { color: var(--orion-blue); }
    .accent-amber { color: var(--orion-amber); }
    .accent-red { color: var(--orion-red); }
  </style>
</head>
<body>
  <header class="masthead">
    <div class="brand">
      <div class="mark" aria-hidden="true">OR</div>
      <div class="title">
        <h1>ORION</h1>
        <p>Riscos, integrações, operações e normas</p>
      </div>
    </div>
    <div class="status">
      <span class="pill"><span class="dot"></span><span id="orion-ai-pill">IA verificando</span></span>
      <span class="pill">v<span id="orion-version-pill">...</span></span>
      <span class="pill">@orion</span>
    </div>
  </header>

  <main class="tree">
    <details open>
      <summary>
        <span class="chevron"></span>
        <span>Sessões</span>
        <span class="count">3</span>
      </summary>
      <button class="action active" data-command="workbench.panel.chat.view.copilot.focus">
        <span class="icon red">@</span>
        <span class="label"><strong>Chat operacional</strong><span>Use @orion com comandos ou conversa livre</span></span>
        <span class="kbd">/help</span>
      </button>
      <button class="action" data-command="orion.setupWorkspace">
        <span class="icon amber">W</span>
        <span class="label"><strong>Setup de workspace</strong><span>VS Code, Copilot e padrões locais</span></span>
        <span class="kbd">/setup</span>
      </button>
      <button class="action" data-command="orion.reviewCurrentFile">
        <span class="icon green">R</span>
        <span class="label"><strong>Revisão local</strong><span>Segurança, performance e governança</span></span>
        <span class="kbd">/review</span>
      </button>
    </details>

    <details open>
      <summary>
        <span class="chevron"></span>
        <span>Ações rápidas</span>
        <span class="count">5</span>
      </summary>
      <button class="action" data-command="orion.openFirstUseGuide">
        <span class="icon">1</span>
        <span class="label"><strong>Primeiro uso</strong><span>Fluxo de aceite e próximos passos</span></span>
      </button>
      <button class="action" data-command="orion.configureAi">
        <span class="icon">AI</span>
        <span class="label"><strong>Configurar IA</strong><span>Escolher Auto, Local, Copilot ou Ollama</span></span>
      </button>
      <button class="action" data-command="orion.diagnoseAi">
        <span class="icon amber">D</span>
        <span class="label"><strong>Diagnosticar IA</strong><span>Relatório de modo, modelo e conectividade</span></span>
      </button>
      <button class="action" data-command="orion.showLogs">
        <span class="icon">L</span>
        <span class="label"><strong>Abrir logs</strong><span>Canal ORION com eventos recentes</span></span>
      </button>
      <button class="action" data-command="orion.generateTechnicalDocumentation">
        <span class="icon">#</span>
        <span class="label"><strong>Gerar docs</strong><span>Documentação técnica do workspace</span></span>
      </button>
    </details>

    <details open>
      <summary>
        <span class="chevron"></span>
        <span>IA ativa</span>
        <span class="count">4</span>
      </summary>
      <div class="metric"><span>Modo</span><code id="orion-ai-mode">carregando...</code></div>
      <div class="metric"><span>Modelo</span><code id="orion-ai-model">carregando...</code></div>
      <div class="metric"><span>Servidor</span><code id="orion-ai-base-url">carregando...</code></div>
      <div class="metric"><span>Status</span><strong id="orion-ai-status" class="accent-amber">verificando</strong></div>
      <button class="action" data-command="orion.selectOllamaModel">
        <span class="icon">M</span>
        <span class="label"><strong>Modelos Ollama</strong><span>Selecionar modelo instalado</span></span>
      </button>
      <button class="action" data-command="orion.testOllamaConnection">
        <span class="icon">T</span>
        <span class="label"><strong>Testar Ollama</strong><span>Validar servidor local configurado</span></span>
      </button>
    </details>

    <details>
      <summary>
        <span class="chevron"></span>
        <span>Templates</span>
        <span class="count">3</span>
      </summary>
      <button class="action" data-command="orion.createDatabricksPipeline">
        <span class="icon">DB</span>
        <span class="label"><strong>Databricks pipeline</strong><span>Bronze, silver, gold e qualidade</span></span>
      </button>
      <button class="action" data-command="orion.createDotnetApi">
        <span class="icon">.N</span>
        <span class="label"><strong>.NET 8 API</strong><span>Minimal API básica</span></span>
      </button>
      <button class="action" data-command="orion.createBlazorPage">
        <span class="icon">BZ</span>
        <span class="label"><strong>Blazor page</strong><span>Loading, erro, vazio e client</span></span>
      </button>
    </details>

    <details>
      <summary>
        <span class="chevron"></span>
        <span>Governança</span>
        <span class="count">3</span>
      </summary>
      <div class="item">
        <span class="icon red">!</span>
        <span class="label"><strong>Secrets hardcoded</strong><span>Bloquear antes de gerar ou revisar</span></span>
        <strong class="accent-red">bloquear</strong>
      </div>
      <div class="item">
        <span class="icon amber">S</span>
        <span class="label"><strong>Dados sensíveis</strong><span>CPF, tokens, credenciais e bases internas</span></span>
        <strong class="accent-amber">validar</strong>
      </div>
      <div class="item">
        <span class="icon green">Q</span>
        <span class="label"><strong>Qualidade de dados</strong><span>Checks obrigatórios por pipeline</span></span>
        <strong class="accent-blue">exigir</strong>
      </div>
    </details>

    <details open>
      <summary>
        <span class="chevron"></span>
        <span>Instalação</span>
        <span class="count">4</span>
      </summary>
      <div class="metric"><span>Versão</span><code id="orion-extension-version">carregando...</code></div>
      <div class="metric"><span>Extensão</span><code id="orion-extension-path">carregando...</code></div>
      <div class="metric"><span>Config</span><code id="orion-workspace-config-path">carregando...</code></div>
      <div class="metric"><span>Storage</span><code id="orion-storage-path">carregando...</code></div>
    </details>

    <div class="footer-note">As ações escrevem arquivos no workspace aberto, respeitando as configurações atuais da ORION.</div>
  </main>

  <script>
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('[data-command]').forEach((element) => {
      element.addEventListener('click', () => {
        vscode.postMessage({ command: element.dataset.command });
      });
    });

    function setText(id, value) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value || '-';
      }
    }

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type !== 'aiStatus') {
        return;
      }

      setText('orion-ai-mode', message.mode);
      setText('orion-ai-model', message.model);
      setText('orion-ai-base-url', message.baseUrl);
      setText('orion-extension-version', message.version);
      setText('orion-version-pill', message.version);
      setText('orion-extension-path', message.extensionPath);
      setText('orion-workspace-config-path', message.workspaceConfigPath);
      setText('orion-storage-path', message.globalStoragePath);
      setText('orion-ai-pill', message.mode ? 'IA ' + message.mode : 'IA');

      const status = document.getElementById('orion-ai-status');
      status.textContent = message.status || 'desconhecido';
      status.className = message.ok ? 'accent-blue' : 'accent-red';
    });

    vscode.postMessage({ command: 'getAiStatus' });
  </script>
</body>
</html>`;
}
