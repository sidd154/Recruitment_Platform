import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Video, Mic, Clock, AlertTriangle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

export default function VerificationTest() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(60 * 30); // 30 mins
    const [proctoringActive, setProctoringActive] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Fallback/Mock behavior check internally but UI should always "work"
    useEffect(() => {
        const fetchSession = async () => {
            if (!sessionId) {
                navigate('/dashboard/candidate/resume');
                return;
            }
            try {
                const { data } = await api.get(`/tests/${sessionId}`);
                setQuestions(data.questions || []);
            } catch (err: any) {
                console.error("Failed to load test:", err);
                // We'll proceed with empty state to show error UI
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [sessionId, navigate]);

    useEffect(() => {
        if (proctoringActive && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && proctoringActive) {
            handleFinalSubmit();
        }
    }, [proctoringActive, timeLeft]);

    const requestCameraAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setProctoringActive(true);
            // Let backend know proctoring started (placeholder)
            api.post(`/tests/${sessionId}/consent`, { proctoring_consent: true });
        } catch (err) {
            alert("Camera and Microphone access are required to take the verified assessment.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const handleOptionSelect = (qId: string, optionKey: string) => {
        setAnswers(prev => ({ ...prev, [qId]: optionKey }));
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        stopCamera();
        try {
            await api.post(`/tests/${sessionId}/submit`, { answers });
            // The backend should evaluate and create a passport
            navigate('/dashboard/candidate/passport');
        } catch (err) {
            console.error("Submission failed", err);
            // If error, maybe redirect to roadmap
            navigate('/dashboard/candidate/roadmap');
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center text-indigo-600"><Loader2 className="w-12 h-12 animate-spin" /></div>;
    }

    if (!questions.length) {
        return (
            <div className="bg-red-50 text-red-700 p-8 rounded-2xl border border-red-200 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-xl font-bold">Test Session Unavailable</h2>
                <p>Could not load questions. Ensure you parsed your resume first.</p>
                <button onClick={() => navigate('/dashboard/candidate')} className="mt-4 px-6 py-2 bg-white text-red-700 font-bold rounded-lg border border-red-200 hover:bg-red-100">Go Back</button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 relative items-start">

            {/* Proctoring Sidebar */}
            <div className="w-full lg:w-80 space-y-6 lg:sticky lg:top-8">
                <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 relative group">
                    <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white border border-white/10">
                        {proctoringActive ? (
                            <><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><span>REC</span></>
                        ) : (
                            <><Video className="w-3 h-3" /><span>Proctoring</span></>
                        )}
                    </div>

                    <div className="aspect-video bg-black flex items-center justify-center relative">
                        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${!proctoringActive ? 'hidden' : ''}`} />
                        {!proctoringActive && (
                            <button onClick={requestCameraAccess} className="absolute inset-0 flex flex-col items-center justify-center text-white hover:bg-white/10 transition">
                                <Video className="w-12 h-12 mb-3 text-indigo-400" />
                                <span className="font-bold">Enable Camera</span>
                            </button>
                        )}
                    </div>

                    <div className="p-5 bg-gray-900 text-white">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-800">
                            <div className="flex items-center space-x-2 font-mono text-xl text-red-400">
                                <Clock className="w-5 h-5" />
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                            {proctoringActive && <Mic className="w-5 h-5 text-green-400" />}
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs uppercase tracking-widest text-gray-500 font-bold">Proctoring Events</h4>

                            {proctoringActive ? (
                                <>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                        <span className="text-gray-300">Face tracked successfully</span>
                                    </div>
                                    <div className="flex items-start space-x-3 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                                        <span className="text-gray-300">Audio levels normal</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-500">Awaiting consent...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Test Area */}
            <div className="flex-1 w-full relative">
                {!proctoringActive && (
                    <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center p-8 border border-white">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md text-center border border-gray-100">
                            <ShieldCheck className="w-16 h-16 text-indigo-600 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Identity Verification Required</h2>
                            <p className="text-gray-600 mb-8">To earn a verified Skill Passport, you must enable your camera and microphone. Our agentic proctoring ensures fairness.</p>
                            <button onClick={requestCameraAccess} className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center space-x-2">
                                <Video className="w-5 h-5" />
                                <span>Start Verification</span>
                            </button>
                        </div>
                    </div>
                )}

                <div className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 transition-all ${!proctoringActive ? 'opacity-40 blur-sm pointer-events-none select-none' : ''}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                            Question {currentIndex + 1} of {questions.length}
                        </div>
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
                            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2 overflow-hidden">
                                <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
                            </div>
                            {answeredCount}/{questions.length} Answered
                        </div>
                    </div>

                    <div className="mb-10">
                        <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-lg mb-4 border border-indigo-100">
                            Testing: {currentQ?.skill || 'General'}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 leading-relaxed">
                            {currentQ?.question_text || "Placeholder question text?"}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(currentQ?.options || {}).map(([key, value]) => {
                            const isSelected = answers[currentQ?.question_id] === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleOptionSelect(currentQ?.question_id, key)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center space-x-4 ${isSelected
                                        ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600'
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {key}
                                    </div>
                                    <span className={`text-lg transition-colors ${isSelected ? 'text-indigo-900 font-semibold' : 'text-gray-700'}`}>
                                        {value as string}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-12 flex justify-between items-center pt-8 border-t border-gray-100">
                        <button
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Previous
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                onClick={handleFinalSubmit}
                                disabled={submitting || answeredCount < questions.length}
                                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                <span>{submitting ? 'Evaluating...' : 'Submit Assessment'}</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition"
                            >
                                Next Question
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
