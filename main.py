import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
import requests

app = FastAPI()
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
static_dir = BASE_DIR / "static"
templates_dir = BASE_DIR / "templates"

static_dir.mkdir(exist_ok=True)
templates_dir.mkdir(exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")
templates = Jinja2Templates(directory=templates_dir)

@app.get("/")
def read_root(request: Request):
    index_file = templates_dir / "index.html"
    if index_file.exists():
        return templates.TemplateResponse("index.html", {"request": request})
    return {"message": "AI Chatbox API is running!"}

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    try:
        data = await request.json()
        user_message = data.get("message") or data.get("prompt") or data.get("text") or ""
        persona = data.get("persona", "angelic")
        user_name = data.get("userName", "Guest")
    except Exception:
        # Fallback if raw text or form data is sent
        body = await request.body()
        user_message = body.decode("utf-8")
        persona = "angelic"
        user_name = "Guest"

    if not user_message:
        return {"response": "Please enter a message."}

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"response": "Gemini API key is missing. Add GEMINI_API_KEY to .env and restart the server."}

    # Persona system prompts
    persona_prompts = {
        "angelic": f"You are RUDRI, a helpful, kind, and angelic AI assistant speaking to {user_name}. Be positive, supportive, and always aim to help.",
        "evil": f"You are RUDRI, a mischievous and witty AI assistant speaking to {user_name}. Be clever, slightly sarcastic, and entertaining. Push boundaries playfully but don't be harmful."
    }
    
    system_prompt = persona_prompts.get(persona, persona_prompts["angelic"])

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_message}]}]
    }

    try:
        result = requests.post(
            url,
            params={"key": api_key},
            json=payload,
            timeout=30,
        )
        result.raise_for_status()
        response_data = result.json()
        bot_reply = response_data["candidates"][0]["content"]["parts"][0]["text"]
        return {"response": bot_reply}
    except requests.RequestException as error:
        return {"response": f"Gemini request failed: {error}"}
    except (KeyError, IndexError, TypeError):
        return {"response": "Gemini returned an unexpected response. Please try again."}