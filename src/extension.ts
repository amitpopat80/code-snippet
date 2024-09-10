import * as vscode from 'vscode';
import { LLMService } from './llm-service';
import { SidebarProvider } from './sidebar-provider'

export function activate(context: vscode.ExtensionContext) {

console.log('LLM Extension is now active!');

  const llmService = new LLMService(context);
  const sidebarProvider = new SidebarProvider(context, llmService);

  const sidebarDisposable = vscode.window.registerWebviewViewProvider(
    "llm-extension-view",
    sidebarProvider
  );

  context.subscriptions.push(sidebarDisposable);

  // Register a command to open the LLM chat
  let disposable = vscode.commands.registerCommand('llm-extension.openChat', () => {
    vscode.commands.executeCommand('workbench.view.extension.llm-extension-sidebar');
  });

  context.subscriptions.push(disposable);

  // Add this line to show the view
  vscode.commands.executeCommand('workbench.view.extension.llm-extension-sidebar');
}

export function deactivate() {}