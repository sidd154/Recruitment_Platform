import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, MapPin, Building2, Tags, ArrowRight, X, BrainCircuit, TerminalSquare, PlusSquare } from 'lucide-react';

export default function JobNew() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', location: '', job_type: 'full-time', min_experience_years: 0,
    });

    // Custom skills state for UI
    const [currentSkill, setCurrentSkill] = useState('');
    const [currentCategory, setCurrentCategory] = useState('Frontend');
    const [skills, setSkills] = useState<any[]>([]);

    const handleAddSkill = () => {
        if (currentSkill.trim()) {
            setSkills([...skills, { skill_name: currentSkill.trim(), category: currentCategory }]);
            setCurrentSkill('');
        }
    };

    const handleRemoveSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/jobs/', {
                ...formData,
                min_experience_years: parseInt(formData.min_experience_years.toString(), 10),
                required_skills: skills
            });
            // Scaffold next step (Brief Builder) or redirect to pipeline
            navigate('/dashboard/recruiter/jobs');
        } catch (err) {
            alert("Node Creation Failed. Check console telemetry.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            
            <div className="flex items-center space-x-3 mb-6 opacity-70">
                <TerminalSquare className="w-5 h-5 text-fintech-amber" />
                <h1 className="text-[14px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">
                    Network Config // <span className="text-fintech-amber">Initialize Position</span>
                </h1>
            </div>

            <div className="bg-fintech-surface rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-fintech-border overflow-hidden">

                {/* Header Banner */}
                <div className="h-32 bg-[#1C202E] relative border-b border-fintech-border flex items-end px-10 pb-8 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]">
                    <div className="flex items-end space-x-5 relative z-10 w-full mb-2">
                        <div className="w-16 h-16 bg-fintech-surface rounded-lg p-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-fintech-border shrink-0">
                            <div className="w-full h-full bg-[#63A583]/10 border border-[#63A583]/20 rounded flex items-center justify-center text-[#63A583]">
                                <PlusSquare className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex-1 pb-1">
                            <h1 className="text-3xl font-editorial font-medium tracking-wide text-fintech-cream">Create Talent Node</h1>
                            <p className="text-fintech-ash font-terminal text-[11px] uppercase tracking-widest mt-1">Define strict parameters for agentic matching.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-12">

                    {/* Basic Details */}
                    <div>
                        <div className="flex items-center space-x-3 mb-8">
                            <Briefcase className="w-4 h-4 text-fintech-ash" />
                            <h3 className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Core Identification</h3>
                            <div className="h-px bg-fintech-border flex-1 ml-4 opacity-50"></div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2 relative">
                                <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-[#63A583] z-10">Node Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] transition-all outline-none font-terminal text-[13px] text-fintech-cream placeholder-fintech-ash/30"
                                    placeholder="e.g. Senior Frontend Architect"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 relative">
                                    <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-fintech-amber z-10 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> Location Vector
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none font-terminal text-[13px] text-fintech-cream placeholder-fintech-ash/30"
                                        placeholder="e.g. Remote (UTC -8)"
                                    />
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-fintech-amber z-10 flex items-center">
                                        <Building2 className="w-3 h-3 mr-1" /> Engagement Type
                                    </label>
                                    <select
                                        value={formData.job_type}
                                        onChange={e => setFormData({ ...formData, job_type: e.target.value })}
                                        className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none font-terminal text-[13px] text-fintech-cream appearance-none"
                                    >
                                        <option value="full-time">Full-Time (W2)</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="contract">Contract (1099)</option>
                                        <option value="remote">Remote Global</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 relative w-full md:w-1/2">
                                <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-fintech-amber z-10 flex items-center">
                                    <Tags className="w-3 h-3 mr-1" /> Time Minimum (Epochs)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.min_experience_years}
                                    onChange={e => setFormData({ ...formData, min_experience_years: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none font-terminal text-[13px] text-fintech-cream"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Required Skills Matrix */}
                    <div className="pt-2">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <BrainCircuit className="w-4 h-4 text-fintech-ash" />
                                <h3 className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Skill Verification Matrix</h3>
                                <div className="h-px bg-fintech-border w-24 ml-4 opacity-50"></div>
                            </div>
                            <div className="text-[9px] font-terminal text-fintech-amber/70 uppercase tracking-widest text-right">
                                System will only match passports clearing this matrix.
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-3 mb-6">
                            <input
                                type="text"
                                value={currentSkill}
                                onChange={e => setCurrentSkill(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                className="flex-1 px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] transition-all outline-none font-terminal text-[13px] text-fintech-cream placeholder-fintech-ash/30"
                                placeholder="Inject strict skill query (e.g. ReactJS)"
                            />
                            <select
                                value={currentCategory}
                                onChange={e => setCurrentCategory(e.target.value)}
                                className="px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] transition-all outline-none font-terminal text-[13px] text-fintech-cream appearance-none w-full sm:w-48"
                            >
                                <option value="Frontend">Layer: Frontend</option>
                                <option value="Backend">Layer: Backend</option>
                                <option value="DevOps">Layer: Infrastructure</option>
                                <option value="Data Science">Layer: Data Science</option>
                                <option value="Management">Layer: Operation</option>
                            </select>
                            <button type="button" onClick={handleAddSkill} className="px-8 py-4 bg-[#63A583] text-fintech-base hover:bg-[#78C49F] font-editorial font-bold rounded shadow-[0_0_15px_rgba(99,165,131,0.2)] transition-all">Compile</button>
                        </div>

                        {skills.length > 0 && (
                            <div className="bg-[#1E212E] border border-fintech-border rounded p-6 flex flex-wrap gap-3">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-fintech-base border border-fintech-border text-fintech-cream text-[11px] font-terminal uppercase tracking-widest px-3 py-2 rounded flex items-center space-x-3 shadow-[0_5px_10px_rgba(0,0,0,0.2)]">
                                        <span className="text-[#63A583] opacity-60">[{skill.category.substring(0,3)}]</span>
                                        <span>{skill.skill_name}</span>
                                        <button type="button" onClick={() => handleRemoveSkill(idx)} className="text-fintech-ash hover:text-red-400 transition-colors border-l border-fintech-border pl-3 ml-1">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Job Description Brief */}
                    <div className="pt-2">
                        <div className="space-y-4 relative">
                            <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-[#63A583] z-10">Entity Description Dump</label>
                            <textarea
                                required
                                rows={8}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-5 py-5 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] transition-all outline-none font-body text-sm text-fintech-cream placeholder-fintech-ash/30 resize-none leading-relaxed"
                                placeholder="Paste standard JD block here. System will automatically extract metrics."
                            />
                        </div>
                    </div>

                    {/* Submit Banner */}
                    <div className="bg-[#1E212E]/50 p-8 rounded-xl border border-fintech-border flex flex-col md:flex-row items-center justify-between gap-6 border-dashed">
                        <div className="flex items-center space-x-6">
                            <div className="bg-fintech-surface p-3 border border-fintech-border rounded-lg shadow-inner">
                                <BrainCircuit className="w-8 h-8 text-fintech-amber" />
                            </div>
                            <div className="max-w-md">
                                <h4 className="font-editorial text-lg text-fintech-cream mb-1">Algorithmic Parse Proceeding</h4>
                                <p className="text-[10px] font-terminal text-fintech-ash uppercase tracking-widest leading-relaxed">Agent will construct technical MCQ tests and interview bot personalities directly from this brief.</p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || skills.length === 0}
                            className="w-full md:w-auto px-10 py-4 bg-fintech-amber hover:bg-fintech-amber-hover text-fintech-base font-editorial font-bold text-lg rounded shadow-[0_0_20px_rgba(232,168,48,0.3)] hover:shadow-[0_0_25px_rgba(232,168,48,0.5)] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center space-x-3"
                        >
                            <span>{loading ? 'Compiling...' : 'Execute Node'}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
