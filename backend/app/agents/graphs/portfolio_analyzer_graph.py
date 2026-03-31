import json
import urllib.request
import urllib.error
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.supabase import get_supabase

class PortfolioAnalyzerState(TypedDict):
    candidate_id: str
    github_link: str
    leetcode_link: str
    github_raw_html: str
    leetcode_raw_html: str
    github_score: float
    leetcode_score: float
    total_portfolio_score: float
    error: str

def fetch_portfolio_data_node(state: PortfolioAnalyzerState):
    github_html = ""
    leetcode_html = ""
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    # Very basic static fetch to provide context to LLM (will just get raw page outline without JS, but enough for basic keywords)
    if state.get("github_link"):
        try:
            req = urllib.request.Request(state.get("github_link"), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                github_html = response.read().decode('utf-8')[:5000] # Grab first 5000 chars of HTML
        except Exception:
            pass
            
    if state.get("leetcode_link"):
        try:
            req = urllib.request.Request(state.get("leetcode_link"), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as response:
                leetcode_html = response.read().decode('utf-8')[:5000]
        except Exception:
            pass
            
    return {"github_raw_html": github_html, "leetcode_raw_html": leetcode_html}

def analyze_portfolio_node(state: PortfolioAnalyzerState):
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    
    # If URLs strictly missing, give zero.
    if not state.get("github_link") and not state.get("leetcode_link"):
        return {"github_score": 0.0, "leetcode_score": 0.0, "total_portfolio_score": 0.0}

    sys_prompt = """You are an expert technical recruiter AI. You are provided with the raw truncated HTML or context of a candidate's GitHub and LeetCode profiles. 
Your job is to infer their activity and generate a score out of 100 for each platform.
If the HTML is empty but a valid URL exists, give a baseline score of 50. If the HTML shows high activity/contributions, give a high score.
Return ONLY valid JSON:
{
  "github_score": 85.0,
  "leetcode_score": 90.0,
  "total_portfolio_score": 87.5
}"""
    
    human_content = f"GitHub URL: {state.get('github_link')}\nHTML: {state.get('github_raw_html')}\n\nLeetCode URL: {state.get('leetcode_link')}\nHTML: {state.get('leetcode_raw_html')}"
    
    try:
        response = llm.invoke([SystemMessage(content=sys_prompt), HumanMessage(content=human_content)])
        json_str = response.content.replace('```json\n', '').replace('```', '').strip()
        scores = json.loads(json_str)
        return scores
    except Exception as e:
        return {"error": f"LLM error: {e}", "github_score": 0.0, "leetcode_score": 0.0, "total_portfolio_score": 0.0}

DEMO_CANDIDATE_ID = "00000000-0000-0000-0000-000000000001"

def save_portfolio_scores_node(state: PortfolioAnalyzerState):
    candidate_id = state.get("candidate_id")
    update_payload = {
        "github_score": state.get("github_score", 0),
        "leetcode_score": state.get("leetcode_score", 0),
        "total_portfolio_score": state.get("total_portfolio_score", 0)
    }
    
    from app.services import session_store
    stored_user = session_store.get_session(f"user_by_id:{candidate_id}")
    if stored_user:
        stored_user.update(update_payload)
        session_store.save_session(f"user_by_id:{candidate_id}", stored_user)
        return update_payload

    if candidate_id == DEMO_CANDIDATE_ID:
        return update_payload
        
    client = get_supabase()
    if client and candidate_id:
        client.table("candidates").update(update_payload).eq("id", candidate_id).execute()
        
    return update_payload

def build_portfolio_analyzer_graph():
    builder = StateGraph(PortfolioAnalyzerState)
    builder.add_node("fetch_portfolio_data_node", fetch_portfolio_data_node)
    builder.add_node("analyze_portfolio_node", analyze_portfolio_node)
    builder.add_node("save_portfolio_scores_node", save_portfolio_scores_node)
    
    builder.set_entry_point("fetch_portfolio_data_node")
    builder.add_edge("fetch_portfolio_data_node", "analyze_portfolio_node")
    builder.add_edge("analyze_portfolio_node", "save_portfolio_scores_node")
    builder.add_edge("save_portfolio_scores_node", END)
    
    return builder.compile()

portfolio_analyzer_graph = build_portfolio_analyzer_graph()
