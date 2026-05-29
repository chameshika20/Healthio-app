from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = "https://vhdpszegzhkfxfsfkevc.supabase.co"
SUPABASE_KEY = "sb_publishable_5R09w9kV27alZI5XDXusQg_gRVN5rea"

class ScanData(BaseModel):
    food_name: str
    health_score: str
    warning: str
    alternative: str

def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

@app.get("/")
def home():
    return {
        "message": "Healthio backend running",
        "supabase_url_loaded": bool(SUPABASE_URL),
        "supabase_key_loaded": bool(SUPABASE_KEY)
    }

@app.post("/scan")
def save_scan(data: ScanData):
    try:
        url = f"{SUPABASE_URL}/rest/v1/food_scans"

        payload = {
            "food_name": data.food_name,
            "health_score": data.health_score,
            "warning": data.warning,
            "alternative": data.alternative
        }

        response = requests.post(url, json=payload, headers=get_headers())

        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "response_text": response.text
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/history")
def get_history():
    try:
        url = f"{SUPABASE_URL}/rest/v1/food_scans?select=*&order=created_at.desc"

        response = requests.get(url, headers=get_headers())

        if response.status_code == 200:
            return response.json()

        return []

    except Exception:
        return []