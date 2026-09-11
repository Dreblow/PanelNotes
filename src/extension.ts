import * as vscode from "vscode";
import { loadPanelNotesConfig } from "./config";

class PanelNotesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "panel-notes.view";

  constructor(
    private readonly context: vscode.ExtensionContext
  ) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    webviewView.webview.options = {
      enableScripts: false
    };

    const config = await loadPanelNotesConfig();

    const itemsHtml = config.items
      .map(
        (item) => `
          <li>
            <strong>${item.name}</strong>
            <span> — ${item.type}</span>
          </li>
        `
      )
      .join("");

    webviewView.webview.html = this.getHtml(itemsHtml);
  }

  private getHtml(itemsHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>Panel Notes</title>

          <style>
            body {
              padding: 16px;
              color: var(--vscode-foreground);
              background:
                var(--vscode-editor-background);
              font-family:
                var(--vscode-font-family);
            }

            h1 {
              margin-top: 0;
            }

            ul {
              padding-left: 20px;
            }

            li {
              margin-bottom: 8px;
            }

            span {
              color:
                var(--vscode-descriptionForeground);
            }
          </style>
        </head>

        <body>
          <h1>📝 Panel Notes</h1>

          <ul>
            ${itemsHtml}
          </ul>
        </body>
      </html>
    `;
  }
}

export function activate(
  context: vscode.ExtensionContext
): void {
  const provider = new PanelNotesViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PanelNotesViewProvider.viewType,
      provider
    )
  );
}

export function deactivate(): void {
  // Nothing to clean up yet.
}