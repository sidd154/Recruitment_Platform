from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict

router = APIRouter(tags=["proctoring"])

class ProctoringConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

manager = ProctoringConnectionManager()

@router.websocket("/ws/proctoring/{session_id}")
async def proctoring_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Here we would normally plug in Agent 3 (Proctoring Graph) for processing
            print(f"Proctoring event for {session_id}: {data}")
            # Acknowledge logic could be added here
    except WebSocketDisconnect:
        manager.disconnect(session_id)
