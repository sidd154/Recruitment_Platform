from fastapi import APIRouter, Depends
from app.services.supabase import get_supabase
from app.services.auth_middleware import verify_token

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("")
def get_notifications(user: dict = Depends(verify_token)):
    client = get_supabase()
    user_id = user["user_id"]
    
    resp = client.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return resp.data

@router.put("/{id}/read")
def mark_notification_read(id: str, user: dict = Depends(verify_token)):
    client = get_supabase()
    user_id = user["user_id"]
    
    # Optional ownership check before update
    client.table("notifications").update({"is_read": True}).eq("id", id).eq("user_id", user_id).execute()
    return {"message": "Notification read"}
