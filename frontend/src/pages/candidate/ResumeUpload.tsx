import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { UploadCloud, FileTerminal, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ResumeUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [socials, setSocials] = useState({
        github: '',
        leetcode: '',
        linkedin: '',
        tenth_marks: '',
        twelfth_marks: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState<any>(null);
    const navigate = useNavigate();

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const dropped = e.dataTransfer.files[0];
            if (dropped.type === 'application/pdf') {
                setFile(dropped);
                setError('');
                setSuccessData(null);
            } else {
                setError('INVALID_FORMAT_ERR: Payload must be application/pdf');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = e.target.files[0];
            if (selected.type === 'application/pdf') {
                setFile(selected);
                setError('');
                setSuccessData(null);
            } else {
                setError('INVALID_FORMAT_ERR: Payload must be application/pdf');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('github', socials.github);
        formData.append('leetcode', socials.leetcode);
        formData.append('linkedin', socials.linkedin);
        formData.append('tenth_marks', socials.tenth_marks);
        formData.append('twelfth_marks', socials.twelfth_marks);

        try {
            const { data } = await api.post('/candidates/upload-resume', formData);
            setSuccessData(data);
        } catch (err: any) {
            console.error("AXIOS UPLOAD ERROR:", err);
            console.error("err.response:", err.response);
            setError(err.response?.data?.detail || err.message || 'CONNECTION_ERR: End server parsing endpoint unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex flex-col items-center justify-center text-center p-6 border-b border-fintech-border">
                <FileTerminal className="w-8 h-8 text-fintech-amber mb-3" />
                <h1 className="text-3xl font-editorial font-medium text-fintech-cream">Resume Parsing Terminal</h1>
                <p className="mt-2 text-fintech-ash font-terminal text-[11px] uppercase tracking-widest">Submit document for deep-layer skill extraction.</p>
            </div>

            {!successData ? (
                <div
                    className="bg-fintech-base border-2 border-dashed border-fintech-ash/40 hover:border-fintech-amber rounded transition-colors cursor-pointer p-16 text-center shadow-lg relative"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="application/pdf"
                        onChange={handleFileChange}
                    />

                    <div className="w-16 h-16 bg-[#1A1D27] border border-fintech-border rounded flex items-center justify-center mx-auto mb-6 shrink-0">
                        <UploadCloud className="h-6 w-6 text-fintech-amber" />
                    </div>

                    <h3 className="text-xl font-editorial font-medium text-fintech-cream mb-2">Drag & Drop Document Payload</h3>
                    <p className="text-xs font-terminal text-fintech-ash mb-8 uppercase tracking-widest">[ PDF ONLY . MAX 5MB ]</p>

                    <button className="px-5 py-2.5 bg-[#1A1D27] hover:bg-fintech-amber/10 border border-fintech-border text-fintech-cream font-terminal text-[11px] uppercase tracking-widest rounded transition" onClick={(e) => e.stopPropagation()}>
                        Browse Origin Node
                    </button>

                    {file && (
                        <div className="mt-12 mx-auto w-full max-w-2xl text-left" onClick={e => e.stopPropagation()}>
                            <div className="p-3 bg-fintech-surface border-l-[3px] border-l-fintech-sage border-y border-r border-fintech-border flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-3 text-fintech-cream">
                                    <FileTerminal className="h-5 w-5 text-fintech-sage" />
                                    <span className="text-xs font-terminal uppercase tracking-widest truncate max-w-[200px]">SRC: {file.name}</span>
                                </div>
                                <span className="text-[10px] font-terminal text-fintech-sage uppercase">Loaded</span>
                            </div>

                            <div className="bg-fintech-surface p-8 border border-fintech-border rounded mb-8 relative z-10">
                                <h4 className="font-terminal text-[11px] text-fintech-ash uppercase tracking-widest border-b border-fintech-border pb-3 mb-6">Append Academic & Social Telemetry</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    {/* Strict Fintech Form Inputs */}
                                    <div className="flex flex-col">
                                        <label className="text-[9px] font-terminal text-fintech-ash uppercase tracking-[0.1em] mb-1.5 ml-1">GitHub Endpoint</label>
                                        <input value={socials.github} onChange={e => setSocials({...socials, github: e.target.value})} placeholder="https://github.com/..." className="w-full px-3 py-2 bg-fintech-base border border-fintech-border text-fintech-cream placeholder-fintech-ash/40 focus:border-fintech-amber rounded-sm outline-none font-terminal text-xs"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[9px] font-terminal text-fintech-ash uppercase tracking-[0.1em] mb-1.5 ml-1">LeetCode Endpoint</label>
                                        <input value={socials.leetcode} onChange={e => setSocials({...socials, leetcode: e.target.value})} placeholder="https://leetcode.com/u/..." className="w-full px-3 py-2 bg-fintech-base border border-fintech-border text-fintech-cream placeholder-fintech-ash/40 focus:border-fintech-amber rounded-sm outline-none font-terminal text-xs"/>
                                    </div>
                                    <div className="flex flex-col md:col-span-2">
                                        <label className="text-[9px] font-terminal text-fintech-ash uppercase tracking-[0.1em] mb-1.5 ml-1">LinkedIn Endpoint</label>
                                        <input value={socials.linkedin} onChange={e => setSocials({...socials, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="w-full px-3 py-2 bg-fintech-base border border-fintech-border text-fintech-cream placeholder-fintech-ash/40 focus:border-fintech-amber rounded-sm outline-none font-terminal text-xs"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[9px] font-terminal text-fintech-ash uppercase tracking-[0.1em] mb-1.5 ml-1">10th Tier Metric (%)</label>
                                        <input value={socials.tenth_marks} onChange={e => setSocials({...socials, tenth_marks: e.target.value})} placeholder="95" className="w-full px-3 py-2 bg-fintech-base border border-fintech-border text-fintech-cream placeholder-fintech-ash/40 focus:border-fintech-amber rounded-sm outline-none font-terminal text-xs"/>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[9px] font-terminal text-fintech-ash uppercase tracking-[0.1em] mb-1.5 ml-1">12th Tier Metric (%)</label>
                                        <input value={socials.twelfth_marks} onChange={e => setSocials({...socials, twelfth_marks: e.target.value})} placeholder="92" className="w-full px-3 py-2 bg-fintech-base border border-fintech-border text-fintech-cream placeholder-fintech-ash/40 focus:border-fintech-amber rounded-sm outline-none font-terminal text-xs"/>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full py-4 bg-fintech-amber hover:bg-fintech-amber-hover text-fintech-base font-terminal font-bold text-[12px] uppercase tracking-widest rounded transition disabled:opacity-50 flex items-center justify-center space-x-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                <span>{loading ? 'EXECUTING PARSE ALGORITHM...' : 'EXECUTE PRE-ASSESSMENT PARSE'}</span>
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2 text-red-400 bg-fintech-base border border-red-500/30 px-4 py-2 mt-4 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-terminal text-[10px] uppercase tracking-wide">{error}</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-fintech-surface rounded border border-fintech-sage/30 overflow-hidden animate-fade-in-up">
                    <div className="bg-fintech-sage/10 p-8 text-fintech-sage text-center border-b border-fintech-sage/20">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
                        <h2 className="text-2xl font-editorial font-medium text-fintech-cream">Parsing Executed</h2>
                        <p className="font-terminal text-[11px] uppercase tracking-widest text-fintech-ash mt-3">Algorithmic extraction yielded {successData.extracted_skills?.length || 0} unique skill nodes.</p>
                    </div>

                    <div className="p-10">
                        <div className="flex flex-wrap gap-2 mb-10 justify-center">
                            {successData.extracted_skills?.map((skill: any, idx: number) => (
                                <div key={idx} className="bg-fintech-base px-3 py-1.5 rounded border border-fintech-border flex items-center space-x-2">
                                    <span className="font-terminal text-[11px] text-fintech-cream uppercase">{skill.skill_name}</span>
                                    <span className="bg-[#1A1D27] px-1.5 py-0.5 rounded text-[9px] text-fintech-amber uppercase tracking-wider border border-fintech-amber/20">{skill.proficiency_claimed}</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-fintech-base border border-fintech-border border-l-[3px] border-l-fintech-amber p-8 text-center rounded">
                            <h3 className="text-lg font-editorial text-fintech-cream mb-2">Automated Node Validation</h3>
                            <p className="font-terminal text-[11px] tracking-wide uppercase text-fintech-ash mb-6">20 dynamic sequences structured to verify extraction fidelity.</p>

                            <button
                                onClick={() => navigate(`/dashboard/candidate/test?session=${successData.session_id}`)}
                                className="px-8 py-3.5 bg-fintech-amber text-fintech-base font-terminal text-[11px] font-bold uppercase tracking-widest hover:bg-fintech-amber-hover transition rounded shadow-[0_0_15px_rgba(232,168,48,0.3)]"
                            >
                                Initiate Verification Node
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
