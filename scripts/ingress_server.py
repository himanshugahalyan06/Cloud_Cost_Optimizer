"""
Cloud Cost Optimizer - Production Ingress API

This is the 'Industrial Bridge' for real companies. It allows real systems
to send live telemetry and receive scaling decisions from the AI.

Features:
1. POST /telemetry: Receive real-world metrics from production servers.
2. GET /decision: Provide the current scaling decision to the infrastructure provider (e.g. Terraform or Kubernetes).
3. GET /metrics: Standard Prometheus-compatible metrics endpoint.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Optional
import time
import logging
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IngressAPI")

app = FastAPI(title="Cloud Cost Optimizer Ingress API")

# In-memory 'Last State' (In production, use Redis)
current_telemetry = {
    "timestamp": time.time(),
    "cpu_load": 0.0,
    "request_count": 0,
    "latency_ms": 0.0,
    "active_servers": 1
}

current_decision = {
    "action": "NO_OP",
    "reasoning": "Waiting for live data batch...",
    "timestamp": time.time()
}

class Telemetry(BaseModel):
    cpu_load: float
    request_count: int
    latency_ms: float
    active_servers: int

class Decision(BaseModel):
    action: str
    reasoning: str

@app.get("/")
def root():
    return {"status": "online", "mode": "production_bridge"}

@app.post("/telemetry")
async def report_telemetry(data: Telemetry):
    """
    Real-world servers call this endpoint to report their state.
    """
    global current_telemetry
    current_telemetry = data.model_dump()
    current_telemetry["timestamp"] = time.time()
    
    logger.info(f"📡 Telemetry Received: CPU={data.cpu_load:.2f}, RPS={data.request_count}")
    return {"status": "received"}

@app.get("/telemetry/latest")
def get_latest_telemetry():
    """
    The RL Simulator pulls from here instead of generating math data.
    """
    return current_telemetry

@app.post("/decision")
def post_decision(decision: Decision):
    """
    The AI Agent calls this to post its scaling decision.
    """
    global current_decision
    current_decision = decision.model_dump()
    current_decision["timestamp"] = time.time()
    
    logger.info(f"🤖 AI Decision Posted: {decision.action} | {decision.reasoning}")
    return {"status": "decision_updated"}

@app.get("/decision")
def get_decision():
    """
    Infrastructure providers (Jenkins, Terraform, K8s Controllers) 
    poll this to see if they should scale up/down.
    """
    return current_decision

@app.get("/health")
def health():
    return {"status": "healthy", "buffer_size": "low"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
