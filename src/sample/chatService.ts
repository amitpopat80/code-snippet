import { window, Webview } from 'vscode';
import { Message, ServerMessage } from '../common/types';
import { EVENT_NAME } from '../common/constants';

export class ChatService {
  private _webView?: Webview;

  constructor(webView: Webview) {
    this._webView = webView;
  }

  public async streamCompletion(messages: Message[]) {
    // Simulate streaming for this prototype
    const response = "This is a simulated response from the AI.";
    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      this._webView?.postMessage({
        type: EVENT_NAME.twinnyOnCompletion,
        value: {
          completion: response.slice(0, i + 1),
        }
      } as ServerMessage);
    }
  }
}