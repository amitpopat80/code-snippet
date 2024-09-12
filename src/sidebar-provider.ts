import * as vscode from 'vscode';
import { LLMService } from './llm-service';
import { getChatViewContent } from './chat-view';
import { getSettingsViewContent } from './settings-view';
import { getFileViewContent } from './file-view';

export class SidebarProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;
	private _llmService: LLMService;

	constructor(
		private readonly _context: vscode.ExtensionContext,
		llmService: LLMService
	) {
		this._llmService = llmService;
	}

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
			switch (data.type) {
				case 'sendMessage':
					try {
						const reply = await this._llmService.chat(data.message, data.fileContent, data.fileName);
						webviewView.webview.postMessage({ type: 'addMessage', reply });
					} catch (error) {
						vscode.window.showErrorMessage('Failed to get response from LLM');
					}
					break;
				case 'saveSettings':
					await this._llmService.updateSettings(data.apiUrl, data.apiKey);
					vscode.window.showInformationMessage('Settings saved successfully');
					break;
				case 'insertCode':
					this.insertCodeToEditor(data.code);
					break;
				case 'mergeCode':
					this.mergeCodeToEditor(data.code);
					break;
			}
		});

		// Listen for active editor changes
		vscode.window.onDidChangeActiveTextEditor(() => {
			this._updateWebview();
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

		const currentFile = vscode.window.activeTextEditor?.document.getText() || '';
		const currentFileName = vscode.window.activeTextEditor?.document.fileName || 'No file open';

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
					<button id="file-tab" class="tab-button">Current File</button>
					<button id="settings-tab" class="tab-button">Settings</button>
				</div>
				<div id="content">
					${getChatViewContent(webview)}
					${getFileViewContent(webview, currentFileName, currentFile)}
					${getSettingsViewContent(webview, currentSettings)}
				</div>
			</div>
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	private _updateFileContent(webviewView: vscode.WebviewView) {
		const currentFile = vscode.window.activeTextEditor?.document.getText() || '';
		const fileName = vscode.window.activeTextEditor?.document.fileName || 'Untitled';
		webviewView.webview.postMessage({ 
			type: 'updateFileContent', 
			content: currentFile,
			fileName: fileName
		});
	}

	private insertCodeToEditor(code: string) {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, code);
			});
		}
	}

	private async mergeCodeToEditor(code: string) {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const fullRange = new vscode.Range(
				document.positionAt(0),
				document.positionAt(document.getText().length)
			);

			const mergeResult = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
				'vscode.executeDocumentMerge',
				document.uri,
				fullRange,
				code,
				'Merge code from LLM'
			);

			if (mergeResult) {
				await vscode.workspace.applyEdit(mergeResult);
			}
		}
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