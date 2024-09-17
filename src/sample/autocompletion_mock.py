from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json
import asyncio
import re

app = FastAPI()

# ... (keep your existing endpoints)

@app.post("/v1/completions")
async def completions(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    max_tokens = body.get("max_tokens", 50)
    
    # Simple autocomplete logic
    completions = [
        ("def ", "define a new function"),
        ("class ", "define a new class"),
        ("for ", "start a for loop"),
        ("if ", "start an if statement"),
        ("while ", "start a while loop"),
        ("return ", "return a value from a function"),
        ("import ", "import a module"),
        ("from ", "import specific items from a module"),
        ("print(", "print to the console"),
        ("len(", "get the length of an object"),
        ("range(", "create a range of numbers"),
    ]
    
    # Extract the last word or partial word from the prompt
    last_word = re.findall(r'\w+$', prompt)
    last_word = last_word[0] if last_word else ""
    
    async def generate():
        for completion, description in completions:
            if completion.lower().startswith(last_word.lower()):
                suggestion = completion[len(last_word):]
                response = {
                    "choices": [{
                        "text": suggestion,
                        "index": 0,
                        "logprobs": None,
                        "finish_reason": "length"
                    }],
                    "usage": {
                        "prompt_tokens": len(prompt),
                        "completion_tokens": len(suggestion),
                        "total_tokens": len(prompt) + len(suggestion)
                    }
                }
                yield "data: " + json.dumps(response) + "\n\n"
                await asyncio.sleep(0.05)
                
                if len(suggestion) >= max_tokens:
                    break
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
