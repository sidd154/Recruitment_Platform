import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_RESUME_BUCKET = os.getenv("SUPABASE_RESUME_BUCKET", "resumes")

if not SUPABASE_URL or not SUPABASE_KEY:
    # We don't raise error immediately to allow simple `uvicorn` startup testing
    print("WARNING: Supabase credentials not found in environment variables.")

# Singleton pattern for the supabase client
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def get_supabase() -> Client:
    return supabase_client
