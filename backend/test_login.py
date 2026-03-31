from app.services.supabase import get_supabase
import os

client = get_supabase()

def test_login(email, password):
    print(f"Testing login for {email}...")
    try:
        response = client.auth.sign_in_with_password({"email": email, "password": password})
        if response.session:
            print(f"SUCCESS: Logged in for {email}")
            print(f"User ID: {response.user.id}")
            return response.user.id
        else:
            print(f"FAILED: No session for {email}")
    except Exception as e:
        print(f"ERROR: {e}")
    return None

if __name__ == "__main__":
    can_id = test_login("demo.candidate@skillbridge.dev", "Demo@1234")
    rec_id = test_login("demo.recruiter@techcorp.com", "Demo@1234")
    
    if not can_id:
        print("\nCandidate missing. Attempting to create...")
        try:
            res = client.auth.sign_up({"email": "demo.candidate@skillbridge.dev", "password": "Demo@1234"})
            print(f"Created candidate: {res.user.id}")
        except Exception as e:
            print(f"Create candidate failed: {e}")
            
    if not rec_id:
        print("\nRecruiter missing. Attempting to create...")
        try:
            res = client.auth.sign_up({"email": "demo.recruiter@techcorp.com", "password": "Demo@1234"})
            print(f"Created recruiter: {res.user.id}")
        except Exception as e:
            print(f"Create recruiter failed: {e}")
