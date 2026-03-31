import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { BrainCircuit, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';

export default function JobTest() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    const { data: mcqs, isLoading } = useQuery({
        queryKey: ['job-mcqs', jobId],
        queryFn: async () => {
            const res = await api.get(`/tests/job/${jobId}/mcqs`);
            return res.data.questions;
        }
    });

    const submitTest = async () => {
        setSubmitting(true);
        try {
            await api.post(`/tests/job/${jobId}/submit`, {
                answers: answers
            });
            navigate('/dashboard/candidate/applications');
        } catch (e) {
            console.error(e);
            alert("Failed to submit test. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

    if (!mcqs || mcqs.length === 0) {
        return (
            <div className="max-w-3xl mx-auto text-center py-24">
                <BrainCircuit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold">No Tests Required</h2>
                <p className="text-gray-500 mb-8">This job does not have a required assessment.</p>
                <button onClick={() => navigate('/dashboard/candidate/applications')} disabled={submitting} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700">
                    Return to Applications
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                <h1 className="text-3xl font-black text-gray-900 mb-2">Job Assessment</h1>
                <p className="text-gray-500">Answer these technical questions to complete your application.</p>
            </div>

            <div className="space-y-6">
                {mcqs.map((q: any, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">
                            <span className="text-indigo-600 mr-2">Q{idx + 1}.</span> 
                            {q.question}
                        </h3>
                        <div className="space-y-3">
                            {q.options?.map((opt: string, optIdx: number) => (
                                <button
                                    key={optIdx}
                                    onClick={() => setAnswers(prev => ({ ...prev, [idx.toString()]: opt }))}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                        answers[idx.toString()] === opt 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                                            : 'border-gray-100 hover:border-indigo-200 text-gray-700'
                                    }`}
                                >
                                    <span>{opt}</span>
                                    {answers[idx.toString()] === opt && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between sticky bottom-4">
                <div className="text-gray-500 font-medium">
                    {Object.keys(answers).length} / {mcqs.length} Answered
                </div>
                <button
                    onClick={submitTest}
                    disabled={Object.keys(answers).length < mcqs.length || submitting}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all"
                >
                    <span>{submitting ? 'Submitting...' : 'Complete Assessment'}</span>
                    {!submitting && <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
}
