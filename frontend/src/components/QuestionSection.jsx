import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import MockServices from '../services/mock';
import DeepgramDictaphone from './DeepgramDictaphone';
import { Star } from 'lucide-react';

function QuestionSection({ question = "Tell Me about Yourself", expected_answer = "", onComplete = null }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rating, setRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedAns, setImprovedAns] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);

  // Get userId from Redux
  const userData = useSelector((state) => state.auth.userData);
  const userId = userData?.user_id || 'guest';

  const getrating = async (user_answer) => {
    try {
      setIsLoading(true);
      setError(null);

      const ai_feedback = await MockServices.get_rating({
        question,
        expected_answer,
        user_answer
      });

      // Set the rating from the API response
      setRating(ai_feedback.rating);
      setImprovedAns(ai_feedback.better_answer || '');
      setFeedback(ai_feedback.feedback || '');

      // Call onComplete callback if provided
      if (onComplete) {
        onComplete({
          answer: user_answer,
          rating: ai_feedback.rating,
          feedback: ai_feedback.feedback || '',
          better_answer: ai_feedback.better_answer || ''
        });
      }

    } catch (err) {
      console.error('Error getting rating:', err);
      setError(err.message || 'Failed to get rating');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer before submitting!');
      return;
    }
    setIsSubmitted(true);
    await getrating(userAnswer);
  };

  const handleRetry = useCallback(() => {
    setIsSubmitted(false);
    setRating(null);
    setUserAnswer('');
    setImprovedAns('');
    setFeedback('');
    setError(null);
  }, []);

  const getRatingColor = useCallback((rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-600';
  }, []);

  const getRatingText = useCallback((rating) => {
    if (rating >= 4.5) return 'Excellent!';
    else if (rating >= 3.8) return 'Good job!';
    else if (rating >= 2.8) return 'Not bad!';
    else if (rating >= 2) return 'Needs improvement';
    return 'Try again!';
  }, []);

  // Memoized optimized text change handler
  const handleTextChange = useCallback((e) => {
    setUserAnswer(e.target.value);
  }, []);

  // Memoized submit button state
  const isSubmitDisabled = useMemo(() => {
    return userAnswer.trim().length < 10;
  }, [userAnswer]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
      {/* Question Display */}
      {/* <div className="mb-8">
        <h2 className="text-2xl font-bold">Question</h2>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm dark:bg-blue-900 dark:border-blue-700">
          <h1 className="text-lg font-semibold text-gray-800">{question}</h1>
        </div>
      </div> */}

      {/* Answer Input Section */}
      {!isSubmitted && (
        <div className="mb-8 space-y-6">
          <h3 className="text-xl font-semibold">Your Answer</h3>

          {/* Speech Recognition Component - Using Deepgram */}
          <DeepgramDictaphone 
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            isSubmitted={isSubmitted}
          />

          {/* Text Input Alternative */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or type your answer manually:
            </label>
            <textarea
              value={userAnswer}
              onChange={handleTextChange}
              placeholder="Type your answer here..."
              className="w-full h-32 p-4 bg-white border border-gray-300 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         text-gray-900 placeholder-gray-500 resize-none
                         transition-colors duration-200 shadow-sm
                         dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            />
            <div className="mt-2 text-xs text-gray-500">
              Minimum 10 characters required • Current: {userAnswer.length}
            </div>
          </div> 

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full py-3 px-6 rounded-xl font-semibold shadow-sm transition-all duration-200 ${
              isSubmitDisabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white hover:shadow-md active:scale-[0.98]"
            }`}
          >
            Submit Answer
          </button>
        </div>
      )}

      {/* Expected Answer Section */}
      {isSubmitted && (
        <details className="group bg-white border border-gray-200 rounded-xl shadow-sm mb-6 transition-shadow hover:shadow-md dark:bg-gray-300 dark:border-gray-200">
          <summary className="flex items-center justify-between cursor-pointer list-none p-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Expected Answer
            </h3>
            <svg
              className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>

          <div className="px-4 pb-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <p className="text-gray-700 leading-relaxed">{expected_answer}</p>
            </div>
          </div>
        </details>
      )}

      {/* Results Section */}
      {isSubmitted && (
        <div className="space-y-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <p className="text-red-700 font-medium">Error: {error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8 bg-white shadow-sm rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Evaluating your answer...</p>
            </div>
          )}

          {/* Results Display */}
          {!isLoading && !error && rating !== null && (
            <>
              {/* Your Answer */}
              <div>
                <h3 className="text-xl font-semibold  mb-3">Your Answer</h3>
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{userAnswer}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-xl font-semibold  mb-3">Rating</h3>
                <div className="bg-gray-100 p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 flex items-center justify-center gap-2 ${getRatingColor(rating)}`}>
                      {rating}/5
                      <Star className="w-8 h-8 fill-yellow-400 text-yellow-500" />
                    </div>
                    <p className={`text-lg font-medium ${getRatingColor(rating)}`}>
                      {getRatingText(rating)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              {feedback && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <svg
                    className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Note:</span> The rating is only a rough guide — focus on the feedback and explanations rather than the exact score.
                  </p>
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Feedback</h3>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
                  </div>
                </div>
              )}

              {/* Better Answer */}
              {improvedAns && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Improved Answer</h3>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{improvedAns}</p>
                  </div>
                </div>
              )}

              {/* Retry Button */}
              <button
                onClick={handleRetry}
                className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]
                dark"
              >
                Try Another Question
              </button>
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default QuestionSection;