import * as vscode from 'vscode';

export function getSettingsViewContent(webview: vscode.Webview, currentSettings: { apiUrl: string, apiKey: string }): string {
  const nonce = getNonce();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLM Settings</title>
        <style>
            /* Add your styles here */
        </style>
    </head>
    <body>
        <div id="settings-container">
            <h2>LLM Connection Settings</h2>
            <input type="text" id="api-url" placeholder="API URL" value="${currentSettings.apiUrl}">
            <input type="text" id="api-key" placeholder="API Key" value="${currentSettings.apiKey}">
            <button id="save-settings">Save Settings</button>
        </div>
        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();
            // Add your settings logic here
        </script>
    </body>
    </html>
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