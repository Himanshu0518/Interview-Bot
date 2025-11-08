import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Square, RotateCcw, AlertCircle, CheckCircle, Wifi } from "lucide-react";

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || 'f731354f7b1dc142ffac7d855d1800f731f782c2';

const DeepgramDictaphone = ({ userAnswer, setUserAnswer, isSubmitted }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [micPermission, setMicPermission] = useState('prompt');
  const [isInitializing, setIsInitializing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [debugInfo, setDebugInfo] = useState('');
  
  const websocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setMicPermission(result.state);
        
        result.addEventListener('change', () => {
          setMicPermission(result.state);
        });
      } catch (err) {
        console.log('Permission API not supported:', err);
        setMicPermission('prompt');
      }
    };

    checkMicPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    console.log('Cleaning up Deepgram resources...');
    
    isListeningRef.current = false;
    
    // Close WebSocket
    if (websocketRef.current) {
      if (websocketRef.current.readyState === WebSocket.OPEN) {
        try {
          websocketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
        } catch (e) {
          console.log('Error sending close message:', e);
        }
      }
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.log('Error stopping media recorder:', e);
      }
      mediaRecorderRef.current = null;
    }
    
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setConnectionStatus('disconnected');
  }, []);

  const initializeDeepgram = useCallback(() => {
    return new Promise((resolve, reject) => {
      try {
        setConnectionStatus('connecting');
        setDebugInfo('Connecting to Deepgram...');
        
        // Create WebSocket connection to Deepgram
        const wsUrl = `wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=true&language=en-US&model=nova-2&smart_format=true`;
        
        console.log('Creating WebSocket connection to Deepgram...');
        const ws = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);
        
        ws.onopen = () => {
          console.log(' Deepgram WebSocket connected');
          setConnectionStatus('connected');
          setDebugInfo('Connected to Deepgram');
          setError(null);
          resolve(ws);
        };

        ws.onmessage = (message) => {
          try {
            const data = JSON.parse(message.data);
            console.log(' Received message from Deepgram:', data);
            
            // Check for different message types
            if (data.type === 'Results') {
              const alternatives = data.channel?.alternatives;
              if (alternatives && alternatives.length > 0) {
                const transcript = alternatives[0].transcript;
                const isFinal = data.is_final;
                
                console.log('Transcript:', transcript, '| Final:', isFinal);
                setDebugInfo(`Received: "${transcript}" (${isFinal ? 'final' : 'interim'})`);
                
                if (transcript && transcript.trim() !== '') {
                  if (isFinal) {
                    // Final transcript - append permanently
                    transcriptRef.current += transcript + ' ';
                    setUserAnswer(transcriptRef.current);
                    console.log('Final transcript saved:', transcriptRef.current);
                  } else {
                    // Interim transcript - show temporarily
                    const currentFinal = transcriptRef.current;
                    setUserAnswer(currentFinal + transcript);
                  }
                }
              }
            } else if (data.type === 'Metadata') {
              console.log(' Metadata:', data);
            } else {
              console.log('ℹOther message type:', data.type);
            }
          } catch (err) {
            console.error('Error parsing Deepgram message:', err);
            setDebugInfo('Error parsing message');
          }
        };

        ws.onerror = (error) => {
          console.error(' Deepgram WebSocket error:', error);
          setError('WebSocket connection error. Please check your internet connection.');
          setDebugInfo('WebSocket error');
          setConnectionStatus('disconnected');
          reject(error);
        };

        ws.onclose = (event) => {
          console.log('🔌 Deepgram WebSocket closed:', event.code, event.reason);
          setConnectionStatus('disconnected');
          setDebugInfo(`Connection closed: ${event.code}`);
          
          if (isListeningRef.current && event.code !== 1000) {
            setError('Connection lost. Please try again.');
          }
        };

        websocketRef.current = ws;
        
        // Timeout if connection takes too long
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
      } catch (err) {
        console.error('Failed to initialize Deepgram:', err);
        setError('Failed to connect to speech service. Please try again.');
        setConnectionStatus('disconnected');
        setDebugInfo('Initialization failed');
        reject(err);
      }
    });
  }, [setUserAnswer]);

  const startAudioStream = useCallback(async (ws) => {
    try {
      console.log(' Requesting microphone access...');
      setDebugInfo('Requesting microphone...');
      
      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        }
      });

      streamRef.current = stream;
      setMicPermission('granted');
      console.log(' Microphone access granted');
      setDebugInfo('Microphone access granted');

      // Create MediaRecorder with appropriate mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
        }
      }
      
      console.log('Using mimeType:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 16000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN && isListeningRef.current) {
          console.log(' Sending audio chunk:', event.data.size, 'bytes');
          ws.send(event.data);
          setDebugInfo(`Sending audio: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error(' MediaRecorder error:', event);
        setError('Audio recording error');
        setDebugInfo('Recording error');
      };

      mediaRecorder.onstart = () => {
        console.log(' MediaRecorder started');
        setDebugInfo('Recording started');
      };

      mediaRecorder.onstop = () => {
        console.log(' MediaRecorder stopped');
        setDebugInfo('Recording stopped');
      };

      // Start recording with small time slices for real-time streaming
      mediaRecorder.start(250); // Send data every 250ms
      mediaRecorderRef.current = mediaRecorder;

      console.log(' Audio stream started successfully');
      
    } catch (err) {
      console.error('Failed to start audio stream:', err);
      setDebugInfo('Failed to start audio');
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
        setMicPermission('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError(`Failed to access microphone: ${err.message}`);
      }
      
      throw err;
    }
  }, []);

  const handleStart = useCallback(async () => {
    if (isListening || isSubmitted || isInitializing) {
      return;
    }

    console.log(' Starting Deepgram speech recognition...');
    setError(null);
    setIsInitializing(true);
    setDebugInfo('Initializing...');
    
    try {
      // Initialize Deepgram WebSocket
      const ws = await initializeDeepgram();
      console.log('WebSocket ready, starting audio stream...');
      
      // Start audio stream
      await startAudioStream(ws);
      
      // Set listening state
      isListeningRef.current = true;
      setIsListening(true);
      transcriptRef.current = userAnswer; // Keep existing text
      
      console.log(' Recording started successfully');
      setDebugInfo('Recording... Speak now!');
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(`Failed to start recording: ${err.message}`);
      setDebugInfo('Failed to start');
      cleanup();
    } finally {
      setIsInitializing(false);
    }
  }, [isListening, isSubmitted, isInitializing, initializeDeepgram, startAudioStream, cleanup, userAnswer]);

  const handleStop = useCallback(() => {
    console.log(' Stopping Deepgram speech recognition...');
    
    isListeningRef.current = false;
    setIsListening(false);
    
    // Ensure final transcript is saved
    setUserAnswer(transcriptRef.current);
    setDebugInfo('Stopped');
    
    // Send close message to Deepgram
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      try {
        websocketRef.current.send(JSON.stringify({ type: 'CloseStream' }));
      } catch (e) {
        console.log('Error sending close message:', e);
      }
    }
    
    // Cleanup
    setTimeout(() => {
      cleanup();
    }, 500);
    
  }, [cleanup, setUserAnswer]);

  const handleReset = useCallback(() => {
    console.log(' Resetting...');
    
    if (isListening) {
      handleStop();
    }
    
    transcriptRef.current = '';
    setUserAnswer('');
    setError(null);
    setDebugInfo('');
  }, [isListening, handleStop, setUserAnswer]);

  // Auto-stop when submitted
  useEffect(() => {
    if (isSubmitted && isListening) {
      handleStop();
    }
  }, [isSubmitted, isListening, handleStop]);

  return (
    <div className="space-y-4">
      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-gray-100 p-2 rounded text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          Debug: {debugInfo}
        </div>
      )}

      {/* Connection Status */}
      {connectionStatus === 'connected' && !error && (
        <div className="bg-green-50 p-3 rounded-xl border border-green-200 flex items-center gap-2 dark:bg-green-900/20 dark:border-green-800">
          <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300 text-sm font-medium">Connected to Deepgram</p>
        </div>
      )}

      {connectionStatus === 'connecting' && (
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 flex items-center gap-2 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">Connecting to Deepgram...</p>
        </div>
      )}

      {/* Permission Status */}
      {micPermission === 'granted' && !error && connectionStatus !== 'connecting' && (
        <div className="bg-green-50 p-3 rounded-xl border border-green-200 flex items-center gap-2 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
          <p className="text-green-700 dark:text-green-300 text-sm font-medium">Microphone access granted</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 dark:text-red-400 font-medium">Error</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">You can type your answer manually below.</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleStart}
          disabled={isListening || isSubmitted || isInitializing}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${
            isListening
              ? 'bg-red-500 text-white cursor-not-allowed'
              : isSubmitted || isInitializing
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md active:scale-95'
          }`}
        >
          <Mic className="w-4 h-4" />
          {isInitializing ? 'Initializing...' : isListening ? 'Recording...' : 'Start Recording'}
        </button>

        <button
          onClick={handleStop}
          disabled={!isListening}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all duration-200 ${
            !isListening
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
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
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
              : 'bg-gray-600 hover:bg-gray-700 text-white hover:shadow-md active:scale-95 dark:bg-gray-600 dark:hover:bg-gray-500'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Listening Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <Mic className="w-4 h-4" />
            <span className="font-medium">Recording with Deepgram... Speak clearly into your microphone</span>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Live Transcript (Powered by Deepgram)
          </label>
        </div>
        <div className="p-4">
          <div className="min-h-[100px] text-gray-800 whitespace-pre-wrap dark:text-gray-200">
            {userAnswer || (
              <span className="text-gray-500 dark:text-gray-400 italic">
                Your speech will appear here as you speak...
              </span>
            )}
          </div>
          {userAnswer && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              Words detected: {userAnswer.split(' ').filter(word => word.length > 0).length}
            </div>
          )}
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          💡 <strong>Tip:</strong> This uses Deepgram's advanced AI speech recognition for accurate transcription in real-time.
        </p>
      </div>
    </div>
  );
};

export default DeepgramDictaphone;
