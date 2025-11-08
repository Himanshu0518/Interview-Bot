import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Chatbot.css';

const API_BASE_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8001';

const Chatbot = ({ 
  userId = 'guest', 
  inInterview = false, 
  currentQuestion = null, 
  options = [],
  allQuestions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [interviewParams, setInterviewParams] = useState(null);
  const [lastSentQuestions, setLastSentQuestions] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const onTestPage = location.pathname.includes('/test');
  const onMockPage = location.pathname.includes('/mock');
  const actuallyInInterview = inInterview || onTestPage || onMockPage;

  //  LOAD conversation from sessionStorage on mount
  useEffect(() => {
    try {
      const savedConversation = sessionStorage.getItem(`chatbot_conversation_${userId}`);
      if (savedConversation) {
        const parsed = JSON.parse(savedConversation);
        console.log('📥 Loaded conversation from storage:', parsed);
        
        setMessages(parsed.messages || []);
        setSessionId(parsed.sessionId || null);
        setInterviewParams(parsed.interviewParams || null);
        
        // Show a system message if conversation was restored
        if (parsed.messages && parsed.messages.length > 0) {
          console.log('Conversation restored with', parsed.messages.length, 'messages');
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }, [userId]);

  //  SAVE conversation to sessionStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0 || sessionId || interviewParams) {
      try {
        const conversationData = {
          messages,
          sessionId,
          interviewParams,
          timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(`chatbot_conversation_${userId}`, JSON.stringify(conversationData));
        console.log(' Saved conversation to storage:', messages.length, 'messages');
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
  }, [messages, sessionId, interviewParams, userId]);

  // Send all questions to backend (with race condition fix)
  useEffect(() => {
    if (allQuestions && allQuestions.length > 0 && (onTestPage || onMockPage)) {
      const questionsKey = JSON.stringify(allQuestions);
      if (questionsKey === lastSentQuestions) return;
      
      const sendAllQuestions = async () => {
        try {
          await fetch(`${API_BASE_URL}/update-page-content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: currentQuestion,
              options: options,
              page_type: onTestPage ? 'MCQ' : 'Mock',
              all_questions: allQuestions,
              url: window.location.href
            })
          });
          setLastSentQuestions(questionsKey);
        } catch (error) {
          console.error('Failed to send questions:', error);
        }
      };
      sendAllQuestions();
    }
  }, [allQuestions, currentQuestion, options, onTestPage, onMockPage, lastSentQuestions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          session_id: sessionId,
          message: currentInput,
          in_interview: actuallyInInterview,
          current_question: currentQuestion
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      if (data.session_id) setSessionId(data.session_id);

      if (data.messages && data.messages.length > 0) {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          setMessages(prev => [...prev, lastMessage]);
        }
      }

      if (data.interview_params) {
        console.log(' Received interview params:', data.interview_params);
        setInterviewParams(data.interview_params);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error connecting to chatbot backend.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    // Only clear if NOT in interview mode
    if (actuallyInInterview) {
      // In interview - show confirmation
      if (window.confirm('Are you sure you want to clear the conversation? This will remove all your question discussions.')) {
        sessionStorage.removeItem(`chatbot_conversation_${userId}`);
        console.log('🗑️ Cleared conversation from storage');
        
        setSessionId(null);
        setMessages([]);
        setInterviewParams(null);
      }
    } else {
      // Not in interview - clear directly
      sessionStorage.removeItem(`chatbot_conversation_${userId}`);
      console.log('🗑️ Cleared conversation from storage');
      
      setSessionId(null);
      setMessages([]);
      setInterviewParams(null);
    }
  };

  const launchInterview = () => {
    if (!interviewParams) return;
    
    const format = interviewParams.interview_format?.toLowerCase();
    
    // Always clear setup conversation when launching interview
    console.log('🧹 Clearing setup conversation before launching interview');
    sessionStorage.removeItem(`chatbot_conversation_${userId}`);
    setMessages([]);
    setSessionId(null);
    setInterviewParams(null);
    
    if (format === 'mcq') {
      navigate('/test', { 
        state: {
          num_questions: interviewParams.num_questions || 10,
          difficulty_level: interviewParams.difficulty || 'Medium',
          target_companies: interviewParams.target_companies || '',
          interview_type: interviewParams.interview_type || 'Technical',
          interview_description: interviewParams.job_description || interviewParams.role || ''
        }
      });
    } else if (format === 'mock') {
      navigate('/mock', {
        state: {
          num_questions: interviewParams.num_questions || 5,
          difficulty_level: interviewParams.difficulty || 'Medium',
          interview_type: interviewParams.interview_type || 'Technical',
          job_description: interviewParams.job_description || interviewParams.role || ''
        }
      });
    }
    
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="chatbot-toggle-btn" aria-label="Open chatbot">
        <MessageCircle size={24} />
        <span className="chatbot-badge">AI</span>
        {/* Show indicator if there's a saved conversation */}
        {messages.length > 0 && (
          <span className="chatbot-indicator">{messages.length}</span>
        )}
      </button>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <MessageCircle size={20} />
          <span className="chatbot-title">
            {actuallyInInterview ? ' Interview Helper' : ' Interview Assistant'}
          </span>
          <span className="chatbot-status">● Online</span>
          {allQuestions.length > 0 && (
            <span className="text-xs ml-2 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
              {allQuestions.length} Q's
            </span>
          )}
        </div>
        <div className="chatbot-header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} className="chatbot-icon-btn" title="Minimize">
            <Minimize2 size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} className="chatbot-icon-btn" title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <MessageCircle size={48} className="chatbot-welcome-icon" />
                <h3>Welcome! 👋</h3>
                <p>I can help you with:</p>
                <ul>
                  <li> Setting up interviews</li>
                  <li> Platform questions</li>
                  {actuallyInInterview && allQuestions.length > 0 && (
                    <li>Explaining ANY of the {allQuestions.length} questions</li>
                  )}
                </ul>
                <p className="chatbot-welcome-prompt">
                  {actuallyInInterview && allQuestions.length > 0
                    ? "Ask: 'explain question 3' or 'help with question 5'" 
                    : actuallyInInterview
                    ? "Need help? Just ask!"
                    : "Try: 'I want to start an interview'"}
                </p>
              </div>
            )}

            {/* Show conversation restored indicator */}
            {messages.length > 0 && messages[0].role === 'user' && (
              <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-2 border-b border-gray-200 dark:border-gray-700">
                Conversation restored - {messages.length} messages
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="chatbot-message-content">
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="chatbot-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message assistant">
                <div className="chatbot-message-content">
                  <Loader2 size={16} className="chatbot-loader" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {interviewParams && interviewParams.interview_format && (
              <div className="chatbot-launch-card">
                <div className="chatbot-launch-header">
                  <span> Ready to Launch Interview</span>
                </div>
                <div className="chatbot-launch-params">
                  <div className="chatbot-param"><strong>Format:</strong> {interviewParams.interview_format}</div>
                  <div className="chatbot-param"><strong>Type:</strong> {interviewParams.interview_type}</div>
                  <div className="chatbot-param"><strong>Role:</strong> {interviewParams.role}</div>
                  <div className="chatbot-param"><strong>Difficulty:</strong> {interviewParams.difficulty}</div>
                  <div className="chatbot-param"><strong>Questions:</strong> {interviewParams.num_questions}</div>
                  {interviewParams.target_companies && (
                    <div className="chatbot-param"><strong>Companies:</strong> {interviewParams.target_companies}</div>
                  )}
                </div>
                <button onClick={launchInterview} className="chatbot-launch-btn">
                  Start Interview Now →
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-container">
            <button onClick={startNewChat} className="chatbot-new-chat-btn" title="Clear conversation and start fresh">
              <Trash2 size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={actuallyInInterview ? "Ask about any question..." : "Type your message..."}
              className="chatbot-input"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              className="chatbot-send-btn"
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send size={18} />
            </button>
          </div>

          <div className="chatbot-footer">
            <span>Powered by Gemini AI • {actuallyInInterview ? 'Help Mode' : 'Chat Mode'}</span>
            {messages.length > 0 && (
              <span className="text-xs text-gray-500"> • {messages.length} msgs</span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
