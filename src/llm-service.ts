import * as vscode from 'vscode';

export class LLMService {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async chat(message: string): Promise<string> {
    // Simulate a delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a test message
    return `This is a test response to: "${message}"`;
  }

  async updateSettings(apiUrl: string, apiKey: string): Promise<void> {
    await this.context.globalState.update('llmApiUrl', apiUrl);
    await this.context.globalState.update('llmApiKey', apiKey);
  }
}