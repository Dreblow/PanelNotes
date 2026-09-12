# PanelNotes

A VS Code panel for quick access to Markdown, HTML, and built-in workspace notes.

---
## Roadmap

Panel Notes v0.1.0 focuses on one thing: making Markdown files in a workspace easy to access from the VS Code panel.

### File Discovery & Refresh 

- [ ] Better empty-state UI when no Markdown files exist

### Organization & Navigation

- [ ] Custom ordering of notes
- [ ] Pin favorite notes to the top
- [ ] Group notes by directory
- [ ] Recently opened notes
- [X] Remember the last opened note

### Configuration

- [ ] Optional manual entries in `panel-notes.json` wont be over written when auto search does its thing.

### Additional Content Types

- [ ] HTML note support
- [ ] Plain-text note support
- [ ] Additional document types based on user feedback

### Accessibility & Polish

- [ ] General UI polish based on user feedback
---

## Development Setup

Install the project dependencies:

```bash
npm install
```

If you add new dependencies, install them through npm so they are recorded in `package.json` and `package-lock.json`.

For example:

```bash
npm install markdown-it
npm install --save-dev @types/markdown-it
```

## Build

Compile the TypeScript source:

```bash
npm run compile
```

## Package the VS Code Extension

Create a local `.vsix` package for testing:

```bash
npx @vscode/vsce package
```

This will create a file similar to:

```text
panel-notes-0.1.0.vsix
```

## Install the Test Package

Install the generated extension package into VS Code:

```bash
code --install-extension panel-notes-0.1.0.vsix --force
```

Then reload VS Code to test the newly installed version.

The `--force` option is useful during development because it replaces the currently installed version with the newly packaged build.


## One Stop Shop

```bash
npm run compile && npx @vscode/vsce package && code --install-extension panel-notes-0.1.0.vsix --force && osascript -e 'tell application "Visual Studio Code" to quit'
```
