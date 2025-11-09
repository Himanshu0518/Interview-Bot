import { useState, useEffect } from "react";
import QuestionSection from "../components/QuestionSection";
import MockServices from "../services/mock";
import { useLocation, useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import { useSelector } from 'react-redux';
import DashboardServices from '../services/dashboard';
import { toast } from 'react-toastify';

function MockPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);
  const token = useSelector((state) => state.auth.token);
  const userId = userData?.user_id || 'guest';

  const { num_questions, difficulty_level, interview_type, job_description } =
    location.state || {
      num_questions: 5,
      difficulty_level: "Medium",
      interview_type: "Technical",
      job_description:
        "Develops and maintains both front-end and back-end systems, ensuring seamless, scalable, and user-friendly applications.",
    };

  // Get current question for chatbot
  const currentQuestion = questions[activeIndex];
  const questionText = currentQuestion ? currentQuestion.question : null;

  const handleFinishInterview = async () => {
    try {
      setSaving(true);

      // Calculate average rating
      const answeredQuestions = questions.filter(q => q.rating !== undefined && q.rating !== null);
      
      console.log('Total questions:', questions.length);
      console.log('Answered questions:', answeredQuestions.length);
      
      if (answeredQuestions.length === 0) {
        toast.info('Please answer at least one question and get a rating before saving.');
        setSaving(false);
        return;
      }
      
      const avgRating = answeredQuestions.reduce((sum, q) => sum + q.rating, 0) / answeredQuestions.length;

      // Prepare data
      const testData = {
        interview_type: interview_type || 'Mock',
        difficulty_level: difficulty_level || 'Medium',
        total_questions: questions.length,
        questions_answered: answeredQuestions.length,
        average_rating: parseFloat(avgRating.toFixed(2)),
        questions_data: answeredQuestions.map(q => ({
          question: q.question,
          user_answer: q.answer || '',
          expected_answer: q.expected_answer || '',
          rating: q.rating || 0,
          feedback: q.feedback || '',
          better_answer: q.better_answer || ''
        }))
      };

      console.log('Saving test data to localStorage:', testData);
      
      await DashboardServices.saveTestResult(testData, token);
      toast.success(' Test results saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving test:', err);
      toast.error('Failed to save test results: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
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
          interview_type,
        });

        const questionsArray = response?.questions || [];

        if (Array.isArray(questionsArray) && questionsArray.length > 0) {
          const questionsWithAnswers = questionsArray.map((q) => ({
            ...q,
            answer: "",
            rating: null,
            feedback: "",
            better_answer: ""
          }));
          setQuestions(questionsWithAnswers);
        } else {
          setError("No questions available");
          setQuestions([]);
        }
      } catch (err) {
        setError(err.message || "Failed to load questions");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [num_questions, difficulty_level, interview_type, job_description]);

  const handleQuestionComplete = (index, data) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        answer: data.answer,
        rating: data.rating,
        feedback: data.feedback,
        better_answer: data.better_answer
      };
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-200 to-blue-300 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
            ⚡ Generating your questions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200 dark:from-gray-900 dark:to-black">
        <div className="bg-white/90 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-gray-200/40 dark:border-gray-700/40">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-4">
            Error: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 dark:hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black">
        <div className="bg-white/90 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center max-w-md w-full border border-gray-200/40 dark:border-gray-700/40">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            No questions available
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-900 dark:via-gray-950 dark:to-black px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 justify-center">
          {questions.map((q, qIndex) => (
            <button
              key={qIndex}
              className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-md
                ${
                  activeIndex === qIndex
                    ? "bg-blue-600 text-white scale-105 dark:bg-blue-500"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              onClick={() => setActiveIndex(qIndex)}
            >
              {`Question ${qIndex + 1}`}
            </button>
          ))}
        </div>

        {/* Active Question Card */}
        {questions[activeIndex] && (
          <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/40 dark:border-gray-700/40">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Question {activeIndex + 1} of {questions.length}
              </h2>
              {questions.filter(q => q.rating).length > 0 && (
                <button
                  onClick={handleFinishInterview}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition text-sm"
                >
                  {saving ? 'Saving...' : '💾 Save Progress'}
                </button>
              )}
            </div>

            {/* Question Box */}
            <div className="bg-gray-100/80 dark:bg-gray-700/60 rounded-lg p-6 mb-8 shadow-inner text-gray-800 dark:text-gray-200 leading-relaxed text-base">
              {questions[activeIndex].question}
            </div>

            {/* Answer Section */}
            <QuestionSection
              key={activeIndex}
              question={questions[activeIndex].question}
              expected_answer={questions[activeIndex].expected_answer}
              onComplete={(data) => handleQuestionComplete(activeIndex, data)}
            />
          </div>
        )}

        {/* Finish Interview Button */}
        {activeIndex === questions.length - 1 && (
          <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/40 dark:border-gray-700/40 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎉 Interview Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Save your results to view detailed reports and track your progress
            </p>
            <button
              onClick={handleFinishInterview}
              disabled={saving}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : '✅ Finish & Save Results'}
            </button>
          </div>
        )}
      </div>

      {/* Chatbot with ALL questions */}
      <Chatbot 
        userId={userId}
        inInterview={true}
        currentQuestion={questionText}
        options={[]}
        allQuestions={questions}
      />
    </div>
  );
}

export default MockPage;
