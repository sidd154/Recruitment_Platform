import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { Building2, Mail, Globe, Briefcase, Save, Loader2, CheckCircle, TerminalSquare } from 'lucide-react';

export default function RecruiterProfile() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        company_name: '',
        company_domain: '',
        designation: ''
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/recruiters/profile', formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            alert('Failed to update ledger');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="flex items-center space-x-3 mb-6 opacity-70">
                <TerminalSquare className="w-5 h-5 text-[#63A583]" />
                <h1 className="text-[14px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">
                    Entity Configuration // <span className="text-[#63A583]">Admin Access</span>
                </h1>
            </div>

            <div className="bg-fintech-surface rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-fintech-border overflow-hidden">
                
                {/* Header Banner */}
                <div className="h-32 bg-[#1C202E] relative border-b border-fintech-border flex items-end px-10 pb-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]">
                    <div className="absolute top-0 right-0 w-2 h-full bg-[#63A583]"></div>
                    <div className="absolute -bottom-10 left-10">
                        <div className="w-24 h-24 bg-fintech-surface rounded-lg p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] border border-fintech-border">
                            <div className="w-full h-full bg-[#63A583] rounded flex items-center justify-center text-3xl font-editorial font-bold text-fintech-base shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
                                {user?.full_name?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-16 px-10 pb-10">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-2xl font-editorial font-medium tracking-wide text-fintech-cream">{user?.full_name}</h1>
                            <p className="text-fintech-ash font-terminal text-[12px] uppercase tracking-widest mt-1.5 flex items-center">
                                <Mail className="w-3.5 h-3.5 mr-2 opacity-70" /> {user?.email}
                            </p>
                        </div>
                        {saved && (
                            <div className="bg-[#63A583]/10 text-[#63A583] border border-[#63A583]/30 px-4 py-2 rounded flex items-center font-terminal text-[10px] uppercase tracking-widest animate-fade-in-up">
                                <CheckCircle className="w-3 h-3 mr-2" /> 
                                Ledger Synced
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSave} className="space-y-10">
                        
                        {/* Identify Block */}
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <Briefcase className="w-4 h-4 text-fintech-ash" />
                                <h3 className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Authorized Telemetry</h3>
                                <div className="h-px bg-fintech-border flex-1 ml-4 opacity-50"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 relative">
                                    <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-[#63A583] z-10">Entity Name</label>
                                    <input
                                        type="text"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] transition-all outline-none font-terminal text-[13px] text-fintech-cream"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-[#63A583] z-10 flex items-center">
                                        Access Privilege
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                        placeholder="e.g. Talent Auditor"
                                        className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] transition-all outline-none font-terminal text-[13px] text-fintech-cream placeholder-fintech-ash/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Database */}
                        <div className="pt-4">
                            <div className="flex items-center space-x-3 mb-6">
                                <Building2 className="w-4 h-4 text-fintech-ash" />
                                <h3 className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Enterprise Network Node</h3>
                                <div className="h-px bg-fintech-border flex-1 ml-4 opacity-50"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-2 relative">
                                    <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-fintech-amber z-10">Enterprise Hash</label>
                                    <input
                                        type="text"
                                        value={formData.company_name}
                                        onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                        placeholder="e.g. TechCorp Node"
                                        className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none font-terminal text-[13px] text-fintech-cream placeholder-fintech-ash/30"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="absolute -top-2 left-3 bg-fintech-surface px-1 text-[9px] font-terminal uppercase tracking-[0.2em] text-fintech-amber z-10 flex items-center">
                                        <Globe className="w-3 h-3 mr-1" /> Domain Pointer
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.company_domain}
                                        onChange={e => setFormData({ ...formData, company_domain: e.target.value })}
                                        placeholder="e.g. system.io"
                                        className="w-full px-4 py-4 bg-fintech-base border border-fintech-border rounded focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none font-terminal text-[13px] text-fintech-cream placeholder-fintech-ash/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-8 border-t border-fintech-border flex justify-between items-center">
                            <span className="text-[10px] font-terminal uppercase tracking-widest text-fintech-ash">
                                Ledger update authorized. Commit ready.
                            </span>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#63A583] hover:bg-[#78C49F] text-fintech-base font-editorial font-bold px-8 py-3.5 rounded shadow-[0_0_15px_rgba(99,165,131,0.2)] hover:shadow-[0_0_20px_rgba(99,165,131,0.4)] transition-all flex items-center space-x-3 disabled:opacity-70 disabled:shadow-none"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Commit to Chain</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
