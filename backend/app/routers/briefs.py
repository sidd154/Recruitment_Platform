from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.supabase import get_supabase
from app.services.auth_middleware import require_recruiter

router = APIRouter(prefix="/briefs", tags=["briefs"])

class RecruiterMCQ(BaseModel):
    question: str
    expected_keywords: List[str]

class JobBriefCreate(BaseModel):
    focus_areas: List[str]
    recruiter_mcqs: List[RecruiterMCQ]
    instructions: str = ""

@router.post("/{job_id}")
def create_job_brief(job_id: str, brief_data: JobBriefCreate, user: dict = Depends(require_recruiter)):
    client = get_supabase()
    user_id = user["user_id"]
    
    # Verify job owner
    job = client.table("jobs").select("recruiter_id").eq("id", job_id).single().execute()
    if not job.data or job.data["recruiter_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    if len(brief_data.recruiter_mcqs) > 10:
        raise HTTPException(status_code=400, detail="Max 10 questions allowed")
        
    insert_data = {
        "job_id": job_id,
        "focus_areas": brief_data.focus_areas,
        "recruiter_mcqs": [mcq.model_dump() for mcq in brief_data.recruiter_mcqs],
        "instructions": brief_data.instructions
    }
    
    # Upsert or insert (using upsert by constraint)
    resp = client.table("job_briefs").upsert(insert_data, on_conflict="job_id").execute()
    
    return {"message": "Brief builder saved"}

@router.get("/{job_id}")
def get_job_brief(job_id: str, user: dict = Depends(require_recruiter)):
    client = get_supabase()
    user_id = user["user_id"]
    
    # Verify job owner
    job = client.table("jobs").select("recruiter_id").eq("id", job_id).single().execute()
    if not job.data or job.data["recruiter_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    resp = client.table("job_briefs").select("*").eq("job_id", job_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Brief not found")
        
    return resp.data
