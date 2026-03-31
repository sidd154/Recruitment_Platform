import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routers import auth, candidates, recruiters, jobs, tests, interviews, applications, briefs, headhunt, notifications, proctoring

app = FastAPI(title="SkillBridge API", version="1.0.0")

# CORS setup
origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Seed Demo Data if not present
    from app.services import session_store
    import uuid
    
    demo_recruiter_id = "00000000-0000-0000-0000-000000000002"
    recruiter_key = f"user_by_id:{demo_recruiter_id}"
    
    if not session_store.get_session(recruiter_key):
        # Create Demo Recruiter
        demo_recruiter = {
            "id": demo_recruiter_id,
            "role": "recruiter",
            "email": "demo.recruiter@techcorp.com",
            "password": "Demo@1234",
            "full_name": "Demo Recruiter",
            "company_name": "Tech Corp",
            "company_size": "51-200",
            "designation": "Talent Acq Lead",
            "is_verified": True
        }
        session_store.save_session(recruiter_key, demo_recruiter)
        session_store.save_session(f"user:{demo_recruiter['email']}", demo_recruiter)
        
        # Create Sample Jobs
        sample_jobs = [
            {
                "id": str(uuid.uuid4()),
                "recruiter_id": demo_recruiter_id,
                "title": "Senior Frontend Developer",
                "description": "We are looking for a React expert to lead our dashboard team. Experience with TypeScript and Tailwind is a must.",
                "location": "Remote",
                "job_type": "Full-time",
                "required_skills": [
                    {"skill_name": "React", "category": "Frontend"},
                    {"skill_name": "TypeScript", "category": "Frontend"},
                    {"skill_name": "Tailwind CSS", "category": "Frontend"}
                ],
                "min_experience_years": 5,
                "is_active": True
            },
            {
                "id": str(uuid.uuid4()),
                "recruiter_id": demo_recruiter_id,
                "title": "Backend Engineer (Python/FastAPI)",
                "description": "Join our AI infrastructure team. You will be building scalable APIs using FastAPI and LangGraph.",
                "location": "New York, NY",
                "job_type": "Full-time",
                "required_skills": [
                    {"skill_name": "Python", "category": "Backend"},
                    {"skill_name": "FastAPI", "category": "Backend"},
                    {"skill_name": "LangGraph", "category": "Backend"}
                ],
                "min_experience_years": 3,
                "is_active": True
            }
        ]
        session_store.save_session(f"demo_jobs_{demo_recruiter_id}", sample_jobs)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "SkillBridge API is running"}

app.include_router(auth.router, prefix="/api")
app.include_router(candidates.router, prefix="/api")
app.include_router(recruiters.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(briefs.router, prefix="/api")
app.include_router(headhunt.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(proctoring.router)  # WebSockets don't use typical prefix mapping in FastAPI

# Serve Static Files (Frontend)
# Ensure the 'static' directory exists and contains the built frontend
static_dir = os.path.join(os.getcwd(), "static")
if os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve index.html for any route that doesn't match an API or asset
        file_path = os.path.join(static_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    print(f"Warning: Static directory {static_dir} not found. Frontend will not be served.")
