import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { LogIn, Terminal, ShieldCheck, Loader2, AlertCircle, Hexagon } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore(state => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuth(data.user, data.token, data.user.role, data.user.is_verified || false);
            navigate(`/dashboard/${data.user.role}`);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Authentication sequence failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (role: 'candidate' | 'recruiter') => {
        setEmail(role === 'candidate' ? 'demo.candidate@skillbridge.dev' : 'demo.recruiter@techcorp.com');
        setPassword('Demo@1234');
    };

    return (
        <div className="min-h-screen bg-fintech-base flex items-center justify-center p-6 relative overflow-hidden font-body text-fintech-cream">
            <div className="w-full max-w-md relative z-10">
                <div className="bg-fintech-surface rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden border border-fintech-border">

                    <div className="p-10 pb-6 text-center border-b border-fintech-border/50">
                        <Link to="/" className="inline-flex items-center space-x-3 mb-8 group">
                            <div className="text-fintech-amber p-1.5 border border-fintech-amber/20 rounded shadow-[0_0_10px_rgba(232,168,48,0.2)] bg-fintech-base group-hover:bg-fintech-amber/10 transition-colors">
                                <Hexagon className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-editorial tracking-wide">SkillBridge</span>
                        </Link>

                        <h1 className="text-2xl font-medium tracking-wide mb-2">Secure Terminal Access</h1>
                        <p className="text-fintech-ash font-terminal text-[11px] uppercase tracking-widest">Verify Ledger Credentials</p>
                    </div>

                    <form onSubmit={handleLogin} className="p-10 space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded text-sm flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span className="font-terminal font-medium">{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash ml-1">Identity Protocol (Email)</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-fintech-base border border-fintech-border rounded-lg focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none text-fintech-cream font-terminal text-sm"
                                placeholder="NODE.USER@SYSTEM.COM"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Encryption Key (Password)</label>
                                <button type="button" className="text-[10px] uppercase font-terminal tracking-widest text-fintech-amber hover:text-fintech-amber-hover transition-colors">Bypass?</button>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-fintech-base border border-fintech-border rounded-lg focus:ring-1 focus:ring-fintech-amber focus:border-fintech-amber transition-all outline-none text-fintech-amber font-terminal text-lg tracking-widest placeholder-fintech-ash/30"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-fintech-amber hover:bg-fintech-amber-hover text-fintech-base font-editorial font-bold text-lg py-4 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Terminal className="w-5 h-5" />}
                            <span>{loading ? 'Decrypting...' : 'Initialize Session'}</span>
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-fintech-border"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] text-fintech-ash">
                                <span className="bg-fintech-surface px-4">Demo Override</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('candidate')}
                                className="bg-fintech-base hover:bg-[#1E212E] text-fintech-amber py-3 rounded border border-fintech-border hover:border-fintech-amber/30 transition-all flex items-center justify-center space-x-2 group"
                            >
                                <ShieldCheck className="w-4 h-4 group-hover:text-fintech-amber text-fintech-ash transition-colors" />
                                <span className="font-terminal text-[11px] uppercase tracking-widest">Candidate</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDemoLogin('recruiter')}
                                className="bg-fintech-base hover:bg-[#1E212E] text-[#63A583] py-3 rounded border border-fintech-border hover:border-[#63A583]/30 transition-all flex items-center justify-center space-x-2 group"
                            >
                                <ShieldCheck className="w-4 h-4 group-hover:text-[#63A583] text-fintech-ash transition-colors" />
                                <span className="font-terminal text-[11px] uppercase tracking-widest">Recruiter</span>
                            </button>
                        </div>
                    </form>

                    <div className="bg-[#1A1D27] p-6 text-center border-t border-fintech-border">
                        <p className="text-[11px] font-terminal uppercase tracking-widest text-fintech-ash">
                            Unallocated Node? {' '}
                            <Link to="/register/candidate" className="text-fintech-amber hover:text-fintech-amber-hover transition-colors">Establish Connection</Link>
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-fintech-ash text-[10px] font-terminal uppercase tracking-[0.2em]">
                    SkillBridge Secure Terminal // 256-Bit Ledger Verification
                </p>
            </div>
        </div>
    );
}
