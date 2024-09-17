import * as vscode from 'vscode';

export class CompletionProvider implements vscode.InlineCompletionItemProvider {
  private _position: vscode.Position | undefined
  private _document: vscode.TextDocument | undefined

  // ... other class members and methods ...

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | undefined> {
    this._position = position
    this._document = document

    const prefixSuffix = this.getPrefixSuffix()
    if (!prefixSuffix) return

    const { prefix, suffix } = prefixSuffix
    const prompt = this.createPrompt(prefix, suffix)

    // Call the API or generate completion here
    const completion = await this.getCompletion(prompt)

    return [new vscode.InlineCompletionItem(completion)]
  }

  private getPrefixSuffix() {
    if (!this._document || !this._position) return

    const lineCount = this._document.lineCount
    const startLine = Math.max(0, this._position.line - 10)
    const endLine = Math.min(lineCount - 1, this._position.line + 10)

    const prefix = this._document.getText(
      new vscode.Range(startLine, 0, this._position.line, this._position.character)
    )

    const suffix = this._document.getText(
      new vscode.Range(this._position.line, this._position.character, endLine, this._document.lineAt(endLine).text.length)
    )

    return { prefix, suffix }
  }

  private createPrompt(prefix: string, suffix: string): string {
    return `<PRE>${prefix.trim()}<MID>${suffix.trim()}<SUF>`
  }

  private async getCompletion(prompt: string): Promise<string> {
    // This is where you'd call your AI service
    // For this example, we'll just return a placeholder
    return "// AI generated code here"
  }
}


//Mock

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

@app.post("/v1/completions")
async def completions(request: Request):
    body = await request.json()
    prompt = body["prompt"]
    
    if "def mysterious_function(x):" in prompt:
        optimized_code = [
            "def optimized_mysterious_function(x):",
            "    # This is actually a bubble sort algorithm",
            "    # We can optimize it by using Python's built-in sorted() function",
            "    return sorted(x)",
            "",
            "# Alternatively, if in-place sorting is required:",
            "def in_place_optimized_mysterious_function(x):",
            "    x.sort()",
            "    return x",
            "",
            "# Explanation:",
            "# 1. The original function implements a bubble sort algorithm, which has O(n^2) time complexity.",
            "# 2. Python's built-in sorted() and list.sort() methods use Timsort, which has O(n log n) time complexity.",
            "# 3. This optimization significantly improves performance, especially for larger lists.",
            "# 4. If in-place sorting is not required, use the first function. Otherwise, use the second function."
        ]
        
        async def generate():
            for line in optimized_code:
                response = {
                    "choices": [{
                        "text": line + "\n"
                    }]
                }
                yield "data: " + json.dumps(response) + "\n\n"
                await asyncio.sleep(0.1)  # Simulate some delay between chunks
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(generate(), media_type="text/event-stream")
    else:
        # Handle other prompts or return an error
        async def generate_error():
            error_response = {
                "error": "Unsupported prompt"
            }
            yield "data: " + json.dumps(error_response) + "\n\n"
        
        return StreamingResponse(generate_error(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
