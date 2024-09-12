import * as vscode from 'vscode';
import { LLMService } from './llm-service';
import { SidebarProvider } from './sidebar-provider';

export function activate(context: vscode.ExtensionContext) {
	console.log('LLM Extension is now active!');

	const llmService = new LLMService(context);
	const sidebarProvider = new SidebarProvider(context, llmService);

	const sidebarDisposable = vscode.window.registerWebviewViewProvider(
		"llm-extension-view",
		sidebarProvider
	);

	context.subscriptions.push(sidebarDisposable);

	// ... (keep other command registrations)
}

export function deactivate() {}