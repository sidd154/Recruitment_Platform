import json
import uuid
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.supabase import get_supabase
from app.services import session_store

class TestGeneratorState(TypedDict):
    candidate_id: str
    extracted_skills: List[Dict[str, Any]]
    generated_questions: List[Dict[str, Any]]
    session_id: str
    error: str
    retry_count: int

def generate_questions_node(state: TestGeneratorState):
    skills = state.get("extracted_skills", [])
    if not skills:
        return {"error": "No skills provided"}
        
    llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
    sys_prompt = """You are a technical assessment designer. Given a list of skills with claimed proficiency levels, generate exactly 5 MCQ questions. Rules: (1) distribute questions across the skills provided, (2) question difficulty must match proficiency_claimed — beginner gets definitional questions, intermediate gets application questions, advanced gets architecture/tradeoff questions, (3) each question has exactly 4 options labeled A, B, C, D with exactly one correct answer, (4) shuffle option order so the correct answer is not always in the same position, (5) include the skill name and difficulty in each question object. Return ONLY a JSON array. No explanation. No markdown. Schema: [{"question_id": "uuid-string", "skill": "string", "question_text": "string", "options": {"A": "string", "B": "string", "C": "string", "D": "string"}, "correct_answer": "A/B/C/D", "difficulty": "easy/medium/hard"}]"""
    
    messages = [
        SystemMessage(content=sys_prompt),
        HumanMessage(content=json.dumps(skills))
    ]
    
    try:
        resp = llm.invoke(messages)
        json_str = resp.content.replace('```json\n', '').replace('```', '')
        questions = json.loads(json_str)
        return {"generated_questions": questions}
    except Exception as e:
        return {"error": f"Failed to generate questions: {e}"}

def validate_questions_node(state: TestGeneratorState):
    if state.get("error"):
        return state
        
    questions = state.get("generated_questions", [])
    skills = state.get("extracted_skills", [])
    
    # Validation logic
    valid = True
    if len(questions) != 5:
        valid = False
        
    # Check 2 per skill roughly (would implement exact check here)
    if not valid:
        retry = state.get("retry_count", 0)
        if retry < 1:
            return {"retry_count": retry + 1} # Need to route back
        else:
            return {"error": "Failed validation after retry"}
            
    return {"generated_questions": questions}

DEMO_CANDIDATE_ID = "00000000-0000-0000-0000-000000000001"

def save_session_node(state: TestGeneratorState):
    if state.get("error"):
        return state
    
    candidate_id = state.get("candidate_id")
    
    # Always save to Supabase so the GET /tests/{id} endpoint can retrieve the session.
    # For the demo user, we need a real candidate row to satisfy the FK constraint.
    client = get_supabase()
    
    # Ensure the demo candidate exists in the candidates table before inserting a test session
    if candidate_id == DEMO_CANDIDATE_ID:
        # Upsert the demo profile row if needed
        client.table("profiles").upsert({
            "id": DEMO_CANDIDATE_ID,
            "email": "demo.candidate@skillbridge.dev",
            "full_name": "Demo Candidate",
            "role": "candidate",
            "phone": "0000000000"
        }, on_conflict="id").execute()
        # Upsert the demo candidates row if needed
        client.table("candidates").upsert({
            "id": DEMO_CANDIDATE_ID,
            "college": "Demo University",
            "graduation_year": 2024,
            "degree": "B.Tech"
        }, on_conflict="id").execute()
    
    resp = client.table("test_sessions").insert({
        "candidate_id": candidate_id,
        "questions": state["generated_questions"],
        "proctoring_consent": False
    }).execute()
    
    if resp.data:
        return {"session_id": resp.data[0]["id"]}
    return {"error": "Failed to save session"}

def should_retry(state: TestGeneratorState):
    if state.get("error"):
        return "end"
    if "retry_count" in state and state["retry_count"] > 0 and len(state.get("generated_questions", [])) != 5:
        return "retry"
    return "save"

def build_test_generator_graph():
    builder = StateGraph(TestGeneratorState)
    builder.add_node("generate_questions_node", generate_questions_node)
    builder.add_node("validate_questions_node", validate_questions_node)
    builder.add_node("save_session_node", save_session_node)
    
    builder.set_entry_point("generate_questions_node")
    builder.add_edge("generate_questions_node", "validate_questions_node")
    builder.add_conditional_edges(
        "validate_questions_node",
        should_retry,
        {
            "retry": "generate_questions_node",
            "save": "save_session_node",
            "end": END
        }
    )
    builder.add_edge("save_session_node", END)
    
    return builder.compile()

test_generator_graph = build_test_generator_graph()
