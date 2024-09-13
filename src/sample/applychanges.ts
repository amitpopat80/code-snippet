import * as vscode from 'vscode';
import { diffLines, Change } from 'diff';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.mergeAndDiff', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const document = editor.document;
        const originalText = document.getText();
        
        // Simulating new text (replace this with your actual new text generation)
        const newText = 'Updated content\nwith multiple\nlines of changes';

        const changes = diffLines(originalText, newText);
        await applyChangesInteractively(editor, changes);
    });

    context.subscriptions.push(disposable);
}

async function applyChangesInteractively(editor: vscode.TextEditor, changes: Change[]) {
    let offset = 0;
    for (const change of changes) {
        if (change.added || change.removed) {
            const startPosition = editor.document.positionAt(offset);
            const endPosition = editor.document.positionAt(offset + (change.removed ? change.value.length : 0));
            
            editor.selection = new vscode.Selection(startPosition, endPosition);
            editor.revealRange(new vscode.Range(startPosition, endPosition));

            const changeType = change.added ? 'addition' : 'deletion';
            const decision = await vscode.window.showInformationMessage(
                `Accept this ${changeType}?\n\n${change.value}`,
                { modal: true },
                'Yes',
                'No'
            );

            if (decision === 'Yes') {
                await editor.edit(editBuilder => {
                    if (change.added) {
                        editBuilder.insert(startPosition, change.value);
                    } else if (change.removed) {
                        editBuilder.delete(new vscode.Range(startPosition, endPosition));
                    }
                });
            }

            if (change.added && decision === 'Yes') {
                offset += change.value.length;
            } else if (change.removed && decision === 'No') {
                offset += change.value.length;
            }
        } else {
            offset += change.value.length;
        }
    }
}

export function deactivate() {}

/*
"contributes": {
    "commands": [
      {
        "command": "extension.mergeAndDiff",
        "title": "Merge and Diff"
      }
    ]
  },
*/