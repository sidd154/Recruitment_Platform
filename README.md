
# SkillBridge: Agentic AI Recruitment Platform

## Project Overview
SkillBridge solves the modern hiring problem by deploying Autonomous AI Agents at every step of the recruitment flow. From instantaneously parsing resumes to issuing verifiable "Skill Passports", the platform reduces bias and recruiter fatigue. The highlight of the product is a fully integrated **Live Co-Pilot Interview Room** where a human recruiter and an AI collaborate in real-time to interview a candidate, complete with peer-to-peer Audio/Video and a shared terminal.

![SkillBridge Landing Page](docs/screenshots/landing_page.png)


 
## How This Application Helps Overall
Recruitment is currently plagued by overwhelming applicant volume, slow technical screening processes, and interviewer fatigue. 
SkillBridge dynamically resolves this:
- **For Candidates:** You receive instant feedback on your resume, a customized roadmap if you fail to pass the benchmark tests, and a globally verifiable "Skill Passport" if you succeed, ending the cycle of "ghosting".
- **For Recruiters:** You skip manually screening 1,000+ resumes. You only interview pre-verified, passport-holding candidates. During the interview, an AI agent listens in and instantly generates high-quality, contextual follow-up questions tailored to your specific job requirements, drastically improving signal-to-noise ratio in technical interviews.

---

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Supabase account (optional, for persistent data. App runs in in-memory session mode otherwise)

### One-Time Setup

These steps only need to be run once when you first set up the project.

**1. Backend Setup**
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Create a .env file based on the project requirements (e.g., OPENAI_API_KEY)
```

**2. Frontend Setup**
```bash
cd frontend
npm install
```

### Run Every Time

To launch the application, you'll need two separate terminal windows.

**Terminal 1: Start the Backend server**
```bash
cd backend
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2: Start the Frontend server**
```bash
cd frontend
npm run dev
```

The application will be running at `http://localhost:5173`. Frontend API requests are automatically proxied to the backend.

---

## Tech Stack & Architecture (And Why We Used It)

### 1. Frontend
* **React 18 & TypeScript:** State-of-the-art component-based UI. TypeScript guarantees type safety, preventing massive runtime crashes during heavy AI state payloads.
* **Vite:** High-performance build tooling used to drastically reduce Hot Module Reloading times compared to Webpack/CRA.
* **Tailwind CSS:** For professional, sleek, and highly maintainable utility styling and dynamic animations without bloated `.css` files.
* **Lucide React:** Consistent, lightweight, scaleable SVGs.
* **Zustand:** Ultra-lightweight global state management (specifically for authentication), avoiding Redux boilerplate.
* **TanStack Query (React Query):** Data fetching, caching, and state synchronization, ensuring the dashboards auto-refresh effortlessly.

### 2. Backend
* **FastAPI (Python):** High-throughput, highly asynchronous API framework. Chosen explicitly because Python is the native ecosystem for AI tools (LangChain), and FastAPI easily supports WebSockets and async execution loops.
* **LangGraph & LangChain:** Core logic framing for stateful LLM operations, allowing us to build cyclic, graph-based agents that maintain memory and complex branching logic natively.
* **OpenAI (GPT-4o):** State-of-the-art reasoning model powering the entire agentic layer.
* **Supabase / PostgreSQL:** Relational Postgres data. Chosen for its real-time capabilities and effortless cloud scaling. 

### 3. Networking & Real-Time Setup
* **HTTP REST APIs:** Used for basic CRUD, authentication, and state management (e.g. `/api/auth`, `/api/jobs`).
* **WebSockets (`/api/ws/...`):** Ultra-low latency, bidirectional streaming. WebSockets bypass traditional HTTP request overhead, allowing us to push live chat transcripts, synced interactive terminal code, and AI suggestions instantaneously.
* **WebRTC (Peer-to-Peer):** We integrated `getUserMedia` directly into the websocket loop to act as a **Signaling Server** (distributing SDP Offers, Answers, and ICE Candidates). We route connections through Google's explicit STUN servers. This ensures video and audio stream from the recruiter to the candidate completely peer-to-peer, bypassing expensive media server costs and enforcing zero-latency streaming.

---

## Architectural Agent Flow

```mermaid
graph TD
    %% Candidate Flow
    subgraph Candidate Workflow
        A[Candidate Uploads Resume] -->|Resume Parser Node| B(Extracts JSON: Skills & Tools)
        B -->|Test Generator Node| C(Generates 20 Tailored MCQs)
        C --> D{Evaluation >= 70%?}
        D -->|Pass| E[Passport Issuer Node]
        E --> F((Verifiable Skill Passport))
        D -->|Fail| G[Roadmap Generator Node]
        G --> H((Study Roadmap & Next Steps))
    end

### Candidate Experience
![Candidate Dashboard](docs/screenshots/candidate_dashboard.png)
![Skill Passport & Roadmap](docs/screenshots/skill_passport.png)


    %% Recruiter Flow
    subgraph Recruiter Workflow
        I[Recruiter Job Input] -->|Brief Generator Node| J(Expands into Job Focus Areas)
        J --> K((Published Job Board))
        
        %% Job Matching
        F -.->|Continuous Matching| L[Job Matcher Node]
        K -.->|Continuous Matching| L
        L --> M[Matches & Gap Analytics]
    end

### Recruiter Experience
![Recruiter Dashboard](docs/screenshots/recruiter_dashboard.png)
![Job Matching & Analytics](docs/screenshots/job_matching.png)


    %% Interview Co-Pilot
    subgraph Live Co-Pilot Interview
        N[Websocket P2P Room] --> O(Live Chat Transcript Stream)
        O -->|Recruiter Triggers| P[Bot Interviewer Node]
        P -->|Evaluates context against Jobs| Q(Suggests Surgical Follow-up Qs)
        N -->|Transcript Closes| R[Summarizer Node]
        R --> S((Final Behavioral & Technical Scorecard))
    end

### Live Interview Room
![Live Interview Session](docs/screenshots/live_interview.png)

```

SkillBridge operates a pipeline of 7 specialized, autonomous agents orchestrated by LangGraph:

1. **`resume_parser_graph.py` (The Ingestion Node)**
   - **Flow**: Candidate uploads PDF -> PDF uploaded to **Supabase Storage** -> PDF parsed to string -> GPT-4o extracts technical skills, education, and proficiencies -> Standardized JSON.
2. **`test_generator_graph.py` (The Evaluator Node)**
   - **Flow**: Reads extracted JSON skills -> Dynamically generates 20 strict multiple-choice and behavioral questions -> Returns a verification assessment.
3. **`passport_issuer_graph.py` & `summarizer_graph.py` (The Certification Nodes)**
   - **Flow**: Reads candidate's assessment marks -> If passing (>= 70%), issues a verifiable Skill Passport. -> If failing, maps knowledge gaps and issues an Improvement Roadmap with curated learning resources.
4. **`brief_generator_graph.py` (The Recruiter Expansion Node)**
   - **Flow**: Recruiter inputs basic prompt ("Need Python dev") -> Agent expands this into a comprehensive Job Brief with Focus Areas and target competencies.
5. **`job_matching_graph.py` (The Broker Node)**
   - **Flow**: Constantly iterates through active Jobs and active Skill Passports -> Uses GPT-4o to compute deep Match Scores (0-100) -> Generates personalized "Skill Gap" reports for recruiters.
6. **`bot_interview_graph.py` (The Co-Pilot Node)**
   - **Flow**: Active during the live WebSocket P2P interview. Reads the rolling chat transcript -> Evaluates Candidate's last statement -> Cross-references Recruiter's Job Focus Areas -> Returns an optimal follow-up behavioral/technical question perfectly suited to grill the candidate further.

---

## File By File Breakdown

### Root Directory
* `package.json`, `tsconfig.json`, `vite.config.ts`: Configuration files scaffolding the React/Vite frontend.
* `requirements.txt`: Python dependencies required for the FastAPI/LangGraph backend.
* `.env`: Environment variables covering `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_RESUME_BUCKET`, etc.

### Backend (`/backend/app/`)
* **`main.py`**: The application's entry point. Connects FastAPI, mounts CORS middleware, imports all routers, and optionally seeds Demo-Mode mock databases.
* **`supabase_schema.sql`**: The entire relational Postgres architecture. Outlines tables exactly mirroring candidates, recruiters, jobs, test_sessions, roadmaps, passports, and interviews.
* **`/routers/` (The Network Layer)**
  * `auth.py`: JWT Generation and Login logic.
  * `candidates.py`: Handles Profile fetching, Roadmap fetching, and Resume Upload endpoints.
  * `recruiters.py`: Handles Recruiter company profiles and job ownership constraints.
  * `jobs.py`: Fetches job boards and matching analytics.
  * `tests.py`: Evaluation submission layer for MCQs.
  * `interviews.py`: **The core real-time engine.** Outlines the `LiveInterviewManager` which tracks WebSocket connections, manages Waiting Rooms, securely relays P2P WebRTC Signaling logic (`send_to_peer`), and queries the Copilot AI graph asynchronously.
  * `proctoring.py`: (Reserved for future anti-cheat video proctoring WebSocket loops).
* **`/services/` (The Internal Logic Layer)**
  * `supabase.py`: Singleton initializing the Supabase DB client.
  * `auth_middleware.py`: Custom JWT decoder injected as a FastAPI dependency (`Depends()`) to protect private endpoints.
  * `email_service.py`: SMTP logic setup for sending email notifications.
  * `session_store.py`: In-memory Python Dictionary acting as a temporary lightweight "Mock Database". Utilized seamlessly in Demo environments to avoid hitting Postgres rate limits.
* **`/agents/graphs/` (The AI Layer)**
  * Files exactly mirroring the 6 agents detailed in the **Architectural Agent Flow** block above. Each file contains `TypedDict` State definitions, logic node functions, and specific system prompts mapped to `StateGraph` builders via LangGraph.

### Frontend (`/frontend/src/`)
* **`App.tsx`**: React Router DOM configuration isolating Candidate vs Recruiter Dashboards and protecting routes based on Authentication states.
* **`/store/authStore.ts`**: Zustand global configuration storing User JWT objects instantly across the React Tree.
* **`/services/api.ts`**: Axios instance setup automatically attaching `Bearer` tokens to HTTP headers.
* **Candidate Views (`/pages/candidate/`)**
  * `Layout.tsx`: The candidate's navigation sidebar wrapper.
  * `ResumeUpload.tsx`: Drag-and-drop parsing screen calling the Resume parsing graph.
  * `TestTaker.tsx`: Renders the dynamically generated MCQ questions safely.
  * `PassportView.tsx`: Displays either the glowing Green "Skill Passport" success banner, or the Orange "Roadmap" recovery screen.
  * `BotInterview.tsx`: **The P2P Candidate WebRTC Engine.** Captures candidate `getUserMedia` streams, creates an Answer to an SDP Offer, displays the Recruiter's video, and maps the ongoing transcript.
  * `Jobs.tsx`: Shows ranked jobs tailored to the candidate's passport.
* **Recruiter Views (`/pages/recruiter/`)**
  * `Dashboard.tsx`: High-level metrics tracking open headhunts and passport applicants.
  * `JobList.tsx`: Job listing cards incorporating intelligent polling (`@tanstack/react-query`) to highlight "Waiting Candidates" using real-time API fetches.
  * `CreateJob.tsx`: AI Co-authored Job posting wizard.
  * `LiveSession.tsx`: **The Recruiter P2P WebRTC Host.** Creates the active SDP Offer upon the candidate signaling readiness, handles ICE routes, renders the Picture-in-Picture candidate video feed, and houses the "Suggest Question" Copilot UI panel.

---

## Future Scope & Pipeline

SkillBridge is built on an infinitely scalable foundational graph. Our upcoming pipeline includes:
1. **Automated Cheating Proctoring**: Utilizing the `proctoring.py` WebSocket line to stream webcam snapshots to a distinct `Proctor_AI_Graph` running continuous multi-modal eye-tracking and off-screen detection algorithms.
2. **Terminal Code Sync**: Expanding the live Interview Room to include a Monaco Editor (VSCode Web) synced over WebSocket delta operations to allow live coding exercises.
3. **Automated Voice-Mode Interviews**: Merging OpenAI's Realtime Audio API to allow the AI itself (acting as the sole Recruiter) to conduct 30-minute synchronous voice interviews natively.
4. **Calendar Booking Engine**: Allowing Candidates to schedule interviews directly aligned with a Recruiter's Google Calendar via OAuth2, bypassing the instant "Waiting Room" mechanic.
