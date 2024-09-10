import * as vscode from 'vscode';
import axios from 'axios';

export class LLMService {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  private get apiUrl(): string {
    return this.context.globalState.get('llmApiUrl', '') as string;
  }

  private get apiKey(): string {
    return this.context.globalState.get('llmApiKey', '') as string;
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat`,
        { message },
        { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
      );
      return response.data.reply;
    } catch (error) {
      console.error('Error in LLM chat:', error);
      throw new Error('Failed to get response from LLM');
    }
  }

  async updateSettings(apiUrl: string, apiKey: string): Promise<void> {
    await this.context.globalState.update('llmApiUrl', apiUrl);
    await this.context.globalState.update('llmApiKey', apiKey);
  }
}



export function getChatViewContent(webview: vscode.Webview): string {
  const nonce = getNonce();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLM Chat</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 10px;
            }
            #messages {
                height: 300px;
                overflow-y: auto;
                border: 1px solid #ccc;
                margin-bottom: 10px;
                padding: 10px;
            }
            #input-container {
                display: flex;
            }
            #message-input {
                flex-grow: 1;
                margin-right: 10px;
            }
        </style>
    </head>
    <body>
        <div id="chat-container">
            <div id="messages"></div>
            <div id="input-container">
                <input type="text" id="message-input" placeholder="Type your message...">
                <button id="send-button">Send</button>
            </div>
        </div>
        <script nonce="${nonce}">
            const vscode = acquireVsCodeApi();
            const messagesContainer = document.getElementById('messages');
            const messageInput = document.getElementById('message-input');
            const sendButton = document.getElementById('send-button');

            function addMessage(message, isUser) {
                const messageElement = document.createElement('div');
                messageElement.textContent = (isUser ? 'You: ' : 'LLM: ') + message;
                messagesContainer.appendChild(messageElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            sendButton.addEventListener('click', () => {
                const message = messageInput.value.trim();
                if (message) {
                    addMessage(message, true);
                    vscode.postMessage({ type: 'sendMessage', message });
                    messageInput.value = '';
                }
            });

            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendButton.click();
                }
            });

            window.addEventListener('message', (event) => {
                const message = event.data;
                switch (message.type) {
                    case 'addMessage':
                        addMessage(message.reply, false);
                        break;
                }
            });
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