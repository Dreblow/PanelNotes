import * as vscode from "vscode";

import {
  loadPanelNotesConfig,
  PanelNoteItem
} from "./config";

import { 
  renderMarkdown 
} from "./support/markdown";

import {
  addActiveMarkdownFile,
  cleanPanelNotesConfig,
  clearPanelNotesConfig
} from "./support/workspace";


class PanelNotesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "panel-notes.view";

  private webviewView?: vscode.WebviewView;
  private items: PanelNoteItem[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {}


  public async reloadItems(): Promise<void> {
    const config = await loadPanelNotesConfig();

    this.items = config.items;

    this.showItemList();
  }


  public async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    this.webviewView = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(
          this.context.extensionUri,
          "media"
        )
      ]
    };

    const config = await loadPanelNotesConfig();
    this.items = config.items;

    webviewView.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === "clear") {
          await this.clearItems();
          return;
        }

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

    this.webviewView.webview.html = this.getListHtml(this.items);
  }


  private async openItem(item: PanelNoteItem): Promise<void> {
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


  private async openMarkdown(item: PanelNoteItem): Promise<void> {
    if (!this.webviewView) {
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder || !item.path) {
      return;
    }

    const markdownUri = vscode.Uri.joinPath(workspaceFolder.uri, item.path);

    try {
      const file = await vscode.workspace.fs.readFile(markdownUri);
      const markdown = new TextDecoder("utf-8").decode(file);

      this.webviewView.webview.html = await this.getMarkdownHtml(
          item.name,
          markdown
        );
    } catch (error) {
      console.error("Panel Notes: failed to load markdown", error);
    }
  }


  private getListHtml(items: PanelNoteItem[]): string {
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

            .panel-notes-header {
              display: flex;
              align-items: center;
              gap: 10px;

              margin-bottom: 16px;
            }

            .panel-notes-header h1 {
              margin: 0;
            }

            .clear-button {
              padding: 4px 10px;

              color: #f1f6fc !important;
              background: #21262d !important;

              border: 1px solid #30363d !important;
              border-radius: 4px;

              cursor: pointer;

              font-family: inherit;
              font-size: 12px;
            }

            .clear-button:hover {
              background: #30363d !important;
            }
          </style>
        </head>

        <body>
          <div class="panel-notes-header">
            <h1>📝 Panel Notes</h1>

            <button
              class="clear-button"
              id="clear-button"
            >
              Clear
            </button>
          </div>

          ${itemsHtml}

          <script>
            const vscode = acquireVsCodeApi();

            document
              .querySelectorAll(".panel-note-item")
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

            document
              .getElementById("clear-button")
              .addEventListener("click", () => {
                vscode.postMessage({
                  command: "clear"
                });
              });
          </script>
        </body>
      </html>
    `;
  }

  private async getMarkdownHtml(name: string, markdown: string): Promise<string> {
    if (!this.webviewView) {
      return "";
    }

    const templateUri = vscode.Uri.joinPath(
      this.context.extensionUri,
      "media",
      "markdown.html"
    );

    const templateFile = await vscode.workspace.fs.readFile(templateUri);
    const template = new TextDecoder("utf-8").decode(templateFile);

    const cssUri = this.webviewView.webview.asWebviewUri(
                                                          vscode.Uri.joinPath(
                                                            this.context.extensionUri,
                                                            "media",
                                                            "markdown.css"
                                                          )
                                                        );

    const renderedMarkdown = renderMarkdown(markdown);

    return template
      .replace("{{TITLE}}", name)
      .replace("{{CSS_URI}}", `${cssUri.toString()}?v=${Date.now()}`)
      .replace("{{CONTENT}}", renderedMarkdown);
  }


  public async clearItems(): Promise<void> {
    await clearPanelNotesConfig();

    this.items = [];

    this.showItemList();
  }

}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  await cleanPanelNotesConfig();

  const provider = new PanelNotesViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PanelNotesViewProvider.viewType,
      provider
    )
  );

  const added = await addActiveMarkdownFile();

  if (added) {
    await provider.reloadItems();
  }

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(
      async () => {
        const added = await addActiveMarkdownFile();

        if (added) {
          await provider.reloadItems();
        }
      }
    )
  );
}

export function deactivate(): void {}