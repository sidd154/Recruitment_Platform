import os
import time
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def test_signup():
    email = f"test.user.{int(time.time())}@skillbridge.dev"
    password = "TestPassword123"
    print(f"Testing signup for {email}...")
    try:
        res = client.auth.sign_up({"email": email, "password": password})
        print(f"SUCCESS: Created user {res.user.id}")
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    test_signup()
