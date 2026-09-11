import * as vscode from "vscode";
import {
  loadPanelNotesConfig,
  PanelNoteItem
} from "./config";
import { renderMarkdown } from "./support/markdown";

class PanelNotesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "panel-notes.view";

  private webviewView?: vscode.WebviewView;
  private items: PanelNoteItem[] = [];

  public async resolveWebviewView(
    webviewView: vscode.WebviewView
  ): Promise<void> {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true
    };

    const config = await loadPanelNotesConfig();
    this.items = config.items;

    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === "back") {
          this.showItemList();
          return;
        }

        if (message.command !== "openItem") {
          return;
        }

        const item = this.items.find(
          (entry) => entry.name === message.name
        );

        if (!item) {
          return;
        }

        await this.openItem(item);
      }
    );

    this.showItemList();
  }

  private showItemList(): void {
    if (!this.webviewView) {
      return;
    }

    this.webviewView.webview.html =
      this.getListHtml(this.items);
  }

  private async openItem(
    item: PanelNoteItem
  ): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    if (item.type === "markdown") {
      await this.openMarkdown(item);
      return;
    }

    this.webviewView.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >
          <title>${item.name}</title>
        </head>

        <body>
          <button id="back-button">
            ← Back
          </button>

          <h1>${item.name}</h1>

          <p>
            ${item.type} support is coming next.
          </p>

          <script>
            const vscode = acquireVsCodeApi();

            document
              .getElementById("back-button")
              .addEventListener("click", () => {
                vscode.postMessage({
                  command: "back"
                });
              });
          </script>
        </body>
      </html>
    `;
  }

  private async openMarkdown(
    item: PanelNoteItem
  ): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    const workspaceFolder =
      vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder || !item.path) {
      return;
    }

    const markdownUri = vscode.Uri.joinPath(
      workspaceFolder.uri,
      item.path
    );

    try {
      const file =
        await vscode.workspace.fs.readFile(markdownUri);

      const markdown =
        new TextDecoder("utf-8").decode(file);

      this.webviewView.webview.html =
        this.getMarkdownHtml(
          item.name,
          markdown
        );
    } catch (error) {
      console.error(
        "Panel Notes: failed to load markdown",
        error
      );
    }
  }

  private getListHtml(
    items: PanelNoteItem[]
  ): string {
    const itemsHtml = items
      .map(
        (item) => `
          <button
            class="panel-note-item"
            data-name="${item.name}"
          >
            <strong>${item.name}</strong>
            <span> — ${item.type}</span>
          </button>
        `
      )
      .join("");

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
              background: var(--vscode-editor-background);
              font-family: var(--vscode-font-family);
            }

            h1 {
              margin-top: 0;
            }

            .panel-note-item {
              display: block;
              width: 100%;
              margin-bottom: 8px;
              padding: 8px 10px;
              text-align: left;
              color: var(--vscode-foreground);
              background: transparent;
              border: 1px solid transparent;
              border-radius: 4px;
              cursor: pointer;
              font-family: inherit;
              font-size: inherit;
            }

            .panel-note-item:hover {
              background:
                var(--vscode-list-hoverBackground);
            }

            .panel-note-item span {
              color:
                var(--vscode-descriptionForeground);
            }
          </style>
        </head>

        <body>
          <h1>📝 Panel Notes</h1>

          ${itemsHtml}

          <script>
            const vscode =
              acquireVsCodeApi();

            document
              .querySelectorAll(
                ".panel-note-item"
              )
              .forEach((button) => {
                button.addEventListener(
                  "click",
                  () => {
                    vscode.postMessage({
                      command: "openItem",
                      name:
                        button.dataset.name
                    });
                  }
                );
              });
          </script>
        </body>
      </html>
    `;
  }

  private getMarkdownHtml(
    name: string,
    markdown: string
  ): string {
    const renderedMarkdown = renderMarkdown(markdown);

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          >

          <title>${name}</title>

          <style>
            body {
              padding: 16px;
              color: var(--vscode-foreground);
              background: var(--vscode-editor-background);
              font-family: var(--vscode-font-family);
            }

            .back-button {
              margin-bottom: 16px;
              padding: 6px 10px;
              color: var(--vscode-button-foreground);
              background: var(--vscode-button-background);
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }

            .back-button:hover {
              background:
                var(--vscode-button-hoverBackground);
            }

            pre {
              white-space: pre-wrap;
              word-wrap: break-word;
              font-family:
                var(--vscode-editor-font-family);
            }
          </style>
        </head>

        <body>
          <button
            class="back-button"
            id="back-button"
          >
            ← Back
          </button>

          <div class="markdown">${renderedMarkdown}</div>

          <script>
            const vscode =
              acquireVsCodeApi();

            document
              .getElementById("back-button")
              .addEventListener(
                "click",
                () => {
                  vscode.postMessage({
                    command: "back"
                  });
                }
              );
          </script>
        </body>
      </html>
    `;
  }
}

export function activate(
  context: vscode.ExtensionContext
): void {
  const provider =
    new PanelNotesViewProvider();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PanelNotesViewProvider.viewType,
      provider
    )
  );
}

export function deactivate(): void {}