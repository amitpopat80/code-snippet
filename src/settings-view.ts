import * as vscode from 'vscode';

export function getSettingsViewContent(webview: vscode.Webview, currentSettings: { apiUrl: string, apiKey: string }): string {
  return `
    <div id="settings-view" class="view">
      <h2>LLM Connection Settings</h2>
      <div class="setting-group">
        <label for="api-url">API URL:</label>
        <input type="text" id="api-url" value="${currentSettings.apiUrl}" placeholder="Enter API URL">
      </div>
      <div class="setting-group">
        <label for="api-key">API Key:</label>
        <input type="password" id="api-key" value="${currentSettings.apiKey}" placeholder="Enter API Key">
      </div>
      <button id="save-settings">Save Settings</button>
    </div>
  `;
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}