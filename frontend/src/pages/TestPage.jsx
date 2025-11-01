import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Chatbot from "../components/Chatbot";
import TestServices from "../services/resume";
import DashboardServices from "../services/dashboard";
import { Loader2, CheckCircle, XCircle, Clock, Save } from "lucide-react";
import { toast } from "react-toastify";

function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const token = useSelector((state) => state.auth.token);
  const userId = userData?.user_id || "guest";

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get test parameters from navigation state
  const testParams = location.state;



  useEffect(() => {
    // Redirect if no test params
    if (!testParams) {
      navigate("/test_setup");
      return;
    }

    // Fetch questions
    fetchQuestions();

    // Set timer (optional - 2 minutes per question)
    if (testParams.num_questions) {
      setTimeLeft(testParams.num_questions * 120); // 2 minutes per question
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await TestServices.get_questions({
        num_questions: testParams.num_questions,
        difficulty_level: testParams.difficulty_level,
        target_companies: testParams.target_companies,
        interview_type: testParams.interview_type,
        interview_description: testParams.interview_description,
      });

      if (response.questions && response.questions.length > 0) {
        setQuestions(response.questions);
      } else {
        setError("No questions were generated. Please try again.");
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError(err.message || "Failed to fetch questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    if (isSubmitted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_option) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
  };

  const handleSaveResults = async () => {
    try {
      setSaving(true);

      // Calculate score if not already submitted
      let finalScore = score;
      if (!isSubmitted) {
        let correctCount = 0;
        questions.forEach((question, index) => {
          if (selectedAnswers[index] === question.correct_option) {
            correctCount++;
          }
        });
        finalScore = correctCount;
        setScore(finalScore);
      }

      const answeredQuestions = questions.map((q, index) => ({
        question: q.question,
        user_answer: selectedAnswers[index] !== undefined ? q.options[selectedAnswers[index]] : 'Not answered',
        expected_answer: q.options[q.correct_option],
        rating: selectedAnswers[index] === q.correct_option ? 5 : 2,
        feedback: q.explanation,
        better_answer: q.options[q.correct_option]
      }));

      const avgRating = (finalScore / questions.length) * 5;

      const testData = {
        user_id: userId, // Include user_id
        interview_type: testParams.interview_type || 'MCQ',
        difficulty_level: testParams.difficulty_level || 'Medium',
        total_questions: questions.length,
        average_rating: parseFloat(avgRating.toFixed(2)),
        questions_data: answeredQuestions
      };

      console.log('Saving MCQ test:', testData);
      await DashboardServices.saveTestResult(testData);
      toast.success('Test results saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving test:', err);
      toast.error('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = () => {
    navigate("/test_setup");
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Generating your personalized test questions...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            This may take a few seconds
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate("/test_setup")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
          >
            Back to Setup
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  // Results screen
  if (isSubmitted) {
    const percentage = ((score / questions.length) * 100).toFixed(1);
    const passed = percentage >= 60;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              {passed ? (
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              )}
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {passed ? "Congratulations! 🎉" : "Good Effort! 💪"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {passed
                  ? "You've passed the test!"
                  : "Keep practicing to improve your score"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {score}/{questions.length}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Percentage</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {percentage}%
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Correct</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {score}
                </p>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Review Your Answers
              </h2>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct_option;

                return (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-4 ${
                      isCorrect
                        ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                        : "border-red-300 bg-red-50 dark:bg-red-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white mb-2">
                          Q{index + 1}. {question.question}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Your answer:</span>{" "}
                            {userAnswer !== undefined
                              ? question.options[userAnswer]
                              : "Not answered"}
                          </p>
                          {!isCorrect && (
                            <p className="text-green-700 dark:text-green-400">
                              <span className="font-medium">Correct answer:</span>{" "}
                              {question.options[question.correct_option]}
                            </p>
                          )}
                          <p className="text-gray-600 dark:text-gray-400 mt-2 italic">
                            💡 {question.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSaveResults}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Results
                  </>
                )}
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Take Another Test
              </button>
              <button
                onClick={() => navigate("/home")}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {testParams.interview_type} Interview Test
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-800 dark:text-white">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex gap-4">
            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Answer status */}
        <div className="mt-6 flex justify-center gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : selectedAnswers[index] !== undefined
                  ? "bg-green-200 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Chatbot */}
      <Chatbot
        userId={userId}
        inInterview={true}
        currentQuestion={currentQuestion?.question}
        options={currentQuestion?.options}
        allQuestions={questions}
      />
    </div>
  );
}

export default TestPage;
