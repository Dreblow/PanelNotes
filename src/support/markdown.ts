import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
});

export function renderMarkdown(source: string): string {
  return markdown.render(source);
}

export function getMarkdownStyles(): string {
  return `
    .markdown {
      max-width: 980px;
      line-height: 1.6;
      font-size: var(--vscode-font-size);
    }

    .markdown h1,
    .markdown h2,
    .markdown h3,
    .markdown h4,
    .markdown h5,
    .markdown h6 {
      line-height: 1.25;
      margin-top: 24px;
      margin-bottom: 12px;
      font-weight: 600;
      color: var(--vscode-foreground);
    }

    .markdown h1 {
      font-size: 2em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .markdown h2 {
      font-size: 1.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .markdown h3 {
      font-size: 1.25em;
    }

    .markdown p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .markdown a {
      color: var(--vscode-textLink-foreground);
      text-decoration: none;
    }

    .markdown a:hover {
      color: var(--vscode-textLink-activeForeground);
      text-decoration: underline;
    }

    .markdown ul,
    .markdown ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }

    .markdown li {
      margin: 4px 0;
    }

    .markdown blockquote {
      margin: 0 0 16px 0;
      padding: 0 1em;
      color: var(--vscode-descriptionForeground);
      border-left: 4px solid var(--vscode-panel-border);
    }

    .markdown code {
      padding: 2px 5px;
      border-radius: 4px;
      background: var(--vscode-textCodeBlock-background);
      font-family: var(--vscode-editor-font-family);
      font-size: 0.95em;
    }

    .markdown pre {
      overflow-x: auto;
      margin: 0 0 16px 0;
      padding: 12px 14px;
      border-radius: 6px;
      background: var(--vscode-textCodeBlock-background);
    }

    .markdown pre code {
      padding: 0;
      background: transparent;
      white-space: pre;
      font-size: var(--vscode-editor-font-size);
    }

    .markdown table {
      width: 100%;
      margin-bottom: 16px;
      border-collapse: collapse;
    }

    .markdown th,
    .markdown td {
      padding: 6px 12px;
      border: 1px solid var(--vscode-panel-border);
      text-align: left;
    }

    .markdown th {
      font-weight: 600;
      background: var(--vscode-editorWidget-background);
    }

    .markdown hr {
      height: 1px;
      margin: 24px 0;
      border: 0;
      background: var(--vscode-panel-border);
    }

    .markdown img {
      max-width: 100%;
      height: auto;
    }

    .markdown strong {
      font-weight: 600;
    }
  `;
}