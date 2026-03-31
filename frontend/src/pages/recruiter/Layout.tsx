import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
    Hexagon,
    Terminal,
    User,
    Users,
    Network,
    Bell,
    LogOut,
    Plus,
    Activity
} from 'lucide-react';

export default function RecruiterLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: 'jobs', icon: Activity, label: 'Live Pipeline' },
        { to: 'jobs/new', icon: Plus, label: 'Initialize Position' },
        { to: 'search', icon: Users, label: 'Talent Match Search' },
        { to: 'profile', icon: User, label: 'Entity Profile' },
    ];

    return (
        <div className="min-h-screen bg-fintech-base text-fintech-cream font-body flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-fintech-surface backdrop-blur-xl border-b border-fintech-border px-8 h-20 flex items-center justify-between shadow-2xl">
                {/* Logo & Brand */}
                <div className="flex items-center space-x-4 mr-10 relative">
                    <div className="text-fintech-amber p-1.5 border border-fintech-amber/20 rounded shadow-[0_0_10px_rgba(232,168,48,0.2)] bg-fintech-base">
                        <Hexagon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-editorial tracking-wide cursor-default">SkillBridge</span>
                </div>

                {/* Dynamic Center Tabs */}
                <nav className="flex-1 flex gap-1 h-full items-end pb-0 overflow-x-auto no-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                                px-5 py-4 flex items-center space-x-2 transition-all duration-200 border-b-2 whitespace-nowrap
                                ${isActive
                                    ? 'border-fintech-amber text-fintech-amber bg-fintech-base font-medium'
                                    : 'border-transparent text-fintech-ash hover:border-fintech-ash/50 hover:text-fintech-cream hover:bg-[#1E212E]/50'}
                            `}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="font-terminal text-[11px] tracking-widest uppercase mt-0.5">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Right Profile Actions */}
                <div className="flex items-center space-x-6 ml-6 shrink-0">
                    <button className="relative text-fintech-ash hover:text-fintech-amber transition-colors p-2 rounded hover:bg-[#1E212E]">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-fintech-amber rounded-full shadow-[0_0_8px_rgba(232,168,48,0.8)]"></span>
                    </button>
                    <div className="flex items-center space-x-4 pl-6 border-l border-fintech-border">
                        <div className="flex flex-col text-right hidden lg:flex">
                            <span className="text-sm font-medium tracking-wide">{user?.full_name}</span>
                            <span className="text-[9px] font-terminal text-fintech-sage uppercase tracking-widest mt-0.5">Enterprise Node</span>
                        </div>
                        <div className="w-9 h-9 bg-fintech-amber text-fintech-base rounded-md flex items-center justify-center font-editorial text-lg font-bold shadow-[0_0_12px_rgba(232,168,48,0.3)]">
                            {user?.full_name?.charAt(0)}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-2 p-2 text-fintech-ash hover:text-red-400 hover:bg-[#1E212E] transition-all rounded"
                            title="Terminate Session"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full mx-auto px-6 py-12 flex flex-col">
                <div className="flex items-center space-x-3 mb-8 px-6 opacity-60 pointer-events-none">
                    <Terminal className="w-4 h-4 text-fintech-ash" />
                    <span className="text-[11px] font-terminal uppercase tracking-[0.2em] text-fintech-ash">Enterprise Recruitment Network // Ready</span>
                </div>
                <div className="px-6 flex-1 w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
