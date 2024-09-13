import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('contextChat.start', () => {
        const panel = vscode.window.createWebviewPanel(
            'contextChat',
            'Context Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        panel.webview.html = getWebviewContent(context.extensionUri);

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'selectFile':
                        const files = await vscode.window.showOpenDialog({
                            canSelectMany: true,
                            openLabel: 'Select',
                            filters: {
                                'All files': ['*']
                            }
                        });
                        if (files && files.length > 0) {
                            const fileContents = await Promise.all(files.map(async file => {
                                const content = await vscode.workspace.fs.readFile(file);
                                return {
                                    name: path.basename(file.fsPath),
                                    content: content.toString()
                                };
                            }));
                            panel.webview.postMessage({ command: 'addFiles', files: fileContents });
                        }
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent(extensionUri: vscode.Uri): string {
    const scriptUri = vscode.Uri.joinPath(extensionUri, 'media', 'main.js');
    const styleUri = vscode.Uri.joinPath(extensionUri, 'media', 'style.css');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Context Chat</title>
        <link rel="stylesheet" href="${styleUri}">
    </head>
    <body>
        <div id="chat-container">
            <div id="chat-messages"></div>
            <div id="file-list"></div>
            <div id="input-container">
                <button id="select-files">Select Files</button>
                <input type="text" id="chat-input" placeholder="Type your message...">
                <button id="send-message">Send</button>
            </div>
        </div>
        <script src="${scriptUri}"></script>
    </body>
    </html>`;
}