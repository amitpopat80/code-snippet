import * as vscode from 'vscode';
import { ChatService } from './chat-service';
import { SidebarProvider } from './sidebar-provider';

export function activate(context: vscode.ExtensionContext) {
  const sidebarProvider = new SidebarProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "twinny-sidebar",
      sidebarProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('twinny.start', () => {
      vscode.commands.executeCommand('workbench.view.extension.twinny-sidebar-view');
    })
  );
}