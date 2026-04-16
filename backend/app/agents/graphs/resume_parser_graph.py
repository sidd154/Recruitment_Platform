import json
import pdfplumber
from typing import TypedDict, Annotated, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.supabase import get_supabase, SUPABASE_RESUME_BUCKET
from app.config import settings
import io

# State definition
class ResumeParserState(TypedDict):
    pdf_path: str
    candidate_id: str
    raw_text: str
    extracted_skills: List[Dict[str, Any]]
    tenth_marks: str
    twelfth_marks: str
    github_link: str
    leetcode_link: str
    linkedin_link: str
    error: str

# Node 1: Extract Text
def extract_text_node(state: ResumeParserState):
    pdf_path = state.get("pdf_path")
    try:
        import os
        # Check if it's a local file path first, otherwise try Supabase Storage
        if os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                file_bytes = f.read()
        else:
            client = get_supabase()
            file_bytes = client.storage.from_(SUPABASE_RESUME_BUCKET).download(pdf_path)
        
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() for page in pdf.pages if page.extract_text()]
        raw_text = " ".join(pages).strip()
        
        if len(raw_text) < 100:
            return {"error": "Text extraction failed or text under 100 characters"}
            
        return {"raw_text": raw_text}
    except Exception as e:
        return {"error": f"Failed to extract PDF: {e}"}

# Node 2: Parse Profile with GPT-4o
def parse_skills_node(state: ResumeParserState):
    if state.get("error"):
        return state
        
    raw_text = state.get("raw_text")
    llm = ChatOpenAI(model=settings.AI_MODEL_NAME, temperature=0)
    
    sys_prompt = """You are an advanced resume parser. You must extract data into a strict JSON object with this exact structure:
{
    "extracted_skills": [{"skill_name": "...", "category": "Frontend/Backend/etc", "proficiency_claimed": "beginner/intermediate/advanced", "years_of_experience_claimed": 0}],
    "tenth_marks": "95% (or GPA if applicable, else null)",
    "twelfth_marks": "90% (or GPA if applicable, else null)",
    "github_link": "URL or null",
    "leetcode_link": "URL or null",
    "linkedin_link": "URL or null"
}
Return ONLY valid JSON. No markdown ticks, no explanation."""
    
    messages = [
        SystemMessage(content=sys_prompt),
        HumanMessage(content=raw_text)
    ]
    
    try:
        response = llm.invoke(messages)
        # Clean JSON markdown if any
        json_str = response.content.replace('```json\n', '').replace('```json', '').replace('```', '').strip()
        parsed_data = json.loads(json_str)
        return {
            "extracted_skills": parsed_data.get("extracted_skills") or [],
            "tenth_marks": parsed_data.get("tenth_marks"),
            "twelfth_marks": parsed_data.get("twelfth_marks"),
            "github_link": parsed_data.get("github_link"),
            "leetcode_link": parsed_data.get("leetcode_link"),
            "linkedin_link": parsed_data.get("linkedin_link")
        }
    except Exception as e:
        return {"error": f"Failed to parse LLM response: {e}"}

# Demo ID is now in settings.DEMO_CANDIDATE_ID

# Node 3: Save Skills
def save_skills_node(state: ResumeParserState):
    if state.get("error"):
        return state
    
    candidate_id = state.get("candidate_id")
    
    update_payload = {
        "extracted_skills": state.get("extracted_skills"),
        "tenth_marks": state.get("tenth_marks"),
        "twelfth_marks": state.get("twelfth_marks"),
        "github_link": state.get("github_link"),
        "leetcode_link": state.get("leetcode_link"),
        "linkedin_link": state.get("linkedin_link")
    }

    # For demo user: store in session_store (can't write to Supabase due to auth FK)
    if candidate_id == settings.DEMO_CANDIDATE_ID:
        from app.services import session_store
        session_store.save_session(f"candidate_data:{candidate_id}", update_payload)
        return update_payload

    # Always save to Supabase (demo user rows are upserted earlier in the upload flow)
    client = get_supabase()
    if client and candidate_id:
        client.table("candidates").update(update_payload).eq("id", candidate_id).execute()
        
    return update_payload

# Graph constructor
def build_resume_parser_graph():
    builder = StateGraph(ResumeParserState)
    builder.add_node("extract_text_node", extract_text_node)
    builder.add_node("parse_skills_node", parse_skills_node)
    builder.add_node("save_skills_node", save_skills_node)
    
    builder.set_entry_point("extract_text_node")
    builder.add_edge("extract_text_node", "parse_skills_node")
    builder.add_edge("parse_skills_node", "save_skills_node")
    builder.add_edge("save_skills_node", END)
    
    return builder.compile()

# Instantiate the compiled graph globally
resume_parser_graph = build_resume_parser_graph()
