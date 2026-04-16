import os
import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.supabase import get_supabase
from app.config import settings

class BotInterviewState(TypedDict):
    application_id: str
    interview_session_id: str
    job_description: str
    passport_skills: List[Dict[str, Any]]
    recruiter_mcqs: List[Dict[str, Any]]
    focus_areas: List[str]
    transcript: List[Dict[str, Any]]
    last_user_message: str
    next_bot_message: str
    current_phase: str
    question_count: int
    follow_up_depth: int
    error: str

# Node 1: Analyze & Route
def interview_brain_node(state: BotInterviewState):
    llm = ChatOpenAI(model=settings.AI_MODEL_NAME, temperature=0.7)
    
    transcript_str = "\n".join([f"{m['role']}: {m['content']}" for m in state.get("transcript", [])])
    
    sys_prompt = f"""You are an advanced AI technical interviewer for SkillBridge.
Job Description: {state.get('job_description')}
Target Skills: {json.dumps(state.get('passport_skills'))}
Focus Areas: {json.dumps(state.get('focus_areas'))}
Recruiter MCQs: {json.dumps(state.get('recruiter_mcqs'))}

Current Question Count: {state.get('question_count')}
Current Phase: {state.get('current_phase', 'intro')}

Goals:
1. If phase is 'intro', welcome the candidate and ask about their background.
2. If phase is 'technical', drill into their specific skills using the job description as a guide. Ask exactly one question.
3. If question_count >= 5, move to 'outro' and wrap up.
4. Keep responses concise (max 3 sentences) as they will be turned into speech.
5. If the candidate gave a short or vague answer, ask a targeted follow-up.

Return a JSON object: {{"next_message": "string", "next_phase": "technical/outro/ended", "increment_count": boolean}}
"""

    messages = [
        SystemMessage(content=sys_prompt),
        HumanMessage(content=f"Last candidate message: {state.get('last_user_message', 'N/A')}\n\nFull Transcript:\n{transcript_str}")
    ]
    
    try:
        resp = llm.invoke(messages)
        json_str = resp.content.replace('```json\n', '').replace('```', '')
        result = json.loads(json_str)
        
        return {
            "next_bot_message": result["next_message"],
            "current_phase": result["next_phase"],
            "question_count": state.get("question_count", 0) + (1 if result.get("increment_count") else 0)
        }
    except Exception as e:
        return {"error": f"LLM error: {e}", "next_bot_message": "I'm having a technical glitch. Could you please repeat that?"}

# Node 2: Save to DB
def save_interview_state_node(state: BotInterviewState):
    client = get_supabase()
    session_id = state.get("interview_session_id")
    transcript = state.get("transcript", [])
    
    try:
        if client and session_id:
            client.table("interview_sessions").update({
                "transcript": transcript,
                "status": "completed" if state.get("current_phase") == "ended" else "in_progress"
            }).eq("id", session_id).execute()
    except Exception as e:
        pass
        
    return {"current_phase": state.get("current_phase", "intro")}

def build_bot_interview_graph():
    builder = StateGraph(BotInterviewState)
    builder.add_node("interview_brain", interview_brain_node)
    builder.add_node("save_state", save_interview_state_node)
    
    builder.set_entry_point("interview_brain")
    builder.add_edge("interview_brain", "save_state")
    builder.add_edge("save_state", END)
    
    return builder.compile()

bot_interview_graph = build_bot_interview_graph()
