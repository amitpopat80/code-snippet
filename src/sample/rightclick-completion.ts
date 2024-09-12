import * as vscode from 'vscode';

export class CompletionProvider {
  private _editor: vscode.TextEditor | undefined;

  constructor(context: vscode.ExtensionContext) {
    // Register the command that will be called from the context menu
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand('twinny.getCompletion', this.handleGetCompletion, this)
    );

    // Register the context menu item
    context.subscriptions.push(
      vscode.commands.registerCommand('twinny.showCompletionMenu', this.showCompletionMenu)
    );
  }

  private async handleGetCompletion(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
    this._editor = textEditor;
    const document = textEditor.document;
    const selection = textEditor.selection;

    const prefixSuffix = this.getPrefixSuffix(document, selection);
    if (!prefixSuffix) return;

    const { prefix, suffix } = prefixSuffix;
    const prompt = this.createPrompt(prefix, suffix);

    // Call the API or generate completion here
    const completion = await this.getCompletion(prompt);

    // Insert the completion at the cursor position
    textEditor.edit(editBuilder => {
      editBuilder.insert(selection.start, completion);
    });
  }

  private showCompletionMenu = () => {
    vscode.commands.executeCommand('twinny.getCompletion');
  }

  private getPrefixSuffix(document: vscode.TextDocument, selection: vscode.Selection) {
    const startLine = Math.max(0, selection.start.line - 10);
    const endLine = Math.min(document.lineCount - 1, selection.end.line + 10);

    const prefix = document.getText(
      new vscode.Range(startLine, 0, selection.start.line, selection.start.character)
    );

    const suffix = document.getText(
      new vscode.Range(selection.end.line, selection.end.character, endLine, document.lineAt(endLine).text.length)
    );

    return { prefix, suffix };
  }

  private createPrompt(prefix: string, suffix: string): string {
    return `<PRE>${prefix.trim()}<MID>${suffix.trim()}<SUF>`;
  }

  private async getCompletion(prompt: string): Promise<string> {
    // This is where you'd call your AI service
    // For this example, we'll just return a placeholder
    return "// AI generated code here";
  }
}


{
    "contributes": {
      "commands": [
        {
          "command": "twinny.showCompletionMenu",
          "title": "Get AI Completion"
        }
      ],
      "menus": {
        "editor/context": [
          {
            "when": "editorTextFocus",
            "command": "twinny.showCompletionMenu",
            "group": "navigation"
          }
        ]
      }
    }
  }

  import * as vscode from 'vscode';
import { CompletionProvider } from './completion-provider';

export function activate(context: vscode.ExtensionContext) {
  new CompletionProvider(context);
}