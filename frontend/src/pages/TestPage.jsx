import React, { useState, useEffect } from "react";
import TestServices from "../services/resume";
import { useLocation, useNavigate } from "react-router-dom";
import {RotateCcw} from "lucide-react";
function TestPage() {
  const location = useLocation();

  const { num_questions, difficulty_level, target_companies, interview_type, interview_description } = location.state || { 
    num_questions: 10,
    difficulty_level: "Medium",
    target_companies: "FAANG",
    interview_type: "Technical",
    interview_description: "Software Engineer"
  };
  
  const Navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState(null);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await TestServices.get_questions({
          num_questions,
          difficulty_level,
          target_companies: target_companies || ["FAANG"],
          interview_type: interview_type || "Technical",
          interview_description: interview_description || "Software Engineer",
        });

        if (response && response.questions) {
          setQuestions(response.questions);
        } else {
          setError("No questions received from the server.");
        }
      } catch (e) {
        console.error("Error fetching questions:", e);
        setError("Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [num_questions, difficulty_level, target_companies, interview_type, interview_description]);

  const handleOptionChange = (qIndex, optionIndex) => {
    if (!submitted) {
      setAnswers(prev => ({
        ...prev,
        [qIndex]: optionIndex,
      }));
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, qIndex) => {
      if (answers[qIndex] === q.correct_option) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreEmoji = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 90) return "🎉";
    if (percentage >= 80) return "🎊";
    if (percentage >= 70) return "👏";
    if (percentage >= 60) return "👍";
    return "💪 Keep it up! ";
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-200 to-blue-300 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-200 animate-pulse">
            ⚡ Generating your questions...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Difficulty: <span className="capitalize font-medium">{difficulty_level.toLowerCase()}</span> | 
            Questions: <span className="font-medium">{num_questions}</span>
          </p>
        </div>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-gray-900">
        <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black dark:text-gray-300 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            📝 Knowledge Test
          </h1>
          <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="bg-white dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded-full shadow-sm">
              <span className="capitalize font-medium">{difficulty_level}</span> Level
            </span>
            <span className="bg-white dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded-full shadow-sm">
              {questions.length} Questions
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-gray-900 dark:text-gray-100 rounded-2xl shadow-xl p-8">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-gray-500 dark:text-gray-400">No questions available</p>
            </div>
          ) : (
            <div className="space-y-8">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0 pb-8 last:pb-0">
                  {/* Question */}
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {qIndex + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="ml-12 space-y-3">
                    {q.options.map((option, optionIndex) => {
                      const isSelected = answers[qIndex] === optionIndex;
                      const isCorrect = optionIndex === q.correct_option;
                      const isWrong = submitted && isSelected && !isCorrect;

                      let optionClasses =
                        "flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ";

                      if (submitted) {
                        if (isCorrect) {
                          optionClasses += "bg-green-50 dark:bg-green-900 border-green-400 text-green-800 dark:text-green-200 shadow-sm";
                        } else if (isWrong) {
                          optionClasses += "bg-red-50 dark:bg-red-900 border-red-400 text-red-800 dark:text-red-200 shadow-sm";
                        } else {
                          optionClasses += "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400";
                        }
                      } else {
                        if (isSelected) {
                          optionClasses += "bg-blue-50 dark:bg-blue-900 border-blue-400 text-blue-800 dark:text-blue-200 shadow-sm";
                        } else {
                          optionClasses += "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900";
                        }
                      }

                      return (
                        <label key={optionIndex} className={optionClasses}>
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            value={optionIndex}
                            checked={isSelected}
                            onChange={() => handleOptionChange(qIndex, optionIndex)}
                            disabled={submitted}
                            className="mr-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="flex-grow font-medium">{option}</span>
                          {submitted && isCorrect && (
                            <span className="ml-2 text-green-600 dark:text-green-300">✓</span>
                          )}
                          {submitted && isWrong && (
                            <span className="ml-2 text-red-600 dark:text-red-300">✗</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {submitted && q.explanation && (
                    <div className="ml-12 mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-400 dark:border-blue-600">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong className="text-blue-900 dark:text-blue-100">💡 Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit / Results */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            {!submitted && questions.length > 0 ? (
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    Object.keys(answers).length < questions.length
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  Submit Test {getScoreEmoji()}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {Object.keys(answers).length} of {questions.length} questions answered
                </p>
              </div>
            ) : submitted && (
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-6">
                  <div className="text-6xl mb-4">{getScoreEmoji()}</div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Test Completed!</h2>
                  <p className={`text-2xl font-bold mb-4 ${getScoreColor()}`}>
                    Score: {score} / {questions.length}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        (score / questions.length) * 100 >= 80 ? "bg-green-500" :
                        (score / questions.length) * 100 >= 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${(score / questions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {((score / questions.length) * 100).toFixed(1)}% Correct
                  </p>
                </div>
                
                <button
                  onClick={() => Navigate('/test_setup')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Take Another Test <RotateCcw className="inline-block ml-2 w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPage;
