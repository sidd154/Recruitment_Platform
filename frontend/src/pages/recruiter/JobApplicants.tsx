import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Users, Loader2, CheckCircle2, Calendar, FileText, Code2, Video, Trophy, Github, Linkedin, ExternalLink, GraduationCap, ShieldCheck, ShieldOff, TerminalSquare } from 'lucide-react';

export default function JobApplicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: jobInfo, isLoading: isJobLoading } = useQuery({
        queryKey: ['job', jobId],
        queryFn: async () => {
            const res = await api.get('/jobs');
            return res.data.find((j: any) => j.id === jobId);
        }
    });

    const { data: applicants, isLoading } = useQuery({
        queryKey: ['job-applicants', jobId],
        queryFn: async () => {
            const res = await api.get(`/jobs/${jobId}/applicants`);
            return res.data;
        }
    });

    const requestInterviewMutation = useMutation({
        mutationFn: async (appId: string) => {
            const res = await api.put(`/applications/${appId}/request_interview`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: async (appId: string) => {
            const res = await api.put(`/applications/${appId}/status`, { status: 'rejected' });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job-applicants', jobId] });
        }
    });

    if (isLoading || isJobLoading) return <div className="p-8 flex items-center justify-center text-fintech-amber"><Loader2 className="w-6 h-6 animate-spin" /></div>;

    const verifiedCount = applicants?.filter((a: any) => a.candidates?.passport_id).length || 0;

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'applied': return 'bg-[#1E212E] text-fintech-ash border border-fintech-border';
            case 'interview_requested': return 'bg-fintech-amber/10 text-fintech-amber border border-fintech-amber/30';
            case 'interview_accepted': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
            case 'interview_done': return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
            case 'accepted': return 'bg-[#63A583]/10 text-[#63A583] border border-[#63A583]/30 shadow-[0_0_10px_rgba(99,165,131,0.2)]';
            default: return 'bg-red-500/10 text-red-400 border border-red-500/30';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            
            <div className="flex items-center space-x-3 mb-6 opacity-70">
                <TerminalSquare className="w-5 h-5 text-fintech-amber" />
                <h1 className="text-[14px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">
                    Pipeline Node // <span className="text-fintech-amber">{jobInfo?.title?.substring(0, 30).toUpperCase()}</span>
                </h1>
            </div>

            <div className="bg-[#1C202E] p-10 rounded-xl border border-fintech-border shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#63A583]"></div>
                <div>
                    <h1 className="text-3xl font-editorial font-medium tracking-wide text-fintech-cream mb-2">Talent Network Stream</h1>
                    <p className="font-terminal text-[11px] uppercase tracking-widest text-[#63A583] flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#63A583] animate-pulse mr-2 shadow-[0_0_8px_rgba(99,165,131,0.8)]"></span>
                        {applicants?.length || 0} Entities Connected
                    </p>
                </div>
                
                <div className="flex gap-4 shrink-0">
                    <div className="bg-fintech-base border border-fintech-border rounded-lg p-5 flex flex-col items-center justify-center min-w-[140px] shadow-inner">
                        <div className="text-4xl font-editorial font-bold text-[#63A583]">{verifiedCount}</div>
                        <div className="text-[9px] text-[#63A583] font-terminal uppercase tracking-[0.2em] mt-2 opacity-80">Passport Verified</div>
                    </div>
                    <div className="bg-fintech-base border border-fintech-border rounded-lg p-5 flex flex-col items-center justify-center min-w-[140px] opacity-70">
                        <div className="text-3xl font-editorial text-fintech-ash">{(applicants?.length || 0) - verifiedCount}</div>
                        <div className="text-[9px] text-fintech-ash font-terminal uppercase tracking-[0.2em] mt-2">Unverified Data</div>
                    </div>
                </div>
            </div>

            {!applicants || applicants.length === 0 ? (
                <div className="text-center py-32 bg-fintech-surface rounded-xl border border-fintech-border border-dashed opacity-70 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                    <Users className="w-16 h-16 text-fintech-ash mx-auto mb-6 opacity-30" />
                    <h2 className="text-2xl font-editorial tracking-wide text-fintech-cream mb-2">No Inbound Telemetry</h2>
                    <p className="font-terminal text-[11px] uppercase tracking-widest text-fintech-ash">Awaiting node connections for this requisition.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {applicants.map((app: any) => {
                        const hasPassport = !!app.candidates?.passport_id;
                        return (
                            <div key={app.id} className="bg-fintech-surface p-7 rounded-xl border border-fintech-border shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:border-fintech-amber/30 transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="truncate pr-4 flex-1">
                                            <h3 className="text-xl font-editorial font-medium text-fintech-cream truncate" title={app.candidates?.full_name || 'Anonymous'}>
                                                {app.candidates?.full_name || 'Anonymous Entity'}
                                            </h3>
                                            <p className="text-[10px] font-terminal text-fintech-ash mt-1 truncate" title={app.candidates?.email}>
                                                {app.candidates?.email}
                                            </p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded text-[9px] font-terminal uppercase tracking-widest shrink-0 ${getStatusTheme(app.status)}`}>
                                            {(app.status || 'applied').replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    {/* Passport Badge */}
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded mb-6 text-[10px] font-terminal uppercase tracking-widest ${hasPassport ? 'bg-[#63A583]/10 text-[#63A583] border border-[#63A583]/30 shadow-[inset_0_0_10px_rgba(99,165,131,0.1)]' : 'bg-[#1E212E] text-fintech-ash border border-fintech-border shadow-inner'}`}>
                                        {hasPassport ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4 opacity-50" />}
                                        <span className="mt-0.5">{hasPassport ? 'Skill Passport Integrity: Verified' : 'No Validated Passport'}</span>
                                    </div>

                                    <div className="flex flex-col mb-6 space-y-4">
                                        <div className="flex space-x-3 items-center text-[11px] font-terminal uppercase tracking-widest text-fintech-ash border-b border-fintech-border pb-4">
                                            <GraduationCap className="w-4 h-4 opacity-70"/>
                                            <span className="truncate">{app.candidates?.college || 'Unknown Facility'} // {app.candidates?.graduation_year}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-[10px] font-terminal uppercase tracking-[0.2em] bg-fintech-base p-4 rounded border border-fintech-border shadow-inner">
                                            {app.candidates?.tenth_marks && <div className="text-fintech-ash">Protocol X: <span className="text-fintech-cream font-bold">{app.candidates.tenth_marks}%</span></div>}
                                            {app.candidates?.twelfth_marks && <div className="text-fintech-ash">Protocol XII: <span className="text-fintech-cream font-bold">{app.candidates.twelfth_marks}%</span></div>}
                                            {app.candidates?.github_link && <a href={app.candidates.github_link} target="_blank" rel="noreferrer" className="flex items-center text-fintech-amber hover:underline"><Github className="w-3 h-3 mr-2"/>GitLink <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-50"/></a>}
                                            {app.candidates?.leetcode_link && <a href={app.candidates.leetcode_link} target="_blank" rel="noreferrer" className="flex items-center text-fintech-amber hover:underline"><Code2 className="w-3 h-3 mr-2"/>LeetLink <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-50"/></a>}
                                            {app.candidates?.linkedin_link && <a href={app.candidates.linkedin_link} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 hover:underline"><Linkedin className="w-3 h-3 mr-2"/>LiLink <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-50"/></a>}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex justify-between items-center bg-[#1E212E] px-4 py-2.5 rounded border border-fintech-border">
                                            <span className="text-[10px] font-terminal uppercase tracking-[0.2em] text-fintech-ash flex items-center">
                                                <Trophy className="w-3 h-3 mr-2 text-[#63A583]"/>Verify Score
                                            </span>
                                            <span className={`text-[12px] font-terminal font-bold ${hasPassport ? 'text-[#63A583]' : 'text-fintech-ash'}`}>
                                                {hasPassport ? '≥ 70.0% ✓' : 'NULL'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-[#1E212E] px-4 py-2.5 rounded border border-fintech-border">
                                            <span className="text-[10px] font-terminal uppercase tracking-[0.2em] text-fintech-ash flex items-center">
                                                <Code2 className="w-3 h-3 mr-2 text-fintech-amber"/>Repo Value
                                            </span>
                                            <span className="text-[12px] font-terminal text-fintech-cream font-bold">
                                                {app.candidates?.total_portfolio_score != null ? `${Number(app.candidates.total_portfolio_score).toFixed(1)} / 100` : 'NULL'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start bg-[#1E212E] px-4 py-3 rounded border border-fintech-border">
                                            <span className="text-[10px] font-terminal uppercase tracking-[0.2em] text-fintech-ash flex items-center mt-0.5">
                                                <CheckCircle2 className="w-3 h-3 mr-2 text-[#63A583] opacity-70"/>Matrix
                                            </span>
                                            <span className="text-[10px] font-terminal uppercase tracking-widest text-[#63A583] text-right font-medium leading-relaxed max-w-[65%]">
                                                {app.candidates?.extracted_skills?.slice(0, 3).map((s: any) => s.skill_name).join(' • ') || 'NULL'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-fintech-border pt-6 space-y-3">
                                    {app.status === 'applied' && (
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => requestInterviewMutation.mutate(app.id)}
                                                disabled={requestInterviewMutation.isPending}
                                                className="flex-1 bg-fintech-amber text-fintech-base hover:bg-fintech-amber-hover flex items-center justify-center gap-2 py-3 rounded font-editorial font-bold transition shadow-[0_0_15px_rgba(232,168,48,0.2)] disabled:opacity-50"
                                            >
                                                {requestInterviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Calendar className="w-4 h-4"/>}
                                                Trigger Bot Interview
                                            </button>
                                            <button 
                                                onClick={() => rejectMutation.mutate(app.id)}
                                                disabled={rejectMutation.isPending}
                                                className="px-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center py-3 rounded font-terminal text-[10px] uppercase tracking-widest transition disabled:opacity-50"
                                            >
                                                Purge
                                            </button>
                                        </div>
                                    )}
                                    
                                    {app.status === 'interview_requested' && (
                                        <div className="w-full bg-fintech-amber/10 text-fintech-amber flex items-center justify-center gap-3 py-3 rounded border border-fintech-amber/30 text-[10px] font-terminal uppercase tracking-[0.2em] shadow-[inset_0_0_10px_rgba(232,168,48,0.1)]">
                                            <Loader2 className="w-4 h-4 animate-spin"/> Awaiting Entity Ping
                                        </div>
                                    )}

                                    {app.status === 'interview_accepted' && (
                                        <button 
                                            onClick={() => navigate(`/dashboard/recruiter/interviews/live/${app.interview_sessions?.[0]?.id || app.id}`)}
                                            className="w-full bg-[#1E212E] hover:bg-fintech-surface text-fintech-cream border border-fintech-border hover:border-[#63A583] hover:text-[#63A583] flex items-center justify-center gap-3 py-3 rounded font-terminal text-[11px] uppercase tracking-widest transition-all"
                                        >
                                            <Video className="w-4 h-4"/> Connect to Live Socket
                                        </button>
                                    )}
                                    
                                    {['interview_done', 'reviewed', 'accepted', 'rejected'].includes(app.status) && app.interview_sessions?.length > 0 && (
                                        <button 
                                            onClick={() => navigate(`/dashboard/recruiter/interviews/summary/${app.interview_sessions[0].id}`)}
                                            className="w-full bg-[#1E212E] hover:bg-fintech-surface text-fintech-cream border border-fintech-border hover:border-fintech-amber hover:text-fintech-amber flex items-center justify-center gap-3 py-3 rounded font-terminal text-[11px] uppercase tracking-widest transition-all"
                                        >
                                            <FileText className="w-4 h-4"/> Fetch Diagnostic Log
                                        </button>
                                    )}
                                    
                                    <button className="w-full text-center text-fintech-ash hover:text-fintech-cream py-3 text-[9px] font-terminal uppercase tracking-[0.3em] transition-colors mt-2">
                                        Access Full Telemetry
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
