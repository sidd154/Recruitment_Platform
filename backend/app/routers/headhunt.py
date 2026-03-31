from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services.supabase import get_supabase
from app.services.auth_middleware import require_recruiter, require_candidate

router = APIRouter(prefix="/headhunt", tags=["headhunt"])

class HeadhuntRequest(BaseModel):
    candidate_id: str
    job_id: str
    message: str

class HeadhuntRespond(BaseModel):
    status: str # "accepted" or "declined"

@router.post("")
def headhunt_candidate(req: HeadhuntRequest, user: dict = Depends(require_recruiter)):
    client = get_supabase()
    recruiter_id = user["user_id"]
    
    # Verify candidate has active passport (Rule 6)
    cand = client.table("candidates").select("passport_id, skill_passports!inner(is_active)").eq("id", req.candidate_id).single().execute()
    if not cand.data or not cand.data.get("skill_passports") or not cand.data["skill_passports"].get("is_active"):
        raise HTTPException(status_code=400, detail="Cannot headhunt a candidate without active passport")
        
    resp = client.table("headhunt_invitations").insert({
        "recruiter_id": recruiter_id,
        "candidate_id": req.candidate_id,
        "job_id": req.job_id,
        "message": req.message
    }).execute()
    
    return {"message": "Invitation sent", "data": resp.data[0]}

@router.get("/invitations")
def get_invitations(user: dict = Depends(require_candidate)):
    client = get_supabase()
    user_id = user["user_id"]
    
    resp = client.table("headhunt_invitations").select("*, jobs(*), recruiters!inner(company_name)").eq("candidate_id", user_id).order("created_at", desc=True).execute()
    return resp.data

@router.put("/{invitation_id}/respond")
def respond_headhunt(invitation_id: str, data: HeadhuntRespond, user: dict = Depends(require_candidate)):
    if data.status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    client = get_supabase()
    user_id = user["user_id"]
    
    inv = client.table("headhunt_invitations").select("*").eq("id", invitation_id).eq("candidate_id", user_id).single().execute()
    if not inv.data:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    client.table("headhunt_invitations").update({"status": data.status}).eq("id", invitation_id).execute()
    
    if data.status == "accepted":
        # Create an application based on this
        client.table("applications").insert({
            "job_id": inv.data["job_id"],
            "candidate_id": user_id,
            "source": "recruiter_headhunted",
            "status": "interview_pending"
        }).execute()
        
    return {"message": f"Invitation {data.status}"}
