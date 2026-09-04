import os
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Chatbot Assessment")

# Mount Static directory
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class Message(BaseModel):
    role: str
    content: str

class ChatPayload(BaseModel):
    messages: List[Message]

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/chat")
async def chat(payload: ChatPayload):
    if not payload.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY missing on server")

    formatted_contents = [
        {
            "role": "user" if msg.role == "user" else "model",
            "parts": [{"text": msg.content}]
        }
        for msg in payload.messages
    ]

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json={"contents": formatted_contents}, headers=headers)
        res_data = response.json()

        if response.status_code != 200:
            error_msg = res_data.get("error", {}).get("message", "API Error occurred")
            raise HTTPException(status_code=response.status_code, detail=error_msg)

        ai_response = res_data["candidates"][0]["content"]["parts"][0]["text"]
        return {"role": "assistant", "content": ai_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))