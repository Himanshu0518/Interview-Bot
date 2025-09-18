import React from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Square, RotateCcw, Star, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect, useCallback } from 'react';

const Dictaphone = React.memo(({ userAnswer, setUserAnswer, isSubmitted }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [micPermission, setMicPermission] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check environment and permissions on component mount
  useEffect(() => {
    let mounted = true;
    
    const initializeSpeechRecognition = async () => {
      // Check if we're in a secure context
      if (!window.isSecureContext) {
        if (mounted) setSpeechError('Speech recognition requires a secure connection (HTTPS)');
        return;
      }

      // Check browser support
      if (!browserSupportsSpeechRecognition) {
        if (mounted) setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      await checkMicrophonePermission();
      if (mounted) setIsInitialized(true);
    };

    const checkMicrophonePermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
          if (mounted) setMicPermission(permissionStatus.state);
          
          permissionStatus.onchange = () => {
            if (mounted) setMicPermission(permissionStatus.state);
          };
        } else {
          if (mounted) setMicPermission('prompt');
        }
      } catch (error) {
        console.log('Permission API not supported or failed:', error);
        if (mounted) setMicPermission('prompt');
      }
    };

    initializeSpeechRecognition();

    return () => {
      mounted = false;
    };
  }, [browserSupportsSpeechRecognition]);

  // Update transcript to userAnswer when it changes - optimized to prevent flicker
  useEffect(() => {
    if (transcript && !listening && transcript.length > userAnswer.length) {
      setUserAnswer(prev => transcript.length > prev.length ? transcript : prev);
    }
  }, [transcript, listening, setUserAnswer, userAnswer.length]);

  const requestMicrophoneAccess = useCallback(async () => {
    try {
      setSpeechError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      return true;
    } catch (error) {
      setSpeechError(`Microphone error: ${error.message}`);        
      return false;
    }
  }, []);

  const handleStartListening = useCallback(async () => {
    if (isSubmitted) return;
    
    setSpeechError(null);
    
    if (!browserSupportsSpeechRecognition) {
      setSpeechError('Speech recognition not supported');
      return;
    }

    if (!window.isSecureContext) {
      setSpeechError('Speech recognition requires HTTPS');
      return;
    }
    
    if (micPermission === 'denied') {
      setSpeechError('Microphone access denied. Please enable microphone permissions in your browser settings.');
      return;
    }
    
    if (micPermission !== 'granted') {
      const hasAccess = await requestMicrophoneAccess();
      if (!hasAccess) return;
    }

    try {
      resetTranscript();
      
      SpeechRecognition.startListening({ 
        continuous: true,
        interimResults: true,
        language: 'en-US'
      });
      
      const recognition = SpeechRecognition.getRecognition();
      if (recognition) {
        recognition.onerror = (event) => {
          setSpeechError(event.error);
          setMicPermission('denied');
          SpeechRecognition.stopListening();
        };
        
        recognition.onend = () => {
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
  }, [browserSupportsSpeechRecognition, micPermission, listening, speechError, resetTranscript, requestMicrophoneAccess, isSubmitted]);

  const handleStopListening = useCallback(() => {
    try {
      SpeechRecognition.stopListening();
      if (transcript) {
        setUserAnswer(transcript);
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [transcript, setUserAnswer]);

  const handleReset = useCallback(() => {
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
  }, [resetTranscript, setUserAnswer, listening]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <p className="text-blue-700">Initializing speech recognition...</p>
      </div>
    );
  }

  // Show error if speech recognition is not supported
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-red-700 font-medium">Speech Recognition Not Supported</p>
          <p className="text-red-600 text-sm mt-1">
            Please use Chrome, Edge, or Safari browser for speech recognition features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {speechError && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Speech Recognition Error</p>
            <p className="text-red-600 text-sm mt-1">{speechError}</p>
            <p className="text-red-600 text-sm mt-1">Please type your answer manually if speech recognition fails.</p>
            {micPermission === 'denied' && (
              <button
                onClick={requestMicrophoneAccess}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                Request Permission Again
              </button>
              
            )}
          </div>
        </div>
      )}

      {/* Permission Status */}
      {micPermission === 'prompt' && !speechError && (
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <p className="text-amber-700">
            <strong>Microphone Permission Required:</strong> Click "Start Recording" to grant microphone access.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleStartListening}
          disabled={listening || micPermission === 'denied' || !window.isSecureContext || isSubmitted}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${
            listening
              ? 'bg-red-500 text-white cursor-not-allowed'
              : micPermission === 'denied' || !window.isSecureContext || isSubmitted
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md active:scale-95'
          }`}
        >
          <Mic className="w-4 h-4" />
          {listening ? 'Recording...' : 'Start Recording'}
        </button>

        <button
          onClick={handleStopListening}
          disabled={!listening}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${
            !listening
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 text-white hover:shadow-md active:scale-95'
          }`}
        >
          <Square className="w-4 h-4" />
          Stop Recording
        </button>

        <button
          onClick={handleReset}
          disabled={isSubmitted}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${
            isSubmitted
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700 text-white hover:shadow-md active:scale-95'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Listening Indicator */}
      {listening && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <Mic className="w-4 h-4" />
            <span className="font-medium">Recording... Speak clearly into your microphone</span>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-white">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200  dark:bg-gray-700 dark:border-gray-600 ">
          <label className="text-sm font-medium text-gray-700 dark:text-white">
            Live Transcript
          </label>
        </div>
        <div className="p-4">
          <div className="min-h-[100px] text-gray-800 whitespace-pre-wrap">
            {transcript || (
              <span className="text-gray-500 italic">
                 Your speech will appear here as you speak...
              </span>
            )}
          </div>
          {transcript && (
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              Words detected: {transcript.split(' ').filter(word => word.length > 0).length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Dictaphone.displayName = 'Dictaphone';

export default Dictaphone;
