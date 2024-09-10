import * as vscode from 'vscode';

export class LLMService {
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async chat(message: string, fileContent: string = '', fileName: string = ''): Promise<string> {
    // Simulate a delay to mimic network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Prepare context information
    let contextInfo = '';
    if (fileContent && fileName) {
      contextInfo = `\n\nContext from file "${fileName}":\n${fileContent.substring(0, 500)}${fileContent.length > 500 ? '...' : ''}`;
    }

    // Return a test message that includes the file content if provided
    return `This is a test response to: "${message}"${contextInfo}`;
  }

  async updateSettings(apiUrl: string, apiKey: string): Promise<void> {
    await this.context.globalState.update('llmApiUrl', apiUrl);
    await this.context.globalState.update('llmApiKey', apiKey);
  }
}