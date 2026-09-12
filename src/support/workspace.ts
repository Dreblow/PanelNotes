import * as vscode from "vscode";

import {
  loadPanelNotesConfig,
  PanelNoteItem
} from "../config";


interface PanelNotesConfig {
  items: PanelNoteItem[];
}


/**
 * Remove config entries whose files no longer exist.
 *
 * Existing entries are otherwise preserved exactly as-is.
 */
export async function cleanPanelNotesConfig(): Promise<void> {
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    return;
  }

  const vscodeDirectory =
    vscode.Uri.joinPath(
      workspaceFolder.uri,
      ".vscode"
    );

  const configUri =
    vscode.Uri.joinPath(
      vscodeDirectory,
      "panel-notes.json"
    );

  let configExists = true;

  try {
    await vscode.workspace.fs.stat(configUri);
  } catch {
    configExists = false;
  }

  const config =
    await loadPanelNotesConfig();

  const validItems: PanelNoteItem[] = [];

  for (const item of config.items) {
    if (!item.path) {
      continue;
    }

    const itemUri =
      vscode.Uri.joinPath(
        workspaceFolder.uri,
        item.path
      );

    try {
      await vscode.workspace.fs.stat(itemUri);

      validItems.push(item);
    } catch {
      // File no longer exists.
    }
  }

  const changed =
    validItems.length !== config.items.length;

  if (
    configExists &&
    !changed
  ) {
    return;
  }

  await writePanelNotesConfig({
    items: validItems
  });
}


/**
 * Add the currently active Markdown file to Panel Notes.
 *
 * Returns true only when a new item was added.
 */
export async function addActiveMarkdownFile(): Promise<boolean> {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return false;
  }

  if (editor.document.languageId !== "markdown") {
    return false;
  }

  return addMarkdownFile(
    editor.document.uri
  );
}


/**
 * Add a Markdown file to panel-notes.json.
 *
 * Existing entries are preserved exactly as-is.
 * Duplicate paths are ignored.
 *
 * Returns true only when a new item was added.
 */
export async function addMarkdownFile(
  uri: vscode.Uri
): Promise<boolean> {
  const workspaceFolder =
    vscode.workspace.getWorkspaceFolder(uri);

  if (!workspaceFolder) {
    return false;
  }

  if (
    !uri.path.toLowerCase().endsWith(".md")
  ) {
    return false;
  }

  const relativePath =
    vscode.workspace.asRelativePath(
      uri,
      false
    );

  const config =
    await loadPanelNotesConfig();

  const alreadyExists =
    config.items.some(
      (item) =>
        normalizePath(item.path) ===
        normalizePath(relativePath)
    );

  if (alreadyExists) {
    return false;
  }

  const newItem: PanelNoteItem = {
    name: relativePath,
    path: relativePath,
    type: "markdown"
  };

  config.items.push(newItem);

  await writePanelNotesConfig(config);

  return true;
}


/**
 * Write panel-notes.json.
 *
 * Creates .vscode automatically when needed.
 */
async function writePanelNotesConfig(
  config: PanelNotesConfig
): Promise<void> {
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    return;
  }

  const vscodeDirectory =
    vscode.Uri.joinPath(
      workspaceFolder.uri,
      ".vscode"
    );

  const configUri =
    vscode.Uri.joinPath(
      vscodeDirectory,
      "panel-notes.json"
    );

  await vscode.workspace.fs.createDirectory(
    vscodeDirectory
  );

  const contents =
    JSON.stringify(
      config,
      null,
      2
    ) + "\n";

  await vscode.workspace.fs.writeFile(
    configUri,
    new TextEncoder().encode(contents)
  );
}


/**
 * Normalize paths for duplicate comparisons.
 */
function normalizePath(
  path: string | undefined
): string {
  return (path ?? "")
    .replace(/\\/g, "/")
    .toLowerCase();
}