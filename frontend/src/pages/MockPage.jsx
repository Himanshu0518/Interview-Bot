import { useState, useEffect } from "react";
import QuestionSection from "../components/QuestionSection";
import MockServices from "../services/mock"

function MockPage() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    
    const { num_questions, difficulty_level, interview_type, job_description } = location.state || { 
        num_questions: 5, 
        difficulty_level: "Medium",
        interview_type: "Technical",
        job_description: "Develops and maintains both front-end and back-end systems, ensuring seamless, scalable, and user-friendly applications."
    }; 

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await MockServices.get_mock_questions({ 
                    num_questions, 
                    difficulty_level, 
                    job_description, 
                    interview_type 
                });
                
                // Extract questions array from the response object
                const questionsArray = response?.questions || [];
                
                // Ensure we have valid questions
                if (Array.isArray(questionsArray) && questionsArray.length > 0) {
                    // Add empty answer field to each question for user input
                    const questionsWithAnswers = questionsArray.map(q => ({
                        ...q,
                        answer: "" // Initialize user answer as empty
                    }));
                    setQuestions(questionsWithAnswers);
                } else {
                    console.warn('No questions received from API:', response);
                    setError('No questions available');
                    setQuestions([]);
                }
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError(err.message || 'Failed to load questions');
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [num_questions, difficulty_level, interview_type, job_description]); 

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    </div>
                    <p className="text-xl font-semibold text-gray-700 animate-pulse">
                        ⚡ Generating your questions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-red-500 text-lg font-semibold mb-4">Error: {error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Additional safety check
    if (!Array.isArray(questions) || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center p-6 bg-white rounded-lg shadow-lg">
                    <p className="text-gray-600 text-lg">No questions available</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Reload
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-10 max-w-5xl mx-auto px-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
                {questions.map((q, qIndex) => (
                    <button
                        key={qIndex}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 transform shadow-md
                            ${activeIndex === qIndex
                                ? "bg-blue-600 text-white scale-105"
                                : "bg-gray-200 hover:bg-gray-300"}`}
                        onClick={() => setActiveIndex(qIndex)}
                    >
                        {`Question ${qIndex + 1}`}
                    </button>
                ))}
            </div>

            {/* Active Question */}
            {questions[activeIndex] && (
                <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                    <QuestionSection
                        key={activeIndex}
                        question={questions[activeIndex].question}
                        expected_answer={questions[activeIndex].expected_answer}
                    />
                </div>
            )}
        </div>
    );
}

export default MockPage;