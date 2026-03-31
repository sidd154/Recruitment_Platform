import os
import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Cannot run seed. Missing env vars.")
    exit(1)

client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_demo_accounts():
    print("Seeding demo accounts...")
    
    # 1. Candidate Demo
    can_email = "demo.candidate@skillbridge.dev"
    can_pass = "Demo@1234"
    
    try:
        res = client.auth.sign_up({"email": can_email, "password": can_pass})
        can_id = res.user.id
        print("Demo candidate auth created.")
        
        client.table("profiles").insert({
            "id": can_id, "role": "candidate", "full_name": "Demo Candidate", "email": can_email, "phone": "1234567890"
        }).execute()
        
        client.table("candidates").insert({
            "id": can_id, "college": "Skill University", "graduation_year": 2024, "degree": "B.S. CS"
        }).execute()
        
        # Add Passport
        expires = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=365)).isoformat()
        pass_res = client.table("skill_passports").insert({
            "candidate_id": can_id,
            "skills": [
                {"skill_name": "React", "category": "Frontend", "verified": True, "proficiency_level": "advanced"},
                {"skill_name": "Python", "category": "Backend", "verified": True, "proficiency_level": "intermediate"}
            ],
            "proctoring_score": 98.0,
            "expires_at": expires
        }).execute()
        
        client.table("candidates").update({"passport_id": pass_res.data[0]["id"]}).eq("id", can_id).execute()
    except Exception as e:
        print(f"Candidate step err: {e}")

    # 2. Recruiter Demo
    rec_email = "demo.recruiter@techcorp.com"
    rec_pass = "Demo@1234"
    
    try:
        res = client.auth.sign_up({"email": rec_email, "password": rec_pass})
        rec_id = res.user.id
        print("Demo recruiter auth created.")
        
        client.table("profiles").insert({
            "id": rec_id, "role": "recruiter", "full_name": "Demo Recruiter", "email": rec_email, "phone": "0000000000"
        }).execute()
        
        client.table("recruiters").insert({
            "id": rec_id, "company_name": "Tech Corp", "company_domain": "techcorp.com", 
            "company_size": "51-200", "designation": "Talent Acq Lead", "is_verified": True
        }).execute()
        
        # Add Job
        job_res = client.table("jobs").insert({
            "recruiter_id": rec_id, "title": "Senior Frontend Developer", "description": "Looking for a rigorous react dev.",
            "location": "Remote", "job_type": "remote", "required_skills": [{"skill_name": "React", "category": "Frontend"}],
            "min_experience_years": 3
        }).execute()
        
        job_id = job_res.data[0]["id"]
        
        # Add Job Brief
        client.table("job_briefs").insert({
            "job_id": job_id,
            "focus_areas": ["State management", "Performance"],
            "recruiter_mcqs": [{"question": "What is useMemo?", "expected_keywords": ["cache", "re-render", "performance"]}],
            "instructions": "Be rigorous about Next.js and React concepts"
        }).execute()
        
    except Exception as e:
        print(f"Recruiter step err: {e}")

if __name__ == "__main__":
    seed_demo_accounts()
