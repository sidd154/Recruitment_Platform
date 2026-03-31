from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from app.services.supabase import get_supabase
from app.services.auth_middleware import require_recruiter, verify_token
from app.agents.graphs.brief_generator_graph import brief_generator_graph
from app.services import session_store
import uuid

router = APIRouter(prefix="/jobs", tags=["jobs"])

class RequiredSkill(BaseModel):
    skill_name: str
    category: str

class JobCreate(BaseModel):
    title: str
    description: str
    location: str
    job_type: str
    required_skills: List[RequiredSkill]
    min_experience_years: int

@router.post("")
def create_job(job_data: JobCreate, background_tasks: BackgroundTasks, user: dict = Depends(require_recruiter)):
    client = get_supabase()
    user_id = user["user_id"]
    
    # --- DEMO BYPASS START ---
    stored_user = session_store.get_session(f"user_by_id:{user_id}")
    if stored_user or user_id == "00000000-0000-0000-0000-000000000002":
        job_id = str(uuid.uuid4())
        
        job_dict = {
            "id": job_id,
            "recruiter_id": user_id,
            "title": job_data.title,
            "description": job_data.description,
            "location": job_data.location,
            "job_type": job_data.job_type,
            "required_skills": [s.model_dump() for s in job_data.required_skills],
            "min_experience_years": job_data.min_experience_years,
            "is_active": True
        }
        
        jobs_list = session_store.get_session(f"demo_jobs_{user_id}") or []
        jobs_list.insert(0, job_dict)
        session_store.save_session(f"demo_jobs_{user_id}", jobs_list)
        
        def run_brief_gen_demo():
            import asyncio
            state = {
                "job_id": job_id,
                "job_title": job_data.title,
                "job_description": job_data.description,
                "skills": [s.skill_name for s in job_data.required_skills],
                "experience": job_data.min_experience_years,
                "recruiter_id": user_id,
                "focus_areas": [],
                "recruiter_mcqs": [],
                "instructions": "",
                "error": ""
            }
            asyncio.run(brief_generator_graph.ainvoke(state))

        background_tasks.add_task(run_brief_gen_demo)
        return job_dict
    # --- DEMO BYPASS END ---
    
    # Check verification
    rec_resp = client.table("recruiters").select("is_verified").eq("id", user_id).single().execute()
    if not rec_resp.data or not rec_resp.data.get("is_verified"):
        raise HTTPException(status_code=403, detail="Account pending verification")
        
    insert_data = job_data.model_dump()
    insert_data["recruiter_id"] = user_id
    
    resp = client.table("jobs").insert(insert_data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Failed to create job")
        
    job_id = resp.data[0]["id"]
    
    def run_brief_gen():
        import asyncio
        state = {
            "job_id": job_id,
            "job_title": job_data.title,
            "job_description": job_data.description,
            "skills": [s.skill_name for s in job_data.required_skills],
            "experience": job_data.min_experience_years,
            "recruiter_id": user_id,
            "focus_areas": [],
            "recruiter_mcqs": [],
            "instructions": "",
            "error": ""
        }
        asyncio.run(brief_generator_graph.ainvoke(state))

    background_tasks.add_task(run_brief_gen)

    return resp.data[0]

@router.get("")
def list_jobs(user: dict = Depends(verify_token)):
    client = get_supabase()
    user_id = user["user_id"]
    role = user.get("role")
    
    # --- DEMO BYPASS START ---
    if role == "candidate":
        all_jobs = []
        full_data = session_store.get_all_sessions()
        for key, val in full_data.items():
            if key.startswith("demo_jobs_"):
                all_jobs.extend(val)
        return all_jobs
    if role == "recruiter":
        return session_store.get_session(f"demo_jobs_{user_id}") or []
    # --- DEMO BYPASS END ---
    
    if role == "candidate":
        # Candidate gets all active jobs
        resp = client.table("jobs").select("*").eq("is_active", True).order("created_at", desc=True).execute()
        return resp.data

    # Check verification for recruiter
    rec_resp = client.table("recruiters").select("is_verified").eq("id", user_id).single().execute()
    if not rec_resp.data or not rec_resp.data.get("is_verified"):
        raise HTTPException(status_code=403, detail="Account pending verification")
        
    resp = client.table("jobs").select("*").eq("recruiter_id", user_id).order("created_at", desc=True).execute()
    return resp.data

@router.get("/{job_id}/applicants")
def get_job_applicants(job_id: str, user: dict = Depends(require_recruiter)):
    client = get_supabase()
    user_id = user["user_id"]
    DEMO_RECRUITER_ID = "00000000-0000-0000-0000-000000000002"
    DEMO_CANDIDATE_ID = "00000000-0000-0000-0000-000000000001"
    from app.services import session_store

    # --- DEMO BYPASS: check if this is a demo job first ---
    is_demo_job = False
    if user_id == DEMO_RECRUITER_ID:
        demo_jobs = session_store.get_session(f"demo_jobs_{user_id}") or []
        job_match = next((j for j in demo_jobs if j.get("id") == job_id), None)
        if job_match:
            is_demo_job = True
        else:
            raise HTTPException(status_code=403, detail="Unauthorized")
    else:
        # Real recruiter: verify ownership in Supabase
        job = client.table("jobs").select("recruiter_id").eq("id", job_id).single().execute()
        if not job.data or job.data.get("recruiter_id") != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
    
    applicants = []

    if not is_demo_job:
        # Get all applications for this job, joining candidates (and profiles if needed)
        resp = client.table("applications").select("*, candidates(*, profiles(*)), interview_sessions(id, status)").eq("job_id", job_id).order("created_at", desc=True).execute()
        
        # Flatten the profiles into candidates for easier frontend consumption
        applicants = list(resp.data) if resp.data else []
        for app in applicants:
            if app.get("candidates") and app["candidates"].get("profiles"):
                profile_data = app["candidates"]["profiles"]
                app["candidates"]["full_name"] = profile_data.get("full_name")
                app["candidates"]["email"] = profile_data.get("email")
                app["candidates"]["phone"] = profile_data.get("phone")
                del app["candidates"]["profiles"]
    
    # Merge demo candidate applications from session_store (they can't be in Supabase due to auth FK)
    demo_apps = session_store.get_session(f"applications:{DEMO_CANDIDATE_ID}") or []
    demo_apps_for_job = [a for a in demo_apps if a.get("job_id") == job_id]
    
    for demo_app in demo_apps_for_job:
        # Build a candidate object the frontend expects
        demo_skills_data = session_store.get_session(f"skills:{DEMO_CANDIDATE_ID}") or {}
        demo_passport = session_store.get_session(f"passport:{DEMO_CANDIDATE_ID}")
        demo_candidate = {
            "id": DEMO_CANDIDATE_ID,
            "full_name": "Demo Candidate",
            "email": "demo.candidate@skillbridge.dev",
            "phone": "0000000000",
            "college": "Demo University",
            "graduation_year": 2024,
            "degree": "B.Tech",
            "extracted_skills": demo_skills_data.get("extracted_skills", []),
            "github_link": demo_skills_data.get("github_link", ""),
            "leetcode_link": demo_skills_data.get("leetcode_link", ""),
            "passport_id": demo_passport.get("id") if demo_passport else None,
        }
        # Build interview_sessions from demo data
        interview_sessions = []
        if demo_app.get("interview_session_id"):
            interview_sessions = [{"id": demo_app["interview_session_id"], "status": demo_app.get("interview_session_status", "pending")}]
        enriched = {**demo_app, "candidates": demo_candidate, "interview_sessions": interview_sessions}
        applicants.append(enriched)
        
    return applicants
