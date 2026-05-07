export function renderOrionHelpHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --orion-bg: var(--vscode-sideBar-background, #111114);
      --orion-panel: color-mix(in srgb, var(--vscode-sideBar-background, #111114) 84%, #2a151b);
      --orion-panel-2: color-mix(in srgb, var(--vscode-sideBar-background, #111114) 70%, #3a1b24);
      --orion-text: var(--vscode-sideBar-foreground, #e7edf5);
      --orion-muted: var(--vscode-descriptionForeground, #9ca9ba);
      --orion-line: var(--vscode-sideBar-border, #2a333e);
      --orion-red: #CC092F;
      --orion-red-strong: #99000F;
      --orion-red-light: #E60935;
      --orion-pink: #F7A6B7;
      --orion-silver: #D7DCE2;
      --orion-green: #34d399;
      --orion-amber: #F7B500;
      --orion-blue: #0B67BE;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      background: var(--orion-bg);
      color: var(--orion-text);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
    }

    .masthead {
      padding: 18px 16px 16px;
      background:
        linear-gradient(135deg, rgba(204, 9, 47, 0.34), rgba(153, 0, 15, 0.2) 52%, rgba(247, 166, 183, 0.12)),
        var(--orion-panel);
      border-bottom: 1px solid var(--orion-line);
    }

    .brand { display: flex; gap: 12px; align-items: center; }

    .mark {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: linear-gradient(145deg, var(--orion-red), var(--orion-red-strong));
      border: 1px solid rgba(255, 255, 255, 0.22);
      position: relative;
      flex: 0 0 auto;
    }

    .mark::before {
      content: "";
      width: 25px;
      height: 17px;
      border: 3px solid #fff;
      border-bottom: 0;
      border-radius: 15px 15px 0 0;
      position: absolute;
      top: 10px;
    }

    .mark::after {
      content: "";
      width: 18px;
      height: 4px;
      border-radius: 3px;
      background: #fff;
      position: absolute;
      bottom: 11px;
    }

    .title { min-width: 0; }
    .title h1 { margin: 0; font-size: 18px; line-height: 1.1; letter-spacing: 0; }
    .title p { margin: 4px 0 0; color: var(--orion-muted); font-size: 12px; }

    .status { margin-top: 14px; display: flex; gap: 8px; flex-wrap: wrap; }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 24px;
      padding: 3px 8px;
      border: 1px solid var(--orion-line);
      border-radius: 6px;
      background: rgba(16, 19, 23, 0.56);
      color: var(--orion-muted);
      font-size: 12px;
      white-space: nowrap;
    }

    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--orion-green); }
    .content { padding: 14px; }
    .section { padding: 12px 0; border-bottom: 1px solid var(--orion-line); }
    .section:first-child { padding-top: 0; }
    .section:last-child { border-bottom: 0; }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 9px;
    }

    .section-title {
      color: color-mix(in srgb, var(--orion-text) 82%, var(--orion-blue));
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .section-count { color: var(--orion-muted); font-size: 11px; }

    .session {
      display: grid;
      grid-template-columns: 4px 1fr auto;
      gap: 10px;
      align-items: center;
      min-height: 48px;
      padding: 9px 10px;
      background: var(--orion-panel);
      border: 1px solid var(--orion-line);
      border-radius: 8px;
      margin-bottom: 8px;
    }

    .bar { width: 4px; height: 28px; border-radius: 2px; background: var(--orion-blue); }
    .bar.amber { background: var(--orion-amber); }
    .bar.pink { background: var(--orion-pink); }
    .session strong { display: block; font-size: 13px; font-weight: 650; }
    .session span { color: var(--orion-muted); display: block; margin-top: 1px; font-size: 12px; }

    .kbd {
      color: var(--orion-blue);
      font-family: var(--vscode-editor-font-family), ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
    }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    button {
      min-height: 42px;
      border: 1px solid var(--orion-line);
      border-radius: 8px;
      background: var(--orion-panel);
      color: var(--orion-text);
      text-align: left;
      padding: 8px 9px;
      font: inherit;
      cursor: pointer;
    }

    button:hover { border-color: rgba(56, 189, 248, 0.58); background: var(--orion-panel-2); }
    button .icon { color: var(--orion-blue); font-weight: 700; margin-right: 5px; }
    .template-list { display: grid; gap: 7px; }

    .template {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      min-height: 34px;
      padding: 7px 9px;
      border-radius: 7px;
      background: color-mix(in srgb, var(--orion-panel-2) 72%, transparent);
      border: 1px solid transparent;
    }

    .template strong { overflow-wrap: anywhere; }
    .template span { color: var(--orion-muted); font-size: 11px; text-align: right; }
    .risk-row { display: grid; gap: 7px; }
    .ai-status { display: grid; gap: 8px; }

    .metric {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      color: var(--orion-muted);
    }

    .metric strong { font-weight: 650; white-space: nowrap; }
    .metric code {
      color: var(--orion-text);
      font-family: var(--vscode-editor-font-family), ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      text-align: right;
      overflow-wrap: anywhere;
    }
    .accent-blue { color: var(--orion-blue); }
    .accent-amber { color: var(--orion-amber); }
    .accent-red { color: var(--orion-red); }
  </style>
</head>
<body>
  <header class="masthead">
    <div class="brand">
      <div class="mark" aria-hidden="true"></div>
      <div class="title">
        <h1>ORION</h1>
        <p>Bradesco principal · riscos e engenharia</p>
      </div>
    </div>
    <div class="status">
      <span class="pill"><span class="dot"></span>IA configuravel</span>
      <span class="pill">Modelos por seleção</span>
      <span class="pill">@orion ativo</span>
    </div>
  </header>

  <main class="content">
    <section class="section">
      <div class="section-header">
        <div class="section-title">Sessões</div>
        <div class="section-count">3 fluxos</div>
      </div>
        <div class="session">
        <div class="bar"></div>
        <div><strong>Chat operacional</strong><span>Governança e padrões Bradesco</span></div>
        <div class="kbd">/help</div>
      </div>
      <div class="session">
        <div class="bar amber"></div>
        <div><strong>Setup de workspace</strong><span>VS Code, Copilot e docs</span></div>
        <div class="kbd">/setup</div>
      </div>
      <div class="session">
        <div class="bar pink"></div>
        <div><strong>Revisão local</strong><span>Segurança, performance e governança</span></div>
        <div class="kbd">/review</div>
      </div>
    </section>

    <section class="section">
      <div class="section-header"><div class="section-title">Ações rápidas</div></div>
      <div class="grid">
        <button data-command="orion.setupWorkspace"><span class="icon">⚙</span>Configurar workspace</button>
        <button data-command="orion.openFirstUseGuide"><span class="icon">1</span>Primeiro uso</button>
        <button data-command="orion.reviewCurrentFile"><span class="icon">✓</span>Revisar arquivo</button>
        <button data-command="orion.configureAi"><span class="icon">◉</span>Configurar IA</button>
        <button data-command="orion.selectOllamaModel"><span class="icon">⌕</span>Modelos Ollama</button>
        <button data-command="orion.testOllamaConnection"><span class="icon">?</span>Testar Ollama</button>
        <button data-command="orion.diagnoseAi"><span class="icon">!</span>Diagnosticar IA</button>
        <button data-command="orion.showLogs"><span class="icon">≡</span>Abrir logs</button>
        <button data-command="orion.generateTechnicalDocumentation"><span class="icon">#</span>Gerar docs</button>
        <button data-command="workbench.panel.chat.view.copilot.focus"><span class="icon">@</span>Abrir @orion</button>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div class="section-title">IA ativa</div>
        <button data-command="orion.configureAi">Alterar</button>
      </div>
      <div class="ai-status">
        <div class="metric"><span>Modo</span><code id="orion-ai-mode">carregando...</code></div>
        <div class="metric"><span>Modelo</span><code id="orion-ai-model">carregando...</code></div>
        <div class="metric"><span>Servidor</span><code id="orion-ai-base-url">carregando...</code></div>
        <div class="metric"><span>Status</span><strong id="orion-ai-status" class="accent-amber">verificando</strong></div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div class="section-title">Templates</div>
        <div class="section-count">6 stacks</div>
      </div>
      <div class="template-list">
        <div class="template"><strong>Databricks pipeline</strong><span>bronze/silver/gold</span></div>
        <div class="template"><strong>.NET 8 API</strong><span>minimal API</span></div>
        <div class="template"><strong>Blazor page</strong><span>loading/erro/vazio</span></div>
        <div class="template"><strong>Python, SQL, Java</strong><span>checklists locais</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section-header"><div class="section-title">Governança</div></div>
      <div class="risk-row">
        <div class="metric"><span>Secrets hardcoded</span><strong class="accent-red">bloquear</strong></div>
        <div class="metric"><span>Dados sensíveis</span><strong class="accent-amber">validar</strong></div>
        <div class="metric"><span>Qualidade de dados</span><strong class="accent-blue">exigir</strong></div>
      </div>
    </section>
  </main>

  <script>
    const vscode = acquireVsCodeApi();
    document.querySelectorAll('button[data-command]').forEach((button) => {
      button.addEventListener('click', () => {
        vscode.postMessage({ command: button.dataset.command });
      });
    });
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type !== 'aiStatus') {
        return;
      }
      document.getElementById('orion-ai-mode').textContent = message.mode || '-';
      document.getElementById('orion-ai-model').textContent = message.model || '-';
      document.getElementById('orion-ai-base-url').textContent = message.baseUrl || '-';
      const status = document.getElementById('orion-ai-status');
      status.textContent = message.status || 'desconhecido';
      status.className = message.ok ? 'accent-blue' : 'accent-red';
    });
    vscode.postMessage({ command: 'getAiStatus' });
  </script>
</body>
</html>`;
}
