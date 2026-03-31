import { useState, cloneElement, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { User, Mail, Lock, Building2, Users, Briefcase, ArrowRight, AlertCircle, KeyRound, Hexagon, Terminal } from 'lucide-react';

export default function RegisterRecruiter() {
    const [formData, setFormData] = useState({
        full_name: '', work_email: '', password: '', company_name: '', company_size: '11-50', designation: ''
    });
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register/recruiter', formData);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration sequence failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/verify-otp', { email: formData.work_email, otp_code: otp });
            navigate('/login?verified=true');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Verification rejected. Invalid checksum.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-fintech-base flex flex-col justify-center py-12 px-6 lg:px-8 font-body text-fintech-cream">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
                <Link to="/" className="inline-flex items-center space-x-3 group">
                    <div className="text-[#63A583] p-1.5 border border-[#63A583]/20 rounded shadow-[0_0_10px_rgba(99,165,131,0.2)] bg-fintech-surface group-hover:bg-[#63A583]/10 transition-colors">
                        <Hexagon className="w-8 h-8" />
                    </div>
                    <span className="text-3xl font-editorial tracking-wide">SkillBridge</span>
                </Link>
                <h2 className="mt-6 text-2xl font-medium tracking-wide text-fintech-cream">Initialize Enterprise Node</h2>
                <p className="mt-2 text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">
                    Active Ledger? <Link to="/login" className="text-[#63A583] hover:text-[#78C49F] transition-colors">Authenticate</Link>
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-fintech-surface p-10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-fintech-border">

                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-sm flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="font-terminal font-medium">{error}</p>
                                </div>
                            )}

                            <InputField icon={<User />} label="Entity Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                            <InputField icon={<Mail />} label="Enterprise Comm Link" type="email" name="work_email" value={formData.work_email} onChange={handleChange} placeholder="user@enterprise.org" required />
                            <InputField icon={<Lock />} label="Encryption Key" type="password" name="password" value={formData.password} onChange={handleChange} required />

                            <div className="pt-8 mt-8 border-t border-fintech-border border-dashed">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="h-px bg-[#63A583]/30 flex-1"></div>
                                    <h3 className="text-[10px] font-terminal text-[#63A583] uppercase tracking-[0.3em]">Network Context</h3>
                                    <div className="h-px bg-[#63A583]/30 flex-1"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField icon={<Building2 />} label="Network Label" name="company_name" value={formData.company_name} onChange={handleChange} required />
                                    <div>
                                        <label className="block text-[10px] font-terminal uppercase tracking-[0.2em] text-fintech-ash opacity-80 mb-2 ml-1">Network Capacity</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Users className="h-4 w-4 text-fintech-ash" />
                                            </div>
                                            <select
                                                name="company_size"
                                                value={formData.company_size}
                                                onChange={handleChange}
                                                className="block w-full pl-11 pr-4 py-3 border border-fintech-border rounded-lg focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] bg-fintech-base focus:bg-[#1C202D] text-fintech-cream font-terminal text-[13px] transition-all outline-none appearance-none"
                                            >
                                                <option value="1-10">Micro (1-10)</option>
                                                <option value="11-50">Standard (11-50)</option>
                                                <option value="51-200">Scale (51-200)</option>
                                                <option value="201-500">Enterprise (201-500)</option>
                                                <option value="500+">Global (500+)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <InputField icon={<Briefcase />} label="Authorization Level" name="designation" value={formData.designation} onChange={handleChange} placeholder="HR / Exec" required />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#63A583] hover:bg-[#78C49F] text-fintech-base font-editorial font-bold text-lg py-4 rounded-lg transition-all flex items-center justify-center space-x-2 mt-8 disabled:opacity-70"
                            >
                                <span>{loading ? 'Authenticating...' : 'Request Node Approval'}</span>
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </form>
                    ) : (
                        <div className="animate-fade-in-up">
                            <div className="text-center mb-10">
                                <div className="bg-[#63A583]/10 border border-[#63A583]/20 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(99,165,131,0.1)]">
                                    <KeyRound className="h-8 w-8 text-[#63A583]" />
                                </div>
                                <h2 className="text-3xl font-editorial tracking-wide text-fintech-cream">Decrypt Identity</h2>
                                <p className="mt-4 text-[13px] font-terminal text-fintech-ash opacity-80 leading-relaxed">
                                    Transmitted 6-byte token to<br/>
                                    <span className="text-[#63A583] font-medium tracking-widest">{formData.work_email}</span>
                                </p>
                            </div>

                            <form className="space-y-8" onSubmit={handleOtpSubmit}>
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-sm flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="font-terminal font-medium">{error}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-terminal uppercase tracking-[0.3em] text-fintech-ash text-center mb-4">Verification Checksum</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="block w-full text-center text-3xl tracking-[1.5em] font-terminal py-5 border border-fintech-border rounded-lg focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] bg-fintech-base focus:bg-[#1C202D] text-fintech-cream transition-all outline-none"
                                        placeholder="000000"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full bg-[#63A583] hover:bg-[#78C49F] text-fintech-base font-editorial font-bold text-lg py-4 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:grayscale"
                                >
                                    {loading ? <Terminal className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
                                    <span>{loading ? 'Validating...' : 'Verify & Inject Profile'}</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InputField({ icon, label, type = "text", name, value, onChange, placeholder, required }: any) {
    return (
        <div>
            <label className="block text-[10px] font-terminal uppercase tracking-[0.2em] text-fintech-ash opacity-80 mb-2 ml-1">{label}</label>
            <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {cloneElement(icon, { className: "h-4 w-4 text-fintech-ash" })}
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="block w-full pl-11 pr-4 py-3 border border-fintech-border rounded-lg focus:ring-1 focus:ring-[#63A583] focus:border-[#63A583] bg-fintech-base focus:bg-[#1C202D] text-fintech-cream font-terminal text-[13px] transition-all outline-none"
                    style={{ letterSpacing: type === 'password' ? '0.3em' : 'normal' }}
                />
            </div>
        </div>
    );
}
