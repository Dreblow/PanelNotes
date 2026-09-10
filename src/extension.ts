import * as vscode from "vscode";

class PanelNotesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "panel-notes.view";

  public resolveWebviewView(
    webviewView: vscode.WebviewView
  ): void {
    webviewView.webview.options = {
      enableScripts: false
    };

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
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
        </head>

        <body>
          <h1>Panel Notes</h1>
          <p>Panel Notes is alive.</p>
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

export function deactivate(): void {
  // Nothing to clean up yet.
}