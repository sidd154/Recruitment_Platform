import json
import datetime
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.supabase import get_supabase
from app.config import settings


class PassportIssuerState(TypedDict):
    session_id: str
    candidate_id: str
    answers: Dict[str, str]
    questions: List[Dict[str, Any]]
    proctoring_score: float
    extracted_skills: List[Dict[str, Any]]
    score: float
    passed: bool
    error: str

def evaluate_answers_node(state: PassportIssuerState):
    questions = state.get("questions", [])
    answers = state.get("answers", {})
    
    correct = 0
    total = len(questions)
    
    for q in questions:
        qid = q.get("question_id")
        if answers.get(qid) == q.get("correct_answer"):
            correct += 1
            
    score = (correct / total) * 100 if total > 0 else 0
    passed = score >= settings.PASS_THRESHOLD  # Pass threshold
    
    return {"score": score, "passed": passed}

# Demo ID is now in settings.DEMO_CANDIDATE_ID

def issue_passport_node(state: PassportIssuerState):
    candidate_id = state["candidate_id"]
    
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=548)
    issued_at = datetime.datetime.now(datetime.timezone.utc)
    
    verified_skills = [dict(skill, proficiency_level=skill.get("proficiency_claimed", "intermediate"), verified=True)
                       for skill in state.get("extracted_skills", [])]
    
    # Use a unique ID per session for demo users to avoid stale data shadowing
    passport_id = f"passport-{state['session_id']}" if candidate_id == settings.DEMO_CANDIDATE_ID else f"passport-{candidate_id}"
    
    passport_data = {
        "id": passport_id,
        "candidate_id": candidate_id,
        "skills": verified_skills,
        "proctoring_score": round(state.get("score", 0.0), 1),
        "issued_at": issued_at.isoformat(),
        "expires_at": expires_at.isoformat(),
        "is_active": True
    }
    
    # For demo user: store in session_store (can't write to Supabase due to auth FK)
    if candidate_id == settings.DEMO_CANDIDATE_ID:
        from app.services import session_store
        session_store.save_session(f"passport:{candidate_id}", passport_data)
        return {"error": ""}
    
    client = get_supabase()
    resp = client.table("skill_passports").insert(passport_data).execute()
    
    if resp.data:
        passport_id = resp.data[0]["id"]
        client.table("candidates").update({"passport_id": passport_id}).eq("id", candidate_id).execute()
        client.table("improvement_roadmaps").delete().eq("candidate_id", candidate_id).execute()
        client.table("notifications").insert({
            "user_id": candidate_id,
            "type": "passport_issued",
            "payload": {"passport_id": passport_id}
        }).execute()
        
    return {"error": state.get("error", "")}

def generate_roadmap_node(state: PassportIssuerState):
    candidate_id = state["candidate_id"]
    llm = ChatOpenAI(model=settings.AI_MODEL_NAME, temperature=0.3)
    
    sys_prompt = f"""You are a direct, honest career coach. A candidate failed their skill verification test (Score < {settings.PASS_THRESHOLD}%). Given their claimed skills and test score, generate an honest reality check and a specific improvement roadmap.
Return ONLY a valid JSON object with the following schema:
{{
  "reality_check": "A 2-3 sentence direct reality check about their current skill gap versus market expectations. Be honest about what is needed.",
  "roadmap": [
    {{
      "skill_name": "string",
      "gaps": ["string", "string"],
      "resources": [
        {{"title": "string", "url": "string", "type": "course|docs|practice"}}
      ],
      "estimated_weeks": 2
    }}
  ]
}}
No explanation. No markdown formatting."""
    
    msg = f"Candidate score: {state.get('score'):.1f}%\nSkills: {json.dumps(state.get('extracted_skills'))}"
    
    try:
        resp = llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=msg)])
        raw = resp.content.replace('```json\n', '').replace('```json', '').replace('```', '').strip()
        parsed = json.loads(raw)
        roadmap = parsed.get("roadmap", [])
        reality_check = parsed.get("reality_check", "You need to improve your foundational skills before reapplying.")
    except Exception as e:
        roadmap = []
        reality_check = "We couldn't generate a personalized response, but your score indicates a need for significant practice."
    
    retake_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=14)
    
    roadmap_data = {
        "candidate_id": candidate_id,
        "test_session_id": state["session_id"],
        "score": round(state.get("score", 0.0), 1),
        "reality_check": reality_check,
        "roadmap": roadmap,
        "retake_available_at": retake_date.isoformat(),
    }
    
    # For demo user: store in session_store
    if candidate_id == settings.DEMO_CANDIDATE_ID:
        from app.services import session_store
        session_store.save_session(f"roadmap:{candidate_id}", roadmap_data)
        return {"error": ""}
    
    client = get_supabase()
    client.table("improvement_roadmaps").insert(roadmap_data).execute()
    client.table("notifications").insert({
        "user_id": candidate_id,
        "type": "passport_failed",
        "payload": {"session_id": state["session_id"]}
    }).execute()
    
    return {"error": state.get("error", "")}

def should_issue_passport(state: PassportIssuerState):
    if state.get("passed"):
        return "issue"
    return "roadmap"

def build_passport_issuer_graph():
    builder = StateGraph(PassportIssuerState)
    builder.add_node("evaluate_answers_node", evaluate_answers_node)
    builder.add_node("issue_passport_node", issue_passport_node)
    builder.add_node("generate_roadmap_node", generate_roadmap_node)
    
    builder.set_entry_point("evaluate_answers_node")
    builder.add_conditional_edges(
        "evaluate_answers_node",
        should_issue_passport,
        {"issue": "issue_passport_node", "roadmap": "generate_roadmap_node"}
    )
    builder.add_edge("issue_passport_node", END)
    builder.add_edge("generate_roadmap_node", END)
    
    return builder.compile()

passport_issuer_graph = build_passport_issuer_graph()
