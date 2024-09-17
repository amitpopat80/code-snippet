from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import json
import asyncio

app = FastAPI()

# ... (keep your existing completions endpoint)

@app.post("/v1/fim/completions")
async def fim_completions(request: Request):
    body = await request.json()
    prefix = body.get("prompt", "")
    suffix = body.get("suffix", "")
    
    # Mock FIM completion for a simple function
    if "def calculate_" in prefix and "return result" in suffix:
        completion = [
            "    # Initialize the result",
            "    result = 0",
            "    ",
            "    # Perform the calculation",
            "    for num in numbers:",
            "        result += num",
            "    ",
            "    # Apply any additional processing",
            "    result *= multiplier",
            "    "
        ]
        
        async def generate():
            for line in completion:
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
        # Handle other FIM requests or return an error
        async def generate_error():
            error_response = {
                "error": "Unsupported FIM request"
            }
            yield "data: " + json.dumps(error_response) + "\n\n"
        
        return StreamingResponse(generate_error(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
