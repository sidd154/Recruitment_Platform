import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Briefcase, MapPin, Clock, Search, ExternalLink, Calendar, Users, Target, CheckCircle2, AlertCircle, PlayCircle, Loader2, BrainCircuit, Plus, MoreVertical, ChevronRight, Hexagon, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JobList() {
    const navigate = useNavigate();
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['recruiter-jobs'],
        queryFn: async () => {
            const res = await api.get('/jobs');
            return res.data;
        }
    });

    if (isLoading) {return <div className="p-8 flex items-center justify-center text-fintech-amber"><Loader2 className="w-6 h-6 animate-spin" /></div>;}

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            
            {/* Header */}
            <div className="flex justify-between items-center bg-fintech-surface p-8 rounded-xl border border-fintech-border shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                <div>
                    <h1 className="text-3xl font-editorial text-fintech-cream font-medium tracking-wide">Live Pipeline</h1>
                    <p className="text-fintech-ash font-terminal text-[11px] uppercase tracking-widest mt-1">Manage network requisitions and active nodes.</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/recruiter/jobs/new')}
                    className="flex items-center space-x-3 px-6 py-4 bg-fintech-amber hover:bg-fintech-amber-hover text-fintech-base font-editorial font-bold rounded shadow-[0_0_15px_rgba(232,168,48,0.2)] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Initialize Position</span>
                </button>
            </div>

            {jobs?.length === 0 ? (
                <div className="text-center py-24 bg-fintech-surface rounded-xl border border-fintech-border border-dashed shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                    <Terminal className="w-16 h-16 text-fintech-ash mx-auto mb-6 opacity-30" />
                    <h3 className="text-xl font-editorial text-fintech-cream">No Active Ledgers</h3>
                    <p className="text-fintech-ash font-terminal text-[11px] uppercase tracking-widest mt-2">Initialize your first context-aware node.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs?.map((job: any) => (
                        <div key={job.id} className="bg-fintech-surface rounded-xl border border-fintech-border overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] hover:border-fintech-amber/50 transition-all group flex flex-col relative">
                            {/* Accent Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fintech-ash to-transparent group-hover:via-fintech-amber transition-all"></div>
                            
                            <div className="p-8 border-b border-fintech-border flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-[#1E212E] text-fintech-amber border border-fintech-amber/20 text-[9px] font-terminal uppercase tracking-[0.2em] px-3 py-1.5 rounded">
                                        {job.job_type}
                                    </div>
                                    <button className="text-fintech-ash hover:text-fintech-cream transition-colors">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                <h3 className="text-xl font-editorial font-medium text-fintech-cream mb-4 group-hover:text-fintech-amber transition-colors line-clamp-2">{job.title}</h3>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center text-[11px] font-terminal uppercase tracking-widest text-fintech-ash">
                                        <MapPin className="w-3.5 h-3.5 mr-2 opacity-70" />
                                        {job.location}
                                    </div>
                                    <div className="flex items-center text-[11px] font-terminal uppercase tracking-widest text-[#63A583]">
                                        <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                                        T-{job.min_experience_years} Years Min
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {job.required_skills?.slice(0, 3).map((skill: any, idx: number) => (
                                        <span key={idx} className="bg-fintech-base border border-fintech-border text-fintech-cream text-[10px] font-terminal uppercase tracking-widest px-2.5 py-1 rounded">
                                            {skill.skill_name}
                                        </span>
                                    ))}
                                    {job.required_skills?.length > 3 && (
                                        <span className="bg-fintech-base border border-fintech-border border-dashed text-fintech-ash text-[10px] font-terminal uppercase px-2.5 py-1 rounded">
                                            +{job.required_skills.length - 3}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-fintech-base p-5">
                                <button onClick={() => navigate(`/dashboard/recruiter/jobs/${job.id}`)} className="w-full flex items-center justify-between p-4 rounded bg-[#1E212E] border border-fintech-border hover:border-fintech-amber/50 hover:bg-fintech-surface transition-all group/btn">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-fintech-surface text-fintech-amber border border-fintech-amber/20 rounded-lg flex items-center justify-center font-black group-hover/btn:shadow-[0_0_10px_rgba(232,168,48,0.2)] transition-shadow">
                                            <Hexagon className="w-5 h-5"/>
                                        </div>
                                        <div className="text-left py-0.5">
                                            <div className="text-[12px] font-terminal uppercase tracking-widest text-fintech-cream group-hover/btn:text-fintech-amber transition-colors mb-1">Access Node</div>
                                            <div className="text-[9px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Review Pipeline</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-fintech-ash group-hover/btn:text-fintech-amber transition-colors" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
