from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import networkx as nx
from api import ingest
from agent import orchestrator

# Global Graph instance
gst_graph = nx.DiGraph()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup - initialize graph, models, etc.
    print("Initializing GST Intelligence Engine...")
    yield
    # Cleanup
    print("Shutting down engine...")

app = FastAPI(
    title="GST Intelligence Engine",
    description="Graph-native, Agent-orchestrated GST Reconciliation and Risk Analysis System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router)
app.include_router(orchestrator.router)

@app.get("/")
def read_root():
    return {"message": "GST Intelligence Engine is running. Ready for agent orchestration."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
