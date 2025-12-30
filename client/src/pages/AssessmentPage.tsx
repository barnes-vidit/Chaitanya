import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessments } from '../data/assessments';
import type { AssessmentType } from '../data/assessments';
import { ArrowLeft, ArrowRight, CheckCircle, Brain, Activity } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const AssessmentPage = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();

    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const startAssessment = async (assessment: AssessmentType) => {
        setLoading(true);
        try {
            const token = await getToken();
            // Start assessment on backend
            const res = await fetch('http://localhost:5000/api/assessment/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type: assessment.id })
            });

            const data = await res.json();
            setActiveId(data._id);
            setSelectedAssessment(assessment);
            setCurrentStep(0);
            setAnswers({});
        } catch (err) {
            console.error('Failed to start assessment', err);
            // Fallback for demo if backend fails or is not reachable
            setSelectedAssessment(assessment);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (value: any) => {
        const question = selectedAssessment!.questions[currentStep];
        setAnswers(prev => ({ ...prev, [question.id]: value }));
    };

    const nextStep = () => {
        if (currentStep < selectedAssessment!.questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            submitAssessment();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const submitAssessment = async () => {
        setLoading(true);
        try {
            if (activeId) {
                const token = await getToken();
                await fetch(`http://localhost:5000/api/assessment/${activeId}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ responses: answers })
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to submit', err);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // 1. Selection Screen
    if (!selectedAssessment) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
                    </button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">New Assessment</h1>
                    <p className="text-gray-600 mb-8">Select an assessment type to begin.</p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {assessments.map(a => (
                            <div
                                key={a.id}
                                onClick={() => startAssessment(a)}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                    {a.id === 'MMSE' ? <Brain className="h-6 w-6 text-indigo-600" /> : <Activity className="h-6 w-6 text-indigo-600" />}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{a.title}</h3>
                                <p className="text-gray-500 mb-4">{a.description}</p>
                                <div className="flex items-center text-sm text-indigo-600 font-medium">
                                    Start Assessment <ArrowRight className="h-4 w-4 ml-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 2. Question Interface
    const currentQuestion = selectedAssessment.questions[currentStep];
    const progress = ((currentStep + 1) / selectedAssessment.questions.length) * 100;

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-2xl w-full md:rounded-3xl md:shadow-lg p-8 md:p-12 relative overflow-hidden">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <button
                    onClick={() => setSelectedAssessment(null)}
                    className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"
                >
                    Cancel
                </button>

                <div className="mb-8 mt-4">
                    <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
                        Question {currentStep + 1} of {selectedAssessment.questions.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 leading-tight">
                        {currentQuestion.text}
                    </h2>
                </div>

                <div className="mb-12">
                    {currentQuestion.type === 'input' && (
                        <input
                            type="text"
                            className="w-full text-lg p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-colors"
                            placeholder="Type your answer here..."
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            autoFocus
                        />
                    )}

                    {currentQuestion.type === 'scale' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleAnswer(opt.value)}
                                    className={`w-full p-4 text-left rounded-xl border-2 transition-all ${answers[currentQuestion.id] === opt.value
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-medium'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'yes_no' && (
                        <div className="grid grid-cols-2 gap-4">
                            {currentQuestion.options?.map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => handleAnswer(opt.value)}
                                    className={`p-6 text-center rounded-xl border-2 transition-all ${answers[currentQuestion.id] === opt.value
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`flex items-center text-gray-500 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''
                            }`}
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Previous
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={answers[currentQuestion.id] === undefined}
                        className="flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:shadow-none"
                    >
                        {currentStep === selectedAssessment.questions.length - 1 ? 'Complete' : 'Next'}
                        {currentStep < selectedAssessment.questions.length - 1 && <ArrowRight className="h-5 w-5 ml-2" />}
                        {currentStep === selectedAssessment.questions.length - 1 && <CheckCircle className="h-5 w-5 ml-2" />}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AssessmentPage;
