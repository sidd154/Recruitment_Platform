import { useState, cloneElement, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { User, Mail, Lock, Phone, GraduationCap, School, Calendar, ArrowRight, AlertCircle, Hexagon } from 'lucide-react';

export default function RegisterCandidate() {
    const [formData, setFormData] = useState({
        full_name: '', email: '', password: '', college: '', graduation_year: '', degree: '', phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register/candidate', {
                ...formData,
                graduation_year: parseInt(formData.graduation_year, 10)
            });
            navigate('/login?registered=true');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration sequence failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-fintech-base flex flex-col justify-center py-12 px-6 lg:px-8 font-body text-fintech-cream">
            <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
                <Link to="/" className="inline-flex items-center space-x-3 group">
                    <div className="text-fintech-amber p-1.5 border border-fintech-amber/20 rounded shadow-[0_0_10px_rgba(232,168,48,0.2)] bg-fintech-surface group-hover:bg-fintech-amber/10 transition-colors">
                        <Hexagon className="w-8 h-8" />
                    </div>
                    <span className="text-3xl font-editorial tracking-wide">SkillBridge</span>
                </Link>
                <h2 className="mt-6 text-2xl font-medium tracking-wide text-fintech-cream">Initialize Candidate Node</h2>
                <p className="mt-2 text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">
                    Active Ledger? <Link to="/login" className="text-fintech-amber hover:text-fintech-amber-hover transition-colors">Authenticate</Link>
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-fintech-surface p-10 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-fintech-border">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-sm flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="font-terminal font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField icon={<User />} label="Entity Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                            <InputField icon={<Phone />} label="Comm Link" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>

                        <InputField icon={<Mail />} label="Identity (Email)" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        <InputField icon={<Lock />} label="Encryption Key" type="password" name="password" value={formData.password} onChange={handleChange} required />

                        <div className="pt-8 mt-8 border-t border-fintech-border border-dashed">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="h-px bg-fintech-amber/30 flex-1"></div>
                                <h3 className="text-[10px] font-terminal text-fintech-amber uppercase tracking-[0.3em]">Academic Protocol</h3>
                                <div className="h-px bg-fintech-amber/30 flex-1"></div>
                            </div>
                            
                            <div className="space-y-6">
                                <InputField icon={<School />} label="Institution Ledger" name="college" value={formData.college} onChange={handleChange} required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField icon={<GraduationCap />} label="Classification" name="degree" value={formData.degree} onChange={handleChange} placeholder="B.S. Eng" required />
                                    <InputField icon={<Calendar />} label="Epoch (Year)" type="number" name="graduation_year" value={formData.graduation_year} onChange={handleChange} placeholder="2024" required />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-fintech-amber hover:bg-fintech-amber-hover text-fintech-base font-editorial font-bold text-lg py-4 rounded-lg transition-all flex items-center justify-center space-x-2 mt-8 disabled:opacity-70"
                        >
                            <span>{loading ? 'Committing...' : 'Establish Node'}</span>
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
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
                    className="block w-full pl-11 pr-4 py-3 border border-fintech-border rounded-lg focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber bg-fintech-base focus:bg-[#1C202D] text-fintech-cream font-terminal text-[13px] transition-all outline-none"
                    style={{ letterSpacing: type === 'password' ? '0.3em' : 'normal' }}
                />
            </div>
        </div>
    );
}
