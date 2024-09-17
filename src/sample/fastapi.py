from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from langchain.llms import OpenAI  # Or any other LLM you want to use
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
import json
import asyncio

app = FastAPI()

# Initialize your LangChain models
llm = OpenAI()
chat_model = ChatOpenAI()

@app.post("/v1/completions")
async def completions(request: Request):
    body = await request.json()
    prompt = body["prompt"]
    
    async def generate():
        for chunk in llm.stream(prompt):
            yield f"data: {json.dumps({'choices': [{'text': chunk}]})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    messages = body["messages"]
    
    async def generate():
        for chunk in chat_model.stream([HumanMessage(content=m["content"]) for m in messages]):
            yield f"data: {json.dumps({'choices': [{'delta': {'content': chunk.content}}]})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/v1/fim/completions")
async def fim_completions(request: Request):
    body = await request.json()
    prefix = body["prompt"]
    suffix = body["suffix"]
    
    async def generate():
        for chunk in llm.stream(f"{prefix}<fim_middle>{suffix}"):
            yield f"data: {json.dumps({'choices': [{'delta': {'content': chunk}}]})}\n\n"
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
