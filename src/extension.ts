import * as vscode from "vscode";
import { loadPanelNotesConfig } from "./config";

class PanelNotesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "panel-notes.view";

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    const config = await loadPanelNotesConfig();

    const items = config.items
      .map((item) => `<li>${item.name}</li>`)
      .join("");

    webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >
          <title>Panel Notes</title>
        </head>

        <body>
          <h1>📝 Panel Notes</h1>

          <ul>
            ${items}
          </ul>
        </body>
      </html>
    `;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new PanelNotesViewProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PanelNotesViewProvider.viewType,
      provider
    )
  );
}

export function deactivate(): void {}