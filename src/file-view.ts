import * as vscode from 'vscode';

export function getFileViewContent(webview: vscode.Webview, fileName: string, fileContent: string): string {
  return `
    <div id="file-view" class="view">
      <h2>Current File: ${fileName}</h2>
      <pre id="file-content">${escapeHtml(fileContent)}</pre>
      <div class="file-context-control">
        <input type="checkbox" id="use-file-content-checkbox" />
        <label for="use-file-content-checkbox">Use as Context</label>
      </div>
    </div>
  `;
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}