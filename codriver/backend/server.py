from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct"

app = FastAPI()

# Allow requests from your GH Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your domain
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str

@app.post("/api/chat")
def chat(msg: Message):
    url = "https://router.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    json_data = {
        "model": MODEL_ID,
        "messages": [{"role": "user", "content": msg.message}]
    }
    r = requests.post(url, headers=headers, json=json_data)
    reply = r.json()["choices"][0]["message"]["content"]
    return {"reply": reply}
