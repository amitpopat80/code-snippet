import * as vscode from 'vscode';
import { CancellationTokenSource } from 'vscode';
import { debounce } from 'lodash'; // You'll need to install this package

let lastCompletionRequest: CancellationTokenSource | undefined;

export function activate(context: vscode.ExtensionContext) {
    const provider = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, {
        provideInlineCompletionItems: async (document, position, context, token) => {
            // Cancel the last request if it's still pending
            if (lastCompletionRequest) {
                lastCompletionRequest.cancel();
            }

            // Create a new cancellation token source
            lastCompletionRequest = new CancellationTokenSource();

            try {
                const result = await debouncedFetchCompletions(document, position, lastCompletionRequest.token);
                
                if (token.isCancellationRequested || lastCompletionRequest.token.isCancellationRequested) {
                    return;
                }

                return result.map(text => ({
                    text,
                    range: new vscode.Range(position, position.translate(0, text.length))
                }));
            } catch (error) {
                console.error('Error fetching completions:', error);
                return [];
            }
        }
    });

    context.subscriptions.push(provider);
}

const debouncedFetchCompletions = debounce(fetchCompletions, 300);

async function fetchCompletions(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<string[]> {
    // Simulate an API call to an external service
    await new Promise(resolve => setTimeout(resolve, 500));

    if (token.isCancellationRequested) {
        throw new Error('Request cancelled');
    }

    // Replace this with your actual completion logic
    return ['completion1', 'completion2', 'completion3'];
}

export function deactivate() {}