import { create } from 'zustand';

interface User {
    id: string;
    full_name: string;
    email: string;
    role: 'candidate' | 'recruiter';
    phone?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    role: 'candidate' | 'recruiter' | null;
    isVerified: boolean;
    setAuth: (user: User, token: string, role: 'candidate' | 'recruiter', isVerified: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
    const storedUser = localStorage.getItem('sb_user');
    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        token: localStorage.getItem('sb_token'),
        role: localStorage.getItem('sb_role') as 'candidate' | 'recruiter' | null,
        isVerified: localStorage.getItem('sb_verified') === 'true',
        setAuth: (user, token, role, isVerified) => {
            localStorage.setItem('sb_user', JSON.stringify(user));
            localStorage.setItem('sb_token', token);
            localStorage.setItem('sb_role', role);
            localStorage.setItem('sb_verified', String(isVerified));
            set({ user, token, role, isVerified });
        },
        logout: () => {
            localStorage.removeItem('sb_user');
            localStorage.removeItem('sb_token');
            localStorage.removeItem('sb_role');
            localStorage.removeItem('sb_verified');
            set({ user: null, token: null, role: null, isVerified: false });
        },
    };
});
