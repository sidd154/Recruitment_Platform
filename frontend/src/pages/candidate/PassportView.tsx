import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
    Award,
    Calendar,
    ShieldCheck,
    Cpu,
    Download,
    Share2,
    ExternalLink,
    ChevronRight,
    Loader2,
    Briefcase,
    Rocket,
    BookOpen,
    Clock,
    XCircle,
    CheckCircle,
    ArrowRight,
    Verified
} from 'lucide-react';

export default function PassportView() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const { data: passport, isLoading: passportLoading } = useQuery({
        queryKey: ['passport'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/candidates/passport');
                return data;
            } catch {
                return null;
            }
        },
        retry: false,
        refetchInterval: (data) => (data ? false : 2500), // Poll every 2.5s until found
    });

    const { data: roadmap, isLoading: roadmapLoading } = useQuery({
        queryKey: ['roadmap'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/candidates/roadmap');
                return data;
            } catch {
                return null;
            }
        },
        retry: false,
        enabled: !passport, // Only fetch roadmap if no passport
        refetchInterval: (data) => (data ? false : 2500), // Poll every 2.5s until found
    });

    const isLoading = passportLoading || roadmapLoading;

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center flex-col space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium">Agent 4 is evaluating your results...</p>
            </div>
        );
    }

    // PASSPORT ISSUED — User passed
    if (passport) {
        return (
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Skill Passport</h1>
                        <p className="text-slate-500 font-medium mt-2">Globally verified credentials powered by agentic proctoring</p>
                    </div>
                    <div className="flex space-x-4">
                        <button className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                            <Download className="w-5 h-5 text-slate-600" />
                        </button>
                        <button className="bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm">
                            <Share2 className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Score Banner */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-4">
                        <CheckCircle className="w-10 h-10" />
                        <div>
                            <p className="font-black text-xl">Verification Passed!</p>
                            <p className="opacity-80 text-sm">You scored {passport.proctoring_score}% — above the 70% threshold</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black">{passport.proctoring_score}%</p>
                        <p className="opacity-80 text-xs uppercase tracking-widest">Final Score</p>
                    </div>
                </div>

                {/* The Passport Card Visual */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col md:flex-row">
                        {/* Left Panel: Bio & ID */}
                        <div className="w-full md:w-80 bg-slate-900 p-10 text-white flex flex-col">
                            <div className="w-32 h-32 bg-indigo-500 rounded-3xl mb-8 flex items-center justify-center text-4xl font-black shadow-inner shadow-black/20">
                                {user?.full_name?.charAt(0)}
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">{user?.full_name}</h3>
                            <p className="text-indigo-400 font-bold text-sm tracking-widest uppercase mt-2">Verified Professional</p>

                            <div className="mt-auto space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Passport ID</p>
                                    <p className="font-mono text-xs opacity-80">{passport.id?.substring(0, 18)}...</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Issued On</p>
                                    <p className="text-sm font-bold flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
                                        {new Date(passport.issued_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel: Skills & Score */}
                        <div className="flex-1 p-10 md:p-12 space-y-10">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <span className="text-sm font-black text-emerald-700 tracking-tight">AGENT PROCTORED</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Proctoring Score</p>
                                    <div className="flex items-center justify-end text-3xl font-black text-slate-900 tracking-tighter">
                                        <Cpu className="w-6 h-6 mr-2 text-indigo-500" />
                                        {passport.proctoring_score}%
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4">Verified Technical Proficiencies</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(passport.skills || []).map((skill: any, idx: number) => (
                                        <div key={idx} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between hover:bg-slate-100/50 transition-colors group/skill">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-white p-2 rounded-xl shadow-sm group-hover/skill:scale-110 transition-transform">
                                                    <Verified className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{skill.skill_name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{skill.category}</p>
                                                </div>
                                            </div>
                                            <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">
                                                {skill.proficiency_level || skill.proficiency_claimed}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <span>Expires: {new Date(passport.expires_at).toLocaleDateString()}</span>
                                <div className="flex items-center space-x-1 cursor-help hover:text-indigo-600 transition-colors">
                                    <span>View Full Transcript</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center text-center shadow-sm">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-4"><Briefcase className="w-6 h-6 text-blue-600" /></div>
                        <h5 className="font-black text-slate-900 mb-2">Auto-Match</h5>
                        <p className="text-sm text-slate-500 font-medium mb-6">Instantly match with recruiters looking for your skill profile.</p>
                        <button onClick={() => navigate('/dashboard/candidate/jobs')} className="mt-auto text-blue-600 text-xs font-black uppercase tracking-widest flex items-center hover:underline">
                            View Jobs <ChevronRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                    <div className="bg-slate-900 p-8 rounded-[2rem] text-white flex flex-col items-center text-center">
                        <div className="bg-indigo-500/20 p-4 rounded-2xl mb-4"><Rocket className="w-6 h-6 text-indigo-400" /></div>
                        <h5 className="font-black mb-2">Level Up</h5>
                        <p className="text-sm text-slate-400 font-medium mb-6">Add more verified skills to increase your visibility.</p>
                        <button onClick={() => navigate('/dashboard/candidate/resume')} className="mt-auto bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                            Take Another Test
                        </button>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center text-center shadow-sm">
                        <div className="bg-emerald-50 p-4 rounded-2xl mb-4"><Cpu className="w-6 h-6 text-emerald-600" /></div>
                        <h5 className="font-black text-slate-900 mb-2">AI Insights</h5>
                        <p className="text-sm text-slate-500 font-medium mb-6">Review deep analytics on your technical assessment behavior.</p>
                        <button className="mt-auto text-emerald-600 text-xs font-black uppercase tracking-widest flex items-center hover:underline">
                            View Analytics <ChevronRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ROADMAP — User failed
    if (roadmap) {
        return (
            <div className="max-w-4xl mx-auto space-y-10 pb-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 text-white">
                    <div className="flex items-center space-x-4 mb-4">
                        <XCircle className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-black">Skill Passport Not Issued</h1>
                            <p className="opacity-80">You scored {roadmap.score}% — below the 70% threshold. Here's your personalized improvement plan.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6 mt-6 border-t border-white/20 pt-6">
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-70">Your Score</p>
                            <p className="text-3xl font-black">{roadmap.score}%</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-70">Pass Threshold</p>
                            <p className="text-3xl font-black">70%</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest opacity-70">Retake Available</p>
                            <p className="text-sm font-bold">{new Date(roadmap.retake_available_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Roadmap Items */}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6">Your Personalized Improvement Roadmap</h2>
                    <div className="space-y-6">
                        {(roadmap.roadmap || []).map((item: any, idx: number) => (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="bg-slate-900 text-white px-8 py-5 flex items-center justify-between">
                                    <h3 className="text-lg font-black">{item.skill_name}</h3>
                                    <div className="flex items-center space-x-2 text-slate-400 text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>{item.estimated_weeks} weeks</span>
                                    </div>
                                </div>
                                <div className="p-8 space-y-6">
                                    {/* Gaps */}
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Knowledge Gaps Identified</h4>
                                        <ul className="space-y-2">
                                            {(item.gaps || []).map((gap: string, gIdx: number) => (
                                                <li key={gIdx} className="flex items-start space-x-3">
                                                    <span className="mt-1 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                                    <span className="text-sm text-slate-700 font-medium">{gap}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Resources */}
                                    <div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Curated Learning Resources</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {(item.resources || []).map((res: any, rIdx: number) => (
                                                <a key={rIdx} href={res.url} target="_blank" rel="noopener noreferrer"
                                                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group flex flex-col justify-between">
                                                    <div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-3 inline-block ${
                                                            res.type === 'course' ? 'bg-blue-100 text-blue-700' :
                                                            res.type === 'docs' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-purple-100 text-purple-700'
                                                        }`}>{res.type}</span>
                                                        <p className="text-sm font-bold text-slate-900 leading-snug">{res.title}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-1 mt-3 text-indigo-600 text-xs font-bold group-hover:underline">
                                                        <BookOpen className="w-3 h-3" />
                                                        <span>Open Resource</span>
                                                        <ArrowRight className="w-3 h-3" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-indigo-600 rounded-3xl p-8 text-white text-center">
                    <h3 className="text-2xl font-black mb-2">Ready to Retake?</h3>
                    <p className="text-indigo-200 mb-6">After completing the roadmap resources, retake the assessment to earn your Skill Passport.</p>
                    <button onClick={() => navigate('/dashboard/candidate/resume')}
                        className="bg-white text-indigo-600 font-black px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-colors">
                        Start New Assessment
                    </button>
                </div>
            </div>
        );
    }

    // NEITHER — Not assessed yet
    return (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-200 shadow-xl shadow-slate-100 max-w-2xl mx-auto mt-20">
            <div className="bg-indigo-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Award className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Passport Issued Yet</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                You haven't completed any skill assessments yet. Upload your resume and pass the agent-proctored test to earn your verified Skill Passport.
            </p>
            <button onClick={() => navigate('/dashboard/candidate/resume')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1">
                Take First Assessment
            </button>
        </div>
    );
}
