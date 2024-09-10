import * as vscode from 'vscode';

export function getChatViewContent(webview: vscode.Webview): string {
  return `
    <div id="chat-view" class="view active">
      <div id="messages"></div>
      <div id="input-container">
        <input type="text" id="message-input" placeholder="Type your message...">
        <button id="send-button">Send</button>
      </div>
    </div>
  `;
}