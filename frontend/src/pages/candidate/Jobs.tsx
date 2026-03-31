import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Building2, MapPin, Search, Filter, Activity, CheckCircle2, ArrowRight, Loader2, Network } from 'lucide-react';

const fetchAllJobs = async () => {
    const { data } = await api.get('/jobs/');
    return data;
};

export default function CandidateJobs() {
    const queryClient = useQueryClient();
    const { data: jobs, isLoading: isJobsLoading } = useQuery({ queryKey: ['allJobs'], queryFn: fetchAllJobs });
    const { data: passport } = useQuery({ queryKey: ['passport'], queryFn: async () => {
        try { return (await api.get('/candidates/passport')).data } catch { return null; }
    }});
    const { data: myApps } = useQuery({ queryKey: ['myApps'], queryFn: async () => (await api.get('/applications')).data });
    const { data: matches, isLoading: isMatchesLoading } = useQuery({
        queryKey: ['matches'],
        queryFn: async () => {
            try { return (await api.get('/candidates/matches')).data } catch { return []; }
        }
    });
    
    const isLoading = isJobsLoading || isMatchesLoading;

    const applyMutation = useMutation({
        mutationFn: async (jobId: string) => {
            await api.post('/applications', { job_id: jobId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myApps'] });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.detail || 'Application failed. Please try again.';
            alert(msg);
        }
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header & Search */}
            <div className="bg-fintech-surface border border-fintech-border p-10 rounded shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-fintech-amber/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                
                <div className="max-w-xl relative z-10">
                    <div className="flex items-center space-x-2 mb-2 opacity-80">
                        <Activity className="w-4 h-4 text-fintech-amber" />
                        <span className="font-terminal text-[10px] tracking-[0.2em] uppercase text-fintech-amber">Live Recruitment Feed</span>
                    </div>
                    <h1 className="text-4xl font-editorial font-medium mb-3 text-fintech-cream">Find Your Next Role</h1>
                    <p className="text-fintech-ash font-body">Your Skill Passport automatically nodes against verified enterprise requisitions.</p>
                </div>

                <div className="flex-1 w-full max-w-md relative z-10">
                    <div className="relative flex items-center">
                        <Search className="w-5 h-5 absolute left-4 text-fintech-ash" />
                        <input
                            type="text"
                            placeholder="Filter by designation or entity..."
                            className="w-full bg-fintech-base border border-fintech-border text-fintech-cream placeholder-fintech-ash/60 focus:outline-none focus:border-fintech-amber/50 font-terminal text-sm py-3 pl-12 pr-4 rounded transition shadow-inner"
                        />
                        <button className="absolute right-2 p-2 bg-[#202430] hover:bg-fintech-amber/20 text-fintech-ash hover:text-fintech-amber rounded transition border border-fintech-border">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-24 bg-fintech-surface border border-fintech-border rounded" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-fintech-border/50 text-fintech-ash">
                        <div className="flex items-center space-x-2">
                            <Network className="w-4 h-4" />
                            <h2 className="font-terminal text-[11px] uppercase tracking-widest">Target Requisitions</h2>
                        </div>
                        <span className="font-terminal text-[11px]">{jobs?.length} NODES FOUND</span>
                    </div>

                    {jobs?.length === 0 ? (
                        <div className="bg-fintech-surface p-12 border border-fintech-border text-center text-fintech-ash font-terminal text-sm tracking-wide">
                            NO ACTIVE REQUISITIONS FOUND.
                        </div>
                    ) : (
                        jobs?.map((job: any) => {
                            const hasPassport = !!passport;
                            const matchData = matches?.find((m: any) => m.job_id === job.id);
                            const matchPercentage = matchData?.match_percentage || 0;
                            const hasApplied = myApps?.some((app: any) => app.job_id === job.id);
                            
                            return (
                                <div key={job.id} className="bg-fintech-surface p-6 border border-fintech-border hover:bg-[#202430] hover:border-fintech-amber/30 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center rounded shadow-sm group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-editorial font-medium text-fintech-cream group-hover:text-fintech-amber transition-colors">{job.title}</h3>
                                            <span className="font-terminal text-[10px] bg-fintech-base border border-fintech-border px-2 py-0.5 text-fintech-ash">#REQ-{job.id.substring(0,6)}</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-terminal text-fintech-ash mb-4 uppercase tracking-wide">
                                            <span className="flex items-center text-fintech-cream"><Building2 className="w-3.5 h-3.5 mr-1.5 opacity-60" /> Tech Corp Ltd.</span>
                                            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 opacity-60" /> {job.location}</span>
                                            <span className="bg-[#181B24] px-2 py-0.5 border border-fintech-border">{job.job_type}</span>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {job.required_skills?.map((s: any, i: number) => (
                                                <span key={i} className={`font-terminal text-[10px] uppercase border px-2 py-0.5 flex items-center ${hasPassport ? 'bg-fintech-sage/10 text-fintech-sage border-fintech-sage/30' : 'bg-fintech-base text-fintech-ash border-fintech-border'}`}>
                                                    {hasPassport && <CheckCircle2 className="w-3 h-3 mr-1 opacity-70" />}
                                                    {s.skill_name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-auto flex flex-col items-end gap-4 border-t md:border-t-0 border-fintech-border pt-4 md:pt-0">
                                        {/* Precision Match UI */}
                                        {matchData ? (
                                            <div className="flex items-center gap-4 bg-fintech-base border border-fintech-border p-3 rounded w-full md:w-48">
                                                <div className="flex-1 text-right">
                                                    <div className="font-terminal text-[10px] text-fintech-ash uppercase tracking-widest mb-1">Alignment</div>
                                                    <div className="text-2xl font-editorial font-bold text-fintech-sage">{matchPercentage}%</div>
                                                </div>
                                                {/* Simple Vertical Bar representing match */}
                                                <div className="h-10 w-2 bg-[#1A1D27] rounded-full overflow-hidden border border-fintech-border/50">
                                                    <div className="w-full bg-fintech-sage transition-all duration-1000" style={{ height: `${matchPercentage}%`, marginTop: `${100 - matchPercentage}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="font-terminal text-[10px] text-fintech-amber bg-fintech-amber/10 border border-fintech-amber/20 px-3 py-1.5 uppercase tracking-widest text-center w-full md:w-48 rounded">
                                                Parse Resume required
                                            </div>
                                        )}

                                        {hasApplied ? (
                                            <div className="w-full md:w-48 py-2.5 bg-fintech-base border border-fintech-amber/20 text-fintech-amber font-terminal text-[11px] uppercase tracking-wide flex items-center justify-center space-x-2 rounded">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Under Review</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => applyMutation.mutate(job.id)}
                                                disabled={applyMutation.isPending}
                                                className="w-full md:w-48 py-2.5 bg-fintech-amber hover:bg-fintech-amber-hover text-fintech-base font-terminal font-bold text-[12px] uppercase tracking-wide transition flex items-center justify-center space-x-2 disabled:opacity-50 rounded"
                                            >
                                                {applyMutation.isPending && applyMutation.variables === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Submit Profile</span>}
                                                {!applyMutation.isPending && <ArrowRight className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
