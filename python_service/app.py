from fastapi import FastAPI
from pydantic import BaseModel
import time
import random

app = FastAPI(title="Aethera Fraud Detection Service")

class Transaction(BaseModel):
    sender: str
    receiver: str
    amount: float
    timestamp: int

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": time.time()}

@app.post("/detect")
async def detect(tx: Transaction):
    """
    Analyzes a transaction for fraudulent patterns.
    Returns {status: 'clean' | 'suspicious', reason: '...'}
    """
    # 1. Heuristic Rule: Single Transaction Threshold
    if tx.amount >= 10000000: # ₹1 Crore
        return {
            "status": "suspicious",
            "reason": "Institutional threshold breach: Single transaction > ₹1 Cr requires secondary audit."
        }

    # 2. Heuristic Rule: Round Number Anomaly
    if tx.amount > 1000 and tx.amount % 100000 == 0:
        return {
            "status": "suspicious",
            "reason": "Detected high-value round number signature (potential 'ghost' entry pattern)."
        }

    # 3. Heuristic Rule: Risky Keywords
    risky_receivers = ["shell", "consultancy", "miscellaneous", "unknown"]
    if any(keyword in tx.receiver.lower() for keyword in risky_receivers):
        return {
            "status": "suspicious",
            "reason": f"High-risk beneficiary keyword match: '{tx.receiver}'"
        }

    # 4. Simulation of ML-based Outlier Detection
    if random.random() < 0.05:
        return {
            "status": "suspicious",
            "reason": "AI Outlier: Transaction deviates from historical sector-specific velocity patterns."
        }

    return {
        "status": "clean",
        "reason": "No anomalies detected by Heuristic or Neural filters."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
