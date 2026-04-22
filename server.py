from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from query import private_count, private_category_distribution, search_records
import os
from vault import initialize_vault, store_record, retrieve_record, retrieve_all, get_vault_stats, load_vault

# always initialize vault on startup if files don't exist
if not os.path.exists("vault.key") or not os.path.exists("vault_data.json"):
    initialize_vault()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize vault on startup if needed
if not os.path.exists("vault.key"):
    initialize_vault()

class StoreRequest(BaseModel):
    data: str
    category: str = "general"

class QueryRequest(BaseModel):
    epsilon: float = 1.0

class SearchRequest(BaseModel):
    keyword: str
    epsilon: float = 1.0

@app.get("/")
def root():
    return {"status": "vault online"}

@app.post("/store")
def store(req: StoreRequest):
    record_id = store_record(req.data, req.category)
    return {"success": True, "id": record_id}

@app.get("/records")
def get_records(category: str = None):
    records = retrieve_all(category)
    return {"records": records}

@app.get("/records/{record_id}")
def get_record(record_id: int):
    try:
        record = retrieve_record(record_id)
        return record
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/stats")
def stats():
    return get_vault_stats()

@app.post("/private-stats")
def private_stats(req: QueryRequest):
    distribution = private_category_distribution(req.epsilon)
    total = private_count(epsilon=req.epsilon)
    return {
        "distribution": distribution,
        "total": total
    }

@app.post("/search")
def search(req: SearchRequest):
    results = search_records(req.keyword, req.epsilon)
    return results

@app.delete("/records/{record_id}")
def delete_record(record_id: int):
    import json
    with open("vault_data.json", 'r') as f:
        vault = json.load(f)
    
    original_length = len(vault["records"])
    vault["records"] = [r for r in vault["records"] if r["id"] != record_id]
    
    if len(vault["records"]) == original_length:
        raise HTTPException(status_code=404, detail="Record not found")
    
    with open("vault_data.json", 'w') as f:
        json.dump(vault, f, indent=2)
    
    return {"success": True}