from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .data import DataEngine
from .indicators import calculate_rsi
import numpy as np

app = FastAPI()
data_engine = DataEngine()

class TradeRequest(BaseModel):
    asset: str
    direction: str
    amount: float

@app.get("/api/signal")
async def get_signal(asset: str):
    df = data_engine.fetch_market_data(asset, '1min')
    rsi = calculate_rsi(df).iloc[-1]
    
    # Simple logic to be replaced by AI
    direction = "BUY" if rsi < 30 else "SELL" if rsi > 70 else "HOLD"
    confidence = 0.8 if direction != "HOLD" else 0.2
    
    return {"asset": asset, "direction": direction, "confidence": confidence}

@app.post("/api/trade")
async def execute_trade(request: TradeRequest):
    # In production, connect to IQ Option Execution Engine
    return {"status": "success", "message": f"Executed {request.direction} on {request.asset}"}

@app.get("/api/status")
async def get_status():
    return {"status": "running", "engine": "active"}

@app.get("/api/trades")
async def get_trades():
    return [
        {"timestamp": "2026-04-27T17:45:00Z", "asset": "EURUSD", "direction": "BUY", "result": "WIN", "profit": 40},
        {"timestamp": "2026-04-27T17:40:00Z", "asset": "EURUSD", "direction": "SELL", "result": "LOSS", "profit": -50}
    ]
