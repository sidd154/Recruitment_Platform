import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, PlaySquare, FileTerminal, Network, CircleDot } from 'lucide-react';

export default function CandidateApplications() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: applications, isLoading } = useQuery({
        queryKey: ['my-applications'],
        queryFn: async () => {
            const res = await api.get('/applications');
            return res.data;
        }
    });

    const acceptMutation = useMutation({
        mutationFn: async (appId: string) => {
            const res = await api.put(`/applications/${appId}/accept_interview`);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['my-applications'], (old: any[]) => {
                if (!old) return old;
                return old.map(app =>
                    app.id === data.id
                        ? { ...app, status: 'interview_accepted', interview_session_id: data.interview_session_id }
                        : app
                );
            });
            queryClient.invalidateQueries({ queryKey: ['my-applications'] });
        }
    });

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-fintech-amber" /></div>;

    if (!applications || applications.length === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
                <div className="bg-fintech-surface p-16 border border-fintech-border text-center shadow-sm">
                    <FileTerminal className="w-16 h-16 text-fintech-ash mx-auto mb-6 opacity-50" />
                    <h2 className="text-2xl font-editorial font-medium text-fintech-cream">NO ACTIVE LEDGERS</h2>
                    <p className="text-fintech-ash font-terminal tracking-wide text-[11px] mt-4 uppercase">Initialize nodes on the Live Feed to begin tracking.</p>
                </div>
            </div>
        );
    }

    const STEPS = [
        { key: 'applied', label: 'Registered' },
        { key: 'test', label: 'Testing' },
        { key: 'interview', label: 'Evaluation Room' },
        { key: 'done', label: 'Decision' }
    ];

    const getAppStep = (status: string) => {
        if (!status || status === 'applied') return 0;
        if (status.includes('test')) return 1;
        if (status.includes('interview') && status !== 'interview_done') return 2;
        return 3; // done, accepted, rejected
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-fintech-border text-fintech-cream">
                <Network className="w-6 h-6 text-fintech-ash" />
                <h1 className="text-3xl font-editorial tracking-wide">Application Tracking</h1>
            </div>

            <div className="space-y-4">
                {applications.map((app: any) => {
                    const sessionId = app.interview_session_id;
                    const stepIdx = getAppStep(app.status);

                    return (
                    <div key={app.id} className="bg-fintech-surface p-6 border-l-[3px] border-fintech-border hover:border-fintech-amber transition-colors flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                        <div className="flex-1">
                            <h3 className="text-xl font-editorial text-fintech-cream group-hover:text-fintech-amber transition-colors">{app.jobs?.title || app.job_title || 'Requisition'}</h3>
                            <p className="font-terminal text-[11px] text-fintech-ash uppercase tracking-widest mt-1 mb-4">Tech Corp • {app.jobs?.location || 'Remote'}</p>
                            
                            {/* Linear Tracker */}
                            <div className="flex items-center space-x-2 mt-2 max-w-sm">
                                {STEPS.map((step, idx) => (
                                    <div key={step.key} className="flex items-center flex-1">
                                        <div className={`flex items-center justify-center w-5 h-5 rounded-full border text-[10px] ${
                                            idx <= stepIdx 
                                                ? 'border-fintech-amber text-fintech-cream bg-fintech-amber/10 shadow-[0_0_8px_rgba(232,168,48,0.3)]' 
                                                : 'border-fintech-border text-fintech-ash bg-[#1A1D27]'
                                        }`}>
                                            {idx < stepIdx ? '✓' : idx + 1}
                                        </div>
                                        {idx < STEPS.length - 1 && (
                                            <div className={`h-[1px] flex-1 mx-2 ${idx < stepIdx ? 'bg-fintech-amber/50' : 'bg-fintech-border'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between max-w-sm mt-2 text-[9px] font-terminal uppercase text-fintech-ash tracking-widest px-1">
                                <span>Reg</span>
                                <span>Test</span>
                                <span>Eval</span>
                                <span>Dec</span>
                            </div>

                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                            {app.mcq_score != null && (
                                <span className="font-terminal text-[10px] text-fintech-sage border border-fintech-sage/30 bg-fintech-sage/10 px-3 py-1 uppercase tracking-widest mb-2 shadow-[0_0_6px_rgba(106,143,120,0.1)]">
                                    Assessment: {Number(app.mcq_score).toFixed(0)}%
                                </span>
                            )}

                            {app.status === 'test_requested' && (
                                <button
                                    onClick={() => navigate(`/dashboard/candidate/job-test/${app.job_id}`)}
                                    className="w-full flex justify-center items-center gap-2 bg-fintech-base hover:bg-[#1E212E] border border-fintech-amber/30 text-fintech-amber font-terminal text-[11px] font-bold py-3 px-4 uppercase tracking-wider transition"
                                >
                                    <CircleDot className="w-3.5 h-3.5" /> Initialize Testing
                                </button>
                            )}

                            {app.status === 'interview_requested' && (
                                <button
                                    onClick={() => acceptMutation.mutate(app.id)}
                                    disabled={acceptMutation.isPending}
                                    className="w-full flex justify-center items-center gap-2 bg-fintech-amber text-fintech-base font-terminal text-[11px] font-bold py-3 px-4 uppercase tracking-wider transition hover:bg-fintech-amber-hover"
                                >
                                    {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                                    Confirm Schedule
                                </button>
                            )}

                            {app.status === 'interview_accepted' && (
                                <button
                                    onClick={() => {
                                        if (sessionId) {
                                            navigate(`/dashboard/candidate/interview?session_id=${sessionId}`);
                                        } else {
                                            alert('Session unverified. Please refresh connection.');
                                        }
                                    }}
                                    className="w-full flex justify-center items-center gap-2 bg-fintech-amber/90 hover:bg-fintech-amber text-fintech-base font-terminal text-[11px] font-bold py-3 px-4 uppercase tracking-widest shadow-[0_0_15px_rgba(232,168,48,0.5)] transition"
                                >
                                    <PlaySquare className="w-3.5 h-3.5 animate-pulse" /> Initialize Room
                                </button>
                            )}
                            
                            {app.status === 'interview_done' && (
                                <span className="text-fintech-ash font-terminal text-[10px] uppercase tracking-widest border border-fintech-border px-3 py-1">
                                    Awaiting Decryption
                                </span>
                            )}
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}
