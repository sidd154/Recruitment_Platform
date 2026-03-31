import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Target, AlertTriangle, ExternalLink, Calendar, Compass, ShieldAlert, BookOpen } from 'lucide-react';

const fetchRoadmap = async () => {
    const { data } = await api.get('/candidates/roadmap');
    return data;
};

export default function ImprovementRoadmap() {
    const { data: roadmapData, isLoading, error } = useQuery({ queryKey: ['roadmap'], queryFn: fetchRoadmap });

    if (isLoading) return <div className="p-12 text-center"><div className="w-8 h-8 border-[3px] border-fintech-amber border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

    if (error || !roadmapData) {
        return (
            <div className="max-w-4xl mx-auto py-16 text-center animate-fade-in-up">
                <Compass className="w-12 h-12 text-fintech-ash mx-auto mb-6 opacity-30" />
                <h2 className="text-2xl font-editorial font-medium text-fintech-cream mb-2">ROADMAP UNAVAILABLE</h2>
                <p className="text-fintech-ash font-terminal text-[11px] uppercase tracking-widest">Execute assessment test to generate AI competency nodes.</p>
            </div>
        );
    }

    // Circular Gauge Calculation
    const score = roadmapData.score;
    const circumference = 2 * Math.PI * 45; // radius 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            
            {/* Top Dashboard Matrix */}
            <div className="bg-fintech-surface border border-fintech-border p-10 rounded shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                        <Target className="w-4 h-4 text-red-500" />
                        <span className="font-terminal text-[10px] tracking-[0.2em] uppercase text-red-500">Deficit Detected</span>
                    </div>
                    <h1 className="text-4xl font-editorial font-medium text-fintech-cream mb-4">Competency Reconstruction</h1>
                    <p className="text-fintech-ash font-body max-w-lg text-[15px] leading-relaxed">
                        Validation failed to meet the 70% threshold. Advanced telemetry has compiled a structured learning node sequence to bridge your capability gaps.
                    </p>
                </div>

                {/* SVG Arc Gauge */}
                <div className="shrink-0 relative flex items-center justify-center bg-fintech-base p-6 rounded-full border border-fintech-border shadow-inner">
                    <svg className="w-32 h-32 transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#202430]" />
                        {/* Progress Circle */}
                        <circle 
                            cx="64" cy="64" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" 
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="text-fintech-amber transition-all duration-1000 ease-out" 
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-editorial font-bold text-fintech-cream">{score}%</span>
                        <span className="text-[9px] font-terminal text-fintech-ash uppercase tracking-widest">Assessment</span>
                    </div>
                </div>
            </div>

            {/* Editorial Reality Check */}
            <div className="bg-fintech-base border border-fintech-border border-l-4 border-l-fintech-amber p-8 rounded shadow-sm">
                <div className="flex items-start space-x-5">
                    <ShieldAlert className="w-6 h-6 text-fintech-amber shrink-0 mt-1 opacity-80" />
                    <div>
                        <h3 className="font-terminal text-[11px] text-fintech-amber uppercase tracking-widest mb-3">Diagnostic Conclusion</h3>
                        <p className="text-fintech-cream font-editorial text-xl italic leading-relaxed opacity-90">
                            "{roadmapData.reality_check}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Modules */}
            <div className="space-y-6">
                <div className="flex items-center space-x-3 text-fintech-cream border-b border-fintech-border pb-3">
                    <BookOpen className="w-5 h-5 text-fintech-ash" />
                    <h2 className="text-2xl font-editorial tracking-wide">Targeted Learning Nodes</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roadmapData.roadmap.map((item: any, idx: number) => (
                        <div key={idx} className="bg-fintech-surface rounded p-8 border border-fintech-border shadow-sm hover:border-fintech-sage/50 transition-colors flex flex-col">
                            <div className="flex justify-between items-start mb-6 border-b border-fintech-border/50 pb-4">
                                <div>
                                    <h3 className="text-xl font-editorial font-medium text-fintech-cream mb-1">{item.skill_name}</h3>
                                    <div className="text-[10px] font-terminal text-fintech-ash uppercase tracking-widest">Core Module {idx + 1}</div>
                                </div>
                                <div className="bg-fintech-base border border-fintech-border text-fintech-sage px-2 py-1 flex items-center font-terminal text-[10px] uppercase tracking-widest rounded">
                                    <Calendar className="w-3 h-3 mr-1.5 opacity-70" />
                                    {item.estimated_weeks} Wks
                                </div>
                            </div>

                            <div className="mb-6 flex-1">
                                <h4 className="text-[10px] font-terminal text-fintech-amber uppercase tracking-widest mb-3">Identified Anomalies</h4>
                                <ul className="space-y-3">
                                    {item.gaps.map((gap: string, gIdx: number) => (
                                        <li key={gIdx} className="flex items-start">
                                            <AlertTriangle className="w-3.5 h-3.5 text-fintech-ash mr-2.5 shrink-0 mt-0.5" />
                                            <span className="text-fintech-cream text-[13px] leading-snug">{gap}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-5 border-t border-fintech-border/50">
                                <h4 className="text-[10px] font-terminal text-fintech-ash uppercase tracking-widest mb-3">Decrypt Sources</h4>
                                <div className="space-y-2">
                                    {item.resources.map((res: any, rIdx: number) => (
                                        <a key={rIdx} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-2.5 rounded bg-[#1A1D27] hover:bg-[#202430] border border-fintech-border hover:border-fintech-sage/30 transition group/link">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[13px] text-fintech-cream group-hover/link:text-fintech-sage transition truncate max-w-[220px]">{res.title}</span>
                                                <span className="text-[9px] font-terminal text-fintech-ash uppercase tracking-widest mt-0.5">{res.type}</span>
                                            </div>
                                            <ExternalLink className="w-3.5 h-3.5 text-fintech-ash group-hover/link:text-fintech-sage transition" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-[#1A1D27] p-10 rounded border border-fintech-border text-center">
                <h3 className="text-lg font-terminal text-fintech-ash uppercase mb-6 tracking-[0.2em]">Retake Eligibility Window</h3>
                <div className="inline-flex flex-col items-center">
                    <span className="text-3xl font-editorial font-medium text-fintech-cream mb-2">{new Date(roadmapData.retake_available_at).toLocaleDateString()}</span>
                    <span className="text-[10px] font-terminal text-red-400 uppercase tracking-widest px-4 py-1.5 border border-red-500/20 bg-red-500/5 rounded">Validation Locked</span>
                </div>
            </div>
        </div>
    );
}
