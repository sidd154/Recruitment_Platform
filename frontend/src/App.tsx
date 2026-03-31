import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';

// Public Pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import RegisterCandidate from './pages/public/RegisterCandidate';
import RegisterRecruiter from './pages/public/RegisterRecruiter';

// Candidate Dashboard Pages
import CandidateLayout from './pages/candidate/Layout';
import CandidateProfile from './pages/candidate/Profile';
import ResumeUpload from './pages/candidate/ResumeUpload';
import PassportView from './pages/candidate/PassportView';
import TestTaker from './pages/candidate/TestTaker';
import BotInterview from './pages/candidate/BotInterview';
import CandidateJobs from './pages/candidate/Jobs';
import JobTest from './pages/candidate/JobTest';
import CandidateApplications from './pages/candidate/Applications';
import Roadmap from './pages/candidate/Roadmap';

// Recruiter Dashboard Pages
import RecruiterLayout from './pages/recruiter/Layout';
import RecruiterProfile from './pages/recruiter/Profile';
import JobList from './pages/recruiter/JobList';
import JobNew from './pages/recruiter/JobNew';
import JobApplicants from './pages/recruiter/JobApplicants';
import InterviewSummary from './pages/recruiter/InterviewSummary';
import TalentSearch from './pages/recruiter/TalentSearch';
import LiveSession from './pages/recruiter/LiveSession';

const queryClient = new QueryClient();

// Temporary placeholders for incomplete routes
const Placeholder = ({ name }: { name: string }) => <div className="p-8"><h1 className="text-2xl font-bold">{name} coming soon!</h1></div>;

const ProtectedRoute = ({ children, allowedRole }: { children: ReactNode, allowedRole: string }) => {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to={`/dashboard/${role}`} replace />;
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/candidate" element={<RegisterCandidate />} />
          <Route path="/register/recruiter" element={<RegisterRecruiter />} />

          {/* Candidate Dashboard */}
          <Route path="/dashboard/candidate" element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="profile" element={<CandidateProfile />} />
            <Route path="resume" element={<ResumeUpload />} />
            <Route path="passport" element={<PassportView />} />
            <Route path="test" element={<TestTaker />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="jobs" element={<CandidateJobs />} />
            <Route path="job-test/:jobId" element={<JobTest />} />
            <Route path="applications" element={<CandidateApplications />} />
            <Route path="interview" element={<BotInterview />} />
            <Route path="notifications" element={<Placeholder name="Notifications" />} />
          </Route>

          {/* Recruiter Dashboard */}
          <Route path="/dashboard/recruiter" element={
            <ProtectedRoute allowedRole="recruiter">
              <RecruiterLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="jobs" replace />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="jobs/new" element={<JobNew />} />
            <Route path="jobs" element={<JobList />} />
            <Route path="jobs/:jobId" element={<JobApplicants />} />
            <Route path="jobs/:jobId/interviews" element={<Placeholder name="Interview Roster" />} />
            <Route path="interviews/live/:sessionId" element={<LiveSession />} />
            <Route path="interviews/summary/:sessionId" element={<InterviewSummary />} />
            <Route path="search" element={<TalentSearch />} />
            <Route path="notifications" element={<Placeholder name="Notifications" />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
