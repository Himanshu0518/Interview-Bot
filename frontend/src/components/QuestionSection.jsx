import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Square, RotateCcw, Star } from "lucide-react";
import MockServices from '../services/mock';

function QuestionSection({ question, expected_answer }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rating, setRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [improvedAns, setImprovedAns] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);

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

    } catch (err) {
      console.error('Error getting rating:', err);
      setError(err.message || 'Failed to get rating');
    } finally {
      setIsLoading(false);
    }
  };

  const Dictaphone = () => {
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
      return <span className="text-red-500">Browser doesn't support speech recognition.</span>;
    }

    const handleStartListening = () => {
      console.log('Start listening...');
      SpeechRecognition.startListening({ continuous: true });
    };

    const handleStopListening = () => {
      SpeechRecognition.stopListening();
      setUserAnswer(transcript);
    };

    const handleReset = () => {
      resetTranscript();
      setUserAnswer('');
    };

    return (
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleStartListening}
            disabled={listening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition ${listening
                ? 'bg-red-500 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            <Mic className="w-5 h-5" />
            {listening ? 'Recording...' : 'Start'}
          </button>

          <button
            onClick={handleStopListening}
            disabled={!listening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition ${!listening
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
          >
            <Square className="w-5 h-5" />
            Stop
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium shadow-md transition"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {listening && (
          <div className="flex items-center gap-2 text-red-600 animate-pulse">
            <Mic className="w-4 h-4" />
            <span>Listening... Speak now!</span>
          </div>
        )}

        {/* Transcript */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Live Transcript:
          </label>
          <div className="min-h-[60px] p-3 bg-white border rounded-md text-gray-800">
            {transcript || "🎤 Your speech will appear here..."}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      alert('Please provide an answer before submitting!');
      return;
    }
    setIsSubmitted(true);
    await getrating(userAnswer);
  };

  const handleRetry = () => {
    setIsSubmitted(false);
    setRating(null);
    setUserAnswer('');
    setImprovedAns('');
    setFeedback('');
    setError(null);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-600';
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent!';
    else if (rating >= 3.8) return 'Good job!';
    else if (rating >= 2.8) return 'Not bad!';
    else if (rating >= 2) return 'Needs improvement';
    return 'Try again!';
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl shadow-xl border">
      {/* Question Display */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Question</h2>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
          <p className="text-lg text-gray-700">{question}</p>
        </div>
      </div>

      {/* Answer Input Section */}
      {!isSubmitted && (
        <div className="mb-8 space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Your Answer</h3>

          <Dictaphone />

          {/* Text Input Alternative */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or type your answer:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition ${userAnswer.trim()
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
              }`}
          >
            Submit Answer
          </button>
        </div>
      )}
      {/* Expected Answer Section */}
 {isSubmitted && (
  <details className="group bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-md">
    <summary className="flex items-center justify-between cursor-pointer list-none">
      <h3 className="text-lg md:text-xl font-semibold text-gray-800">
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

    <div className="mt-3 bg-green-50 p-4 rounded-lg border border-green-200 shadow-inner">
      <p className="text-gray-700 leading-relaxed">{expected_answer}</p>
    </div>
  </details>
)}


      {/* Results Section */}
      {isSubmitted && (
        <div className="space-y-6">
          {/* Error State */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-red-700 font-medium">Error: {error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8 bg-white shadow-md rounded-lg border">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Evaluating your answer...</p>
            </div>
          )}

          {/* Results Display */}
          {!isLoading && !error && rating !== null && (
            <>
              {/* Your Answer */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Your Answer</h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
                  <p className="text-gray-700">{userAnswer}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Rating</h3>
                <div className="bg-white p-6 rounded-lg shadow-md border">
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
       
         {/* note */}
          { feedback && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
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

             ) }

              {/* Expected Answer */}
             

              {/* Feedback */}
              {feedback && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Feedback</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <p className="text-gray-700">{feedback}</p>
                  </div>
                </div>
              )}

              {/* Better Answer */}
              {improvedAns && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Improved Answer</h3>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
                    <p className="text-gray-700">{improvedAns}</p>
                  </div>
                </div>
              )}


              {/* Retry Button */}
              <button
                onClick={handleRetry}
                className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-md transition"
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