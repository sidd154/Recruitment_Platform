import json
import os
from typing import Dict, Any

STORE_FILE = "demo_local_store.json"

def _load_store() -> Dict[str, Any]:
    if os.path.exists(STORE_FILE):
        try:
            with open(STORE_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def _save_store(data: Dict[str, Any]):
    with open(STORE_FILE, "w") as f:
        json.dump(data, f, indent=2)

def save_session(session_id: str, data: dict):
    store = _load_store()      
    store[session_id] = data
    _save_store(store)

def get_session(session_id: str) -> dict | None:
    store = _load_store()      
    return store.get(session_id)

def delete_session(session_id: str):
    store = _load_store()
    if session_id in store:
        del store[session_id]
        _save_store(store)

def get_all_sessions() -> Dict[str, Any]:
    return _load_store()
