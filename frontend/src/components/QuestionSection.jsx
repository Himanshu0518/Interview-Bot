import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Square, RotateCcw, Star, AlertCircle, CheckCircle } from "lucide-react";
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
    const [micPermission, setMicPermission] = useState(null);
    const [speechError, setSpeechError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Check environment and permissions on component mount
    useEffect(() => {
      initializeSpeechRecognition();
    }, []);

    // Update transcript to userAnswer when it changes
    useEffect(() => {
      if (transcript && listening === false && transcript.length > userAnswer.length) {
        setUserAnswer(transcript);
      }
    }, [transcript, listening]);

    const initializeSpeechRecognition = async () => {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        setSpeechError('Speech recognition requires a secure connection (HTTPS)');
        return;
      }

      // Check browser support
      if (!browserSupportsSpeechRecognition) {
        setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      await checkMicrophonePermission();
      setIsInitialized(true);
    };

    const checkMicrophonePermission = async () => {
      try {
        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          setMicPermission(permissionStatus.state);
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            setMicPermission(permissionStatus.state);
          };
        } else {
          // Fallback: assume we need to request permission
          setMicPermission('prompt');
        }
      } catch (error) {
        console.log('Permission API not supported or failed:', error);
        setMicPermission('prompt');
      }
    };

    const requestMicrophoneAccess = async () => {
      try {
        setSpeechError(null);
        
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        
        setMicPermission('granted');
        return true;
      } catch (error) {
        console.error('Microphone access error:', error);
        
        if (error.name === 'NotAllowedError') {
          setSpeechError('Microphone access denied. Please click the microphone icon in your browser\'s address bar and allow access.');
          setMicPermission('denied');
        } else if (error.name === 'NotFoundError') {
          setSpeechError('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotSupportedError') {
          setSpeechError('Microphone not supported in this browser or environment.');
        } else {
          setSpeechError(`Microphone error: ${error.message}`);
        }
        
        return false;
      }
    };

    const handleStartListening = async () => {
      setSpeechError(null);
      
      // Double-check browser support
      if (!browserSupportsSpeechRecognition) {
        setSpeechError('Speech recognition not supported');
        return;
      }

      // Check secure context
      if (!window.isSecureContext) {
        setSpeechError('Speech recognition requires HTTPS');
        return;
      }
      
      // Handle permissions
      if (micPermission === 'denied') {
        setSpeechError('Microphone access denied. Please enable microphone permissions in your browser settings.');
        return;
      }
      
      // Request permission if needed
      if (micPermission !== 'granted') {
        const hasAccess = await requestMicrophoneAccess();
        if (!hasAccess) return;
      }

      try {
        // Clear any existing transcript
        resetTranscript();
        
        // Configure and start recognition
        SpeechRecognition.startListening({ 
          continuous: true,
          interimResults: true,
          language: 'en-US'
        });
        
        // Add error handling for speech recognition
        const recognition = SpeechRecognition.getRecognition();
        if (recognition) {
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            handleSpeechError(event.error);
          };
          
          recognition.onend = () => {
            // Auto-restart if we're still supposed to be listening
            if (listening) {
              setTimeout(() => {
                if (listening && !speechError) {
                  SpeechRecognition.startListening({ 
                    continuous: true,
                    interimResults: true,
                    language: 'en-US'
                  });
                }
              }, 100);
            }
          };
        }
        
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setSpeechError('Failed to start speech recognition. Please try again.');
      }
    };

    const handleSpeechError = (errorType) => {
      switch (errorType) {
        case 'not-allowed':
          setSpeechError('Microphone access denied. Please allow microphone access and try again.');
          setMicPermission('denied');
          break;
        case 'no-speech':
          setSpeechError('No speech detected. Please try speaking louder or closer to your microphone.');
          break;
        case 'audio-capture':
          setSpeechError('Microphone not available. Please check your microphone connection.');
          break;
        case 'network':
          setSpeechError('Network error occurred. Please check your internet connection.');
          break;
        case 'service-not-allowed':
          setSpeechError('Speech recognition service not allowed. Please use HTTPS.');
          break;
        default:
          setSpeechError(`Speech recognition error: ${errorType}`);
      }
      
      // Stop listening on error
      SpeechRecognition.stopListening();
    };

    const handleStopListening = () => {
      try {
        SpeechRecognition.stopListening();
        if (transcript) {
          setUserAnswer(transcript);
        }
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    };

    const handleReset = () => {
      try {
        resetTranscript();
        setUserAnswer('');
        setSpeechError(null);
        if (listening) {
          SpeechRecognition.stopListening();
        }
      } catch (error) {
        console.error('Error resetting speech recognition:', error);
      }
    };

    // Show loading state while initializing
    if (!isInitialized) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-blue-700">Initializing speech recognition...</p>
          </div>
        </div>
      );
    }

    // Show error if speech recognition is not supported
    if (!browserSupportsSpeechRecognition) {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Speech Recognition Not Supported</p>
              <p className="text-red-600 text-sm mt-1">
                Please use Chrome, Edge, or Safari browser for speech recognition features.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {window.isSecureContext ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Secure connection</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Requires HTTPS</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {speechError && (
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700 font-medium">Speech Recognition Error</p>
              <p className="text-red-600 text-sm mt-1">{speechError}</p>
              {micPermission === 'denied' && (
                <button
                  onClick={requestMicrophoneAccess}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Request Permission Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Permission Status */}
        {micPermission === 'prompt' && !speechError && (
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-yellow-700">
              <strong>Microphone Permission Required:</strong> Click "Start Recording" to grant microphone access.
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleStartListening}
            disabled={listening || micPermission === 'denied' || !window.isSecureContext}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition ${
              listening
                ? 'bg-red-500 text-white cursor-not-allowed'
                : micPermission === 'denied' || !window.isSecureContext
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Mic className="w-5 h-5" />
            {listening ? 'Recording...' : 'Start Recording'}
          </button>

          <button
            onClick={handleStopListening}
            disabled={!listening}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md transition ${
              !listening
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            <Square className="w-5 h-5" />
            Stop Recording
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium shadow-md transition"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {/* Listening Indicator */}
        {listening && (
          <div className="flex items-center gap-2 text-red-600 animate-pulse bg-red-50 p-3 rounded-lg border border-red-200">
            <Mic className="w-4 h-4" />
            <span className="font-medium">🔴 Recording... Speak clearly into your microphone</span>
          </div>
        )}

        {/* Transcript Display */}
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Live Transcript:
          </label>
          <div className="min-h-[80px] p-3 bg-white border rounded-md text-gray-800 whitespace-pre-wrap">
            {transcript || "🎤 Your speech will appear here as you speak..."}
          </div>
          {transcript && (
            <div className="mt-2 text-xs text-gray-500">
              Words detected: {transcript.split(' ').filter(word => word.length > 0).length}
            </div>
          )}
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
            <summary className="cursor-pointer font-medium">Debug Information</summary>
            <div className="mt-2 space-y-1">
              <p><strong>Permission:</strong> {micPermission || 'unknown'}</p>
              <p><strong>Listening:</strong> {listening.toString()}</p>
              <p><strong>Browser Support:</strong> {browserSupportsSpeechRecognition.toString()}</p>
              <p><strong>Secure Context:</strong> {window.isSecureContext.toString()}</p>
              <p><strong>Protocol:</strong> {window.location.protocol}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
              <p><strong>Speech Recognition Available:</strong> {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window).toString()}</p>
            </div>
          </details>
        )}
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
              Or type your answer manually:
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here or use speech recognition above..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition ${
              userAnswer.trim()
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
        <details className="group bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-md mb-6">
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
                  <p className="text-gray-700 whitespace-pre-wrap">{userAnswer}</p>
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

              {/* Note */}
              {feedback && (
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
              )}

              {/* Feedback */}
              {feedback && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Feedback</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-wrap">{feedback}</p>
                  </div>
                </div>
              )}

              {/* Better Answer */}
              {improvedAns && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Improved Answer</h3>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-wrap">{improvedAns}</p>
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