import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Filter, ShieldCheck, Mail, Send, Cpu, LayoutTemplate, Loader2, CheckCircle2, TerminalSquare } from 'lucide-react';
import api from '../../services/api';

export default function TalentSearch() {
    const { data: candidates, isLoading } = useQuery({ 
        queryKey: ['talentSearch'], 
        queryFn: async () => (await api.get('/recruiters/candidates')).data 
    });
    
    const { data: jobs } = useQuery({ 
        queryKey: ['recruiter-jobs'], 
        queryFn: async () => (await api.get('/jobs')).data 
    });

    const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
    const [selectedJob, setSelectedJob] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const headhuntMutation = useMutation({
        mutationFn: async (payload: { candidate_id: string, job_id: string, message: string }) => {
            return (await api.post('/headhunt', payload)).data;
        },
        onSuccess: () => {
            setSuccessMsg('Packet transmitted payload delivered.');
            setTimeout(() => setSuccessMsg(''), 3000);
            setSelectedJob('');
        }
    });

    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 h-[calc(100vh-8rem)] font-body">

            {/* Left pan: Search & List */}
            <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col bg-fintech-surface rounded-xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-fintech-border overflow-hidden">
                <div className="p-8 border-b border-fintech-border bg-[#1C202E]">
                    <div className="flex items-center space-x-3 mb-6 opacity-70">
                        <TerminalSquare className="w-4 h-4 text-fintech-amber" />
                        <h1 className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">
                            Global Node Directory
                        </h1>
                    </div>
                    
                    <h1 className="text-3xl font-editorial font-medium text-fintech-cream mb-6 tracking-wide">Verified Talent Layer</h1>
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-fintech-ash" />
                            <input
                                type="text"
                                placeholder="Query ledger by skill (e.g. React)..."
                                className="w-full bg-fintech-base border border-fintech-border text-fintech-cream font-terminal text-[12px] px-5 py-4 pl-12 focus:outline-none focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all shadow-inner"
                            />
                        </div>
                        <button className="px-5 py-4 bg-fintech-base border border-fintech-border hover:bg-[#1E212E] hover:border-fintech-amber/50 text-fintech-ash rounded transition-all shadow-sm">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#181B26] custom-scrollbar">
                    {isLoading ? (
                        <div className="text-center py-20 text-fintech-amber flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-80" />
                            <span className="font-terminal text-[10px] uppercase tracking-widest text-fintech-ash">Scanning Node Registry...</span>
                        </div>
                    ) : candidates?.map((can: any) => (
                        <button
                            key={can.id}
                            onClick={() => setSelectedCandidate(can)}
                            className={`w-full text-left p-6 rounded border transition-all ${selectedCandidate?.id === can.id
                                ? 'bg-fintech-surface border-[#63A583]/50 shadow-[0_0_15px_rgba(99,165,131,0.1)] ring-1 ring-[#63A583]/30'
                                : 'bg-fintech-base border-fintech-border hover:border-fintech-amber/30 hover:bg-[#1E212E]'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded bg-[#1C202E] border border-fintech-border text-fintech-amber flex items-center justify-center font-editorial font-bold text-xl shadow-inner">
                                        {can.full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-editorial font-medium text-fintech-cream text-lg mb-1">{can.full_name}</h3>
                                        <p className="font-terminal text-[10px] text-fintech-ash uppercase tracking-widest">{can.degree}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center text-[#63A583] bg-[#63A583]/10 border border-[#63A583]/20 px-2.5 py-1.5 rounded mb-2">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-2 opacity-80" />
                                        <span className="font-terminal text-[9px] font-bold uppercase tracking-[0.2em]">Verified</span>
                                    </div>
                                    <span className="font-terminal text-[9px] text-fintech-ash uppercase tracking-widest">Score: {can.proctoring_score}/100</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 border-t border-fintech-border pt-4">
                                {can.skills.map((skill: any, idx: number) => (
                                    <span key={idx} className="bg-[#1C202E] border border-fintech-border text-fintech-cream font-terminal text-[10px] uppercase tracking-widest px-2.5 py-1.5 rounded flex items-center shadow-sm">
                                        {skill.skill_name} <span className="text-[#63A583] ml-2 font-bold opacity-80">• {skill.proficiency_level}</span>
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right pan: Detail & Headhunt */}
            <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col">
                {!selectedCandidate ? (
                    <div className="flex-1 bg-fintech-surface rounded-xl border border-fintech-border border-dashed shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-center p-12 opacity-80">
                        <div>
                            <div className="w-20 h-20 bg-[#1C202E] border border-fintech-border rounded flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Search className="w-8 h-8 text-fintech-ash opacity-50" />
                            </div>
                            <h3 className="text-xl font-editorial text-fintech-cream mb-2">Awaiting Target Selection</h3>
                            <p className="font-terminal text-[10px] text-fintech-ash uppercase tracking-widest leading-relaxed">Select a candidate node to preview telemetry or transmit direct requisition invite.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-fintech-surface rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-fintech-border overflow-hidden flex flex-col animate-fade-in-up relative">
                        {/* Selected Accent */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#63A583]"></div>

                        <div className="p-10 border-b border-fintech-border bg-[#1C202E] text-fintech-cream relative">
                            <div className="absolute top-6 right-6 bg-[#63A583]/10 text-[#63A583] border border-[#63A583]/30 px-3 py-1.5 rounded flex items-center space-x-2 font-terminal text-[9px] uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(99,165,131,0.1)]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Passport ID: {selectedCandidate.id.substring(0, 8).toUpperCase()}</span>
                            </div>

                            <div className="w-20 h-20 rounded bg-fintech-base border border-fintech-border text-[#63A583] flex items-center justify-center font-editorial font-bold text-3xl shadow-inner mb-6 mt-4">
                                {selectedCandidate.full_name.charAt(0)}
                            </div>

                            <h2 className="text-3xl font-editorial font-medium mb-1 tracking-wide">{selectedCandidate.full_name}</h2>
                            <p className="font-terminal text-[11px] text-[#63A583] uppercase tracking-widest">{selectedCandidate.degree}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-fintech-base space-y-8">

                            <div>
                                <h3 className="font-terminal text-[10px] text-fintech-ash uppercase tracking-[0.2em] mb-4">Integrity Verified Proficiencies</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {selectedCandidate.skills.map((skill: any, idx: number) => (
                                        <div key={idx} className="bg-fintech-surface px-5 py-4 rounded border border-fintech-border flex justify-between items-center shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                {skill.skill_name.toLowerCase().includes('react') ? <LayoutTemplate className="text-fintech-amber w-4 h-4 opacity-70" /> : <Cpu className="text-fintech-ash w-4 h-4 opacity-70" />}
                                                <span className="font-editorial text-fintech-cream text-lg">{skill.skill_name}</span>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded font-terminal text-[9px] font-bold uppercase tracking-[0.2em] shadow-inner ${skill.proficiency_level === 'advanced' ? 'bg-fintech-amber/10 text-fintech-amber border border-fintech-amber/20' : 'bg-[#63A583]/10 text-[#63A583] border border-[#63A583]/20'}`}>
                                                {skill.proficiency_level}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Headhunt action area */}
                            <div className="mt-8 pt-8 border-t border-fintech-border">
                                <h3 className="text-lg font-editorial text-fintech-cream mb-4 flex items-center">
                                    <Mail className="w-4 h-4 mr-3 text-[#63A583]" />
                                    Bypass Protocol // Headhunt
                                </h3>
                                <p className="font-terminal text-[10px] text-fintech-ash uppercase tracking-[0.15em] mb-6 leading-relaxed">
                                    Transmit direct ping to identity. Bypasses standard application queue.
                                </p>

                                <select 
                                    value={selectedJob} 
                                    onChange={(e) => setSelectedJob(e.target.value)}
                                    className="w-full mb-6 px-5 py-4 bg-fintech-surface border border-fintech-border text-fintech-cream rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] outline-none font-terminal text-[12px] appearance-none"
                                >
                                    <option value="" className="text-fintech-ash">-- Select Target Requisition Node --</option>
                                    {jobs?.map((j: any) => (
                                        <option key={j.id} value={j.id}>{j.title}</option>
                                    ))}
                                </select>

                                {successMsg ? (
                                    <div className="w-full py-5 bg-[#63A583]/10 text-[#63A583] font-terminal text-[11px] uppercase tracking-widest rounded border border-[#63A583]/30 flex items-center justify-center space-x-3 shadow-[inset_0_0_10px_rgba(99,165,131,0.1)]">
                                        <CheckCircle2 className="w-4 h-4"/>
                                        <span>{successMsg}</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => headhuntMutation.mutate({ 
                                            candidate_id: selectedCandidate.id, 
                                            job_id: selectedJob, 
                                            message: `You have been directly headhunted for an interview by an authorized node.` 
                                        })}
                                        disabled={!selectedJob || headhuntMutation.isPending}
                                        className="w-full py-4 bg-[#63A583] hover:bg-[#78C49F] disabled:bg-fintech-surface disabled:text-fintech-ash disabled:border-fintech-border text-fintech-base font-editorial font-bold text-lg rounded shadow-[0_0_15px_rgba(99,165,131,0.3)] transition-all flex items-center justify-center space-x-3"
                                    >
                                        {headhuntMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
                                        <span>{headhuntMutation.isPending ? 'Transmitting...' : 'Execute Headhunt Payload'}</span>
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
