import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.supabase import get_supabase
from app.config import settings

class SummarizerState(TypedDict):
    interview_session_id: str
    transcript: List[Dict[str, Any]]
    passport_skills: List[Dict[str, Any]]
    job_description: str
    recruiter_mcqs: List[Dict[str, Any]]
    code_snapshot: str
    summary: Dict[str, Any]

def analyse_transcript_node(state: SummarizerState):
    llm = ChatOpenAI(model=settings.AI_MODEL_NAME, temperature=0.1)
    
    sys_prompt = f"Call {settings.AI_MODEL_NAME} with full transcript and final candidate code environment snapshot. Generate: overall_score (0–100), communication_score (0–100, based on clarity, coherence, fluency), technical_score (0–100, based on accuracy of answers vs passport claims and final code quality), red_flags (list of objects: {{moment: string describing the issue, transcript_or_code_ref: exact quote from transcript or code snippet}}), standout_moments (same structure, for impressive answers). Return ONLY a JSON"
    transcript = json.dumps(state.get("transcript", []))
    code_snap = state.get("code_snapshot", "// No code submitted")
    content = f"TRANSCRIPT:\n{transcript}\n\nFINAL CODE SNAPSHOT:\n{code_snap}"
    
    try:
        resp = llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=content)])
        summary = json.loads(resp.content.replace('```json\n', '').replace('```', ''))
        return {"summary": summary}
    except Exception as e:
        return {"summary": {}}

def save_summary_node(state: SummarizerState):
    client = get_supabase()
    session_id = state["interview_session_id"]
    
    # Needs to get application_id from session
    session = client.table("interview_sessions").select("application_id").eq("id", session_id).single().execute()
    app_id = session.data.get("application_id")
    
    client.table("interview_sessions").update({
        "summary": state.get("summary", {}),
        "status": "completed"
    }).eq("id", session_id).execute()
    
    if app_id:
        client.table("applications").update({"status": "interview_done"}).eq("id", app_id).execute()
        
    return {"interview_session_id": session_id}

def build_summarizer_graph():
    builder = StateGraph(SummarizerState)
    builder.add_node("analyse_transcript_node", analyse_transcript_node)
    builder.add_node("save_summary_node", save_summary_node)
    
    builder.set_entry_point("analyse_transcript_node")
    builder.add_edge("analyse_transcript_node", "save_summary_node")
    builder.add_edge("save_summary_node", END)
    
    return builder.compile()

summarizer_graph = build_summarizer_graph()
