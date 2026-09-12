import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,

  highlight: (
    code: string,
    language: string
  ): string => {
    if (
      language &&
      hljs.getLanguage(language)
    ) {
      try {
        const result = hljs.highlight(code, {
          language,
          ignoreIllegals: true
        });

        return `<pre class="hljs"><code>${result.value}</code></pre>`;
      } catch {
        // Fall through to plain rendering.
      }
    }

    return `<pre class="hljs"><code>${escapeHtml(code)}</code></pre>`;
  }
});

export function renderMarkdown(
  source: string
): string {
  return markdown.render(source);
}