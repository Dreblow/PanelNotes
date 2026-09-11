import * as vscode from "vscode";

export type PanelNoteType = "markdown" | "html" | "note";

export interface PanelNoteItem {
  name: string;
  type: PanelNoteType;
  path?: string;
}

export interface PanelNotesConfig {
  items: PanelNoteItem[];
}

export async function loadPanelNotesConfig(): Promise<PanelNotesConfig> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    return {
      items: []
    };
  }

  const configUri = vscode.Uri.joinPath(
    workspaceFolder.uri,
    ".vscode",
    "panel-notes.json"
  );

  try {
    const file = await vscode.workspace.fs.readFile(configUri);
    const text = new TextDecoder("utf-8").decode(file);

    return JSON.parse(text) as PanelNotesConfig;
  } catch (error) {
    console.error(
      "Panel Notes: failed to load config",
      error
    );

    return {
      items: []
    };
  }
}