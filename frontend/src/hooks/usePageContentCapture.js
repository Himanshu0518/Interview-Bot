import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CHATBOT_API = 'http://localhost:8001';

export const usePageContentCapture = (currentQuestion = null, options = []) => {
  const location = useLocation();

  useEffect(() => {
    // Determine page type
    const isTestPage = location.pathname.includes('/test');
    const isMockPage = location.pathname.includes('/mock');
    
    if (!isTestPage && !isMockPage) return;

    // Capture page content
    const capturePageContent = async () => {
      try {
        // Get all text content from the page
        const pageText = document.body.innerText;
        
        // Prepare data to send
        const pageData = {
          question: currentQuestion || extractQuestionFromPage(),
          options: options.length > 0 ? options : extractOptionsFromPage(),
          page_type: isTestPage ? 'MCQ' : 'Mock',
          full_text: pageText.slice(0, 5000), // First 5000 chars
          url: window.location.href
        };

        // Send to backend
        await fetch(`${CHATBOT_API}/update-page-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pageData)
        });
      } catch (error) {
        console.error('Failed to capture page content:', error);
      }
    };

    // Capture immediately and on question change
    capturePageContent();

    // Set up interval to keep content fresh
    const interval = setInterval(capturePageContent, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [location.pathname, currentQuestion, options]);
};

// Helper functions to extract content from DOM
function extractQuestionFromPage() {
  // Try multiple selectors to find question
  const selectors = [
    '[class*="question"]',
    '[id*="question"]',
    'h1', 'h2', 'h3',
    '[class*="prompt"]',
    '[role="heading"]'
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) {
      const text = el.innerText?.trim();
      if (text && text.length > 10 && text.length < 500) {
        // Likely a question
        return text;
      }
    }
  }

  return null;
}

function extractOptionsFromPage() {
  const options = [];
  
  // Try to find option elements
  const selectors = [
    '[class*="option"]',
    '[class*="choice"]',
    'input[type="radio"] + label',
    'button[class*="option"]'
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      const text = el.innerText?.trim();
      if (text && text.length > 0 && text.length < 200) {
        options.push(text);
      }
    });
    
    if (options.length > 0) break;
  }

  return options.slice(0, 6); // Max 6 options
}

export default usePageContentCapture;
