import * as vscode from 'vscode';

class VerticalDiffHandler {
    private editor: vscode.TextEditor;
    private range: vscode.Range;
    private decorationType: vscode.TextEditorDecorationType;

    constructor(editor: vscode.TextEditor, range: vscode.Range) {
        this.editor = editor;
        this.range = range;
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
            isWholeLine: true,
        });
    }

    async applyEdit(newText: string) {
        const oldText = this.editor.document.getText(this.range);
        const diffLines = this.computeDiff(oldText, newText);

        await this.editor.edit((editBuilder) => {
            editBuilder.replace(this.range, newText);
        });

        this.highlightChanges(diffLines);
    }

    private computeDiff(oldText: string, newText: string): string[] {
        // Simplified diff computation
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        return newLines.map((line, index) => {
            if (index >= oldLines.length || line !== oldLines[index]) {
                return '+' + line;
            }
            return ' ' + line;
        });
    }

    private highlightChanges(diffLines: string[]) {
        const decorations: vscode.DecorationOptions[] = [];
        diffLines.forEach((line, index) => {
            if (line.startsWith('+')) {
                const range = new vscode.Range(
                    this.range.start.line + index,
                    0,
                    this.range.start.line + index,
                    line.length
                );
                decorations.push({ range });
            }
        });
        this.editor.setDecorations(this.decorationType, decorations);
    }

    clear() {
        this.editor.setDecorations(this.decorationType, []);
    }
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.applyVerticalDiff', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('Please select a range of text');
            return;
        }

        const range = new vscode.Range(selection.start, selection.end);
        const handler = new VerticalDiffHandler(editor, range);

        // Simulating AI-generated edit
        const newText = await vscode.window.showInputBox({
            prompt: 'Enter new text (simulating AI-generated edit)',
            value: editor.document.getText(range)
        });

        if (newText) {
            await handler.applyEdit(newText);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}