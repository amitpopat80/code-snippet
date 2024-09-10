import * as vscode from 'vscode';
import { LLMService } from './llm-service';
import { getChatViewContent } from './chat-view';
import { getSettingsViewContent } from './settings-view';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _context: vscode.ExtensionContext,
    private readonly _llmService: LLMService
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri]
    };

    this._updateWebview();

    webviewView.webview.onDidReceiveMessage(async (data) => {
      if (data.type === 'sendMessage') {
        try {
          const reply = await this._llmService.chat(data.message);
          webviewView.webview.postMessage({ type: 'addMessage', reply });
        } catch (error) {
          vscode.window.showErrorMessage('Failed to get response from LLM');
        }
      } else if (data.type === 'saveSettings') {
        await this._llmService.updateSettings(data.apiUrl, data.apiKey);
        vscode.window.showInformationMessage('Settings saved successfully');
        this._updateWebview();
      }
    });
  }

  private _updateWebview() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'styles.css'));

    const nonce = getNonce();

    const currentSettings = {
      apiUrl: this._context.globalState.get('llmApiUrl', '') as string,
      apiKey: this._context.globalState.get('llmApiKey', '') as string
    };

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>LLM Extension</title>
    </head>
    <body>
        <div id="sidebar-container">
            <div id="tabs">
                <button id="chat-tab" class="tab-button active">Chat</button>
                <button id="settings-tab" class="tab-button">Settings</button>
            </div>
            <div id="content">
                ${getChatViewContent(webview)}
                ${getSettingsViewContent(webview, currentSettings)}
            </div>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}