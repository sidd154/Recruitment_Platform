from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, List
from app.services.supabase import get_supabase
from app.services.auth_middleware import require_candidate
from app.agents.graphs.passport_issuer_graph import passport_issuer_graph
import datetime
import asyncio

router = APIRouter(prefix="/tests", tags=["tests"])

@router.get("/job/{job_id}/mcqs")
def get_job_mcqs(job_id: str, user: dict = Depends(require_candidate)):
    client = get_supabase()
    resp = client.table("job_briefs").select("mass_mcqs").eq("job_id", job_id).single().execute()
    if not resp.data or not resp.data.get("mass_mcqs"):
        raise HTTPException(status_code=404, detail="No MCQs found for this job")
        
    mcqs = resp.data["mass_mcqs"]
    # Strip answers
    sanitized_mcqs = []
    for q in mcqs:
        sanitized_mcqs.append({
            "question": q.get("question"),
            "options": q.get("options")
        })
    return {"questions": sanitized_mcqs}

class JobAnswersModel(BaseModel):
    answers: Dict[str, str]

@router.post("/job/{job_id}/submit")
def submit_job_mcqs(job_id: str, data: JobAnswersModel, user: dict = Depends(require_candidate)):
    client = get_supabase()
    user_id = user["user_id"]
    
    # Calculate MCQ Score
    mcq_score = 0.0
    brief_resp = client.table("job_briefs").select("mass_mcqs").eq("job_id", job_id).single().execute()
    if brief_resp.data and brief_resp.data.get("mass_mcqs"):
        mcqs = brief_resp.data["mass_mcqs"]
        correct = 0
        total = len(mcqs)
        for i, q in enumerate(mcqs):
            cand_answer = data.answers.get(str(i))
            if cand_answer and cand_answer == q.get("correct_answer"):
                correct += 1
        if total > 0:
            mcq_score = (correct / total) * 100
            
    # Update application
    client.table("applications").update({"mcq_score": mcq_score, "status": "test_completed"}).eq("job_id", job_id).eq("candidate_id", user_id).execute()
    
    return {"message": "Test evaluated", "score": mcq_score}



class ConsentModel(BaseModel):
    consent: bool

class AnswersModel(BaseModel):
    answers: Dict[str, str]

@router.get("/{session_id}")
def get_test_session(session_id: str, user: dict = Depends(require_candidate)):
    # Check in-memory session store first (used for demo user)
    from app.services import session_store
    cached = session_store.get_session(session_id)
    if cached:
        return cached
    
    user_id = user["user_id"]
    client = get_supabase()
    resp = client.table("test_sessions").select("*").eq("id", session_id).eq("candidate_id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Test session not found. Please parse your resume first.")
        
    return resp.data

@router.post("/{session_id}/consent")
def submit_consent(session_id: str, data: ConsentModel, user: dict = Depends(require_candidate)):
    if not data.consent:
        raise HTTPException(status_code=400, detail="Consent is required to proceed")
    
    user_id = user["user_id"]
    
    client = get_supabase()
    resp = client.table("test_sessions").select("id").eq("id", session_id).eq("candidate_id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Test session not found")
        
    client.table("test_sessions").update({
        "proctoring_consent": True,
        "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }).eq("id", session_id).execute()
    
    return {"message": "Consent recorded"}

async def run_passport_issuer(candidate_id: str, session_id: str, answers: dict,
                              preloaded_questions: list = None, preloaded_skills: list = None):
    """Run Agent 4: Passport Issuer or Roadmap Generator, triggered after test submit."""
    # Use pre-loaded data if provided (demo user path)
    if preloaded_questions is not None:
        questions = preloaded_questions
        extracted_skills = preloaded_skills or []
    else:
        # Real user: fetch from Supabase
        client = get_supabase()
        session_resp = client.table("test_sessions").select("*").eq("id", session_id).single().execute()
        if not session_resp.data:
            return
        questions = session_resp.data.get("questions", [])
        candidate_resp = client.table("candidates").select("extracted_skills").eq("id", candidate_id).single().execute()
        extracted_skills = candidate_resp.data.get("extracted_skills", []) if candidate_resp.data else []
    
    state = {
        "session_id": session_id,
        "candidate_id": candidate_id,
        "answers": answers,
        "questions": questions,
        "proctoring_score": 100.0,
        "extracted_skills": extracted_skills,
        "score": 0.0,
        "passed": False,
        "error": ""
    }
    
    await passport_issuer_graph.ainvoke(state)

@router.post("/{session_id}/submit")
async def submit_test(session_id: str, data: AnswersModel, background_tasks: BackgroundTasks, user: dict = Depends(require_candidate)):
    user_id = user["user_id"]
    
    # Check session_store first (demo user sessions are stored in-memory)
    from app.services import session_store
    cached_session = session_store.get_session(session_id)
    
    if cached_session:
        if cached_session.get("answers"):
            raise HTTPException(status_code=400, detail="Test already submitted")
        cached_session["answers"] = data.answers
        session_store.save_session(session_id, cached_session)
        # Pass session data directly to avoid Supabase lookups in the passport issuer
        background_tasks.add_task(
            run_passport_issuer, user_id, session_id, data.answers,
            cached_session.get("questions", []),
            cached_session.get("extracted_skills", [])
        )
        return {"message": "Test submitted. Agent 4 is evaluating your results."}
    
    # Real user: read from Supabase
    client = get_supabase()
    resp = client.table("test_sessions").select("*").eq("id", session_id).eq("candidate_id", user_id).single().execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Test session not found")
        
    session = resp.data
    if session.get("answers"):
        raise HTTPException(status_code=400, detail="Test already submitted")
        
    client.table("test_sessions").update({
        "answers": data.answers,
        "completed_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }).eq("id", session_id).execute()
    
    background_tasks.add_task(run_passport_issuer, user_id, session_id, data.answers)
    
    return {"message": "Test submitted. Agent 4 is evaluating your results."}
