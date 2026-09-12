# PanelNotes

A VS Code panel for quick access to Markdown, HTML, and built-in workspace notes.

---
## Roadmap

Panel Notes v0.1.0 focuses on one thing: making Markdown files in a workspace easy to access from the VS Code panel.

### File Discovery & Refresh 

- [ ] File system watcher instead of startup-only scanning to update in/close to real time
- [ ] Manual refresh button
- [ ] Hide/exclude specific Markdown files or directories
- [ ] Better empty-state UI when no Markdown files exist

### Organization & Navigation

- [ ] Custom ordering of notes
- [ ] Pin favorite notes to the top
- [ ] Custom display names
- [ ] Group notes by directory
- [ ] Collapsible directory sections
- [ ] Search/filter notes
- [ ] Recently opened notes
- [ ] Remember the last opened note
- [ ] Table of contents for long Markdown files
- [ ] Heading navigation
- [ ] Internal anchor-link support

### Configuration

- [ ] Optional manual entries in `panel-notes.json` wont be over written when auto search does its thing.

### Appearance & Theming

- [ ] Light theme support
- [ ] Additional Markdown themes
- [ ] User-selectable syntax highlighting themes

### Additional Content Types

- [ ] HTML note support
- [ ] Plain-text note support
- [ ] Additional document types based on user feedback
- [ ] Scratch pad so a user doesnt need to create a file to do the same thing for quick notes

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
