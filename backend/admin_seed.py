import os
import time
import requests
from authlib.jose import jwt
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_URL or not JWT_SECRET:
    print("Missing env vars.")
    exit(1)

def generate_service_role_token():
    payload = {
        "iss": "supabase",
        "ref": SUPABASE_URL.split("//")[1].split(".")[0],
        "role": "service_role",
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600
    }
    header = {"alg": "HS256", "typ": "JWT"}
    return jwt.encode(header, payload, JWT_SECRET).decode("utf-8")

def create_user_admin(email, password, role_name):
    token = generate_service_role_token()
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"role": role_name}
    }
    
    # First check if user exists
    check_url = f"{SUPABASE_URL}/auth/v1/admin/users?email=eq.{email}"
    resp = requests.get(check_url, headers=headers)
    if resp.status_code == 200:
        # If user found, return ID
        users = resp.json()
        if users:
             print(f"User {email} already exists.")
             return users[0]['id']

    # Create if not exists
    resp = requests.post(url, headers=headers, json=data)
    if resp.status_code == 201:
        user_id = resp.json()['id']
        print(f"Created user {email} with ID {user_id}")
        return user_id
    else:
        print(f"Failed to create user {email}: {resp.status_code} - {resp.text}")
        # Try to find again if it was a conflict
        if resp.status_code == 422:
             # Search again
             resp = requests.get(url, headers=headers)
             for u in resp.json():
                 if u['email'] == email:
                     return u['id']
        return None

def seed_profiles(user_id, email, full_name, role_name):
    # For this we can use the regular supabase client or the token
    # Let's use requests for consistency with the token
    token = generate_service_role_token()
    url = f"{SUPABASE_URL}/rest/v1/profiles"
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    profile_data = {
        "id": user_id,
        "role": role_name,
        "full_name": full_name,
        "email": email,
        "phone": "1234567890"
    }
    resp = requests.post(url, headers=headers, json=profile_data)
    if resp.status_code in [200, 201]:
        print(f"Profile created for {email}")
    else:
        print(f"Failed to create profile for {email}: {resp.status_code} - {resp.text}")

def seed_candidate(user_id):
    token = generate_service_role_token()
    url = f"{SUPABASE_URL}/rest/v1/candidates"
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    data = {
        "id": user_id,
        "college": "Skill University",
        "graduation_year": 2024,
        "degree": "B.S. CS"
    }
    requests.post(url, headers=headers, json=data)

def seed_recruiter(user_id):
    token = generate_service_role_token()
    url = f"{SUPABASE_URL}/rest/v1/recruiters"
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    data = {
        "id": user_id,
        "company_name": "Tech Corp",
        "company_domain": "techcorp.com",
        "company_size": "51-200",
        "designation": "Talent Acq Lead",
        "is_verified": True
    }
    requests.post(url, headers=headers, json=data)

if __name__ == "__main__":
    can_id = create_user_admin("demo.candidate@skillbridge.dev", "Demo@1234", "candidate")
    if can_id:
        seed_profiles(can_id, "demo.candidate@skillbridge.dev", "Demo Candidate", "candidate")
        seed_candidate(can_id)
        
    rec_id = create_user_admin("demo.recruiter@techcorp.com", "Demo@1234", "recruiter")
    if rec_id:
        seed_profiles(rec_id, "demo.recruiter@techcorp.com", "Demo Recruiter", "recruiter")
        seed_recruiter(rec_id)
