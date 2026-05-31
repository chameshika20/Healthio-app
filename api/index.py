from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class ScanData(BaseModel):
    food_name: str
    health_score: str
    warning: str
    alternative: str

def headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

@app.get("/")
@app.get("/api")
def home():
    return {"message": "Healthio API running"}

@app.post("/scan")
@app.post("/api/scan")
def save_scan(data: ScanData):
    url = f"{SUPABASE_URL}/rest/v1/food_scans"

    payload = {
        "food_name": data.food_name,
        "health_score": data.health_score,
        "warning": data.warning,
        "alternative": data.alternative,
    }

    response = requests.post(url, json=payload, headers=headers())

    return {
        "success": response.status_code in [200, 201],
        "status_code": response.status_code,
        "response": response.text,
    }

@app.get("/history")
@app.get("/api/history")
def get_history():
    url = f"{SUPABASE_URL}/rest/v1/food_scans?select=*&order=created_at.desc"

    response = requests.get(url, headers=headers())

    if response.status_code == 200:
        return response.json()

    return []