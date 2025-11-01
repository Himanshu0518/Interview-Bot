# Interview Bot - AI Chatbot with LangGraph

An intelligent chatbot powered by Google Gemini and LangGraph that helps students with interview preparation.

## Features

✨ **Three Conversation Modes:**
1. **Normal Chat** - Answer questions about the platform using RAG (Retrieval Augmented Generation)
2. **Interview Setup** - Interactive multi-turn questionnaire to configure interviews
3. **Contextual Help** - Provide explanations during interviews

🤖 **AI Capabilities:**
- Natural language understanding with Google Gemini
- Website content indexing for accurate answers
- Stateful conversations with LangGraph
- Smart mode detection and routing

💾 **Persistent Storage:**
- Chat history saved per user in MongoDB
- Conversation state management
- Session management

## Tech Stack

**Backend:**
- FastAPI
- LangGraph (conversation flow)
- LangChain (LLM integration)
- Google Gemini API
- ChromaDB (vector database)
- MongoDB (chat history)

**Frontend:**
- React
- CSS (custom styling)

## Setup Instructions

### 1. Backend Setup

```bash
cd chatbot/backend

# Install dependencies
pip install -r requirements.txt

# Copy and configure .env file
cp .env.example .env
# Edit .env and add your Google API key if different

# Index your website content (one-time)
python -m langgraph_agent.knowledge_base

# Start the backend server
python main.py
# Server will run on http://localhost:8001
```

### 2. Frontend Integration

Copy the chatbot component to your main React app:

```bash
# Copy Chatbot component
cp chatbot/frontend/Chatbot.jsx ../frontend/src/components/
cp chatbot/frontend/Chatbot.css ../frontend/src/components/
```

### 3. Add Chatbot to Your App

Edit your main layout or app component:

```jsx
// In your frontend/src/layout/RootLayout.jsx or similar
import Chatbot from '../components/Chatbot';
import { useSelector } from 'react-redux';

function RootLayout() {
  const userData = useSelector((state) => state.auth.userData);
  const userId = userData?.user_id || 'guest';
  
  return (
    <div>
      {/* Your existing layout */}
      <Outlet />
      
      {/* Add Chatbot Widget */}
      <Chatbot userId={userId} />
    </div>
  );
}
```

### 4. Usage in Interview Pages

For contextual help during interviews:

```jsx
// In your TestPage.jsx or MockPage.jsx
import Chatbot from '../components/Chatbot';

function TestPage() {
  const [currentQuestion, setCurrentQuestion] = useState('');
  
  return (
    <div>
      {/* Your test UI */}
      
      {/* Chatbot with interview context */}
      <Chatbot 
        userId={userId}
        inInterview={true}
        currentQuestion={currentQuestion}
      />
    </div>
  );
}
```

## Environment Variables

Create `.env` file in `chatbot/backend/`:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
MONGODB_URL=mongodb+srv://...
MONGODB_DATABASE_NAME=InterviewBot
WEBSITE_BASE_URL=http://localhost:5173
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

## API Endpoints

### Chat
```
POST /chat
Body: {
  "user_id": "string",
  "session_id": "string" (optional),
  "message": "string",
  "in_interview": boolean,
  "current_question": "string" (optional)
}
```

### Get Sessions
```
GET /sessions/{user_id}
```

### Get Chat History
```
GET /history/{user_id}/{session_id}
```

### Delete Session
```
DELETE /session/{user_id}/{session_id}
```

### Index Website
```
POST /index-website
```

## How It Works

### 1. Normal Conversation
```
User: "How do I upload my resume?"
↓
Bot searches indexed website content (RAG)
↓
Bot: "To upload your resume, go to the 'Upload Resume' page..."
```

### 2. Interview Setup (Multi-turn)
```
User: "I want to start an interview"
↓
Bot: "Would you like MCQ or Mock interview?"
User: "MCQ"
↓
Bot: "What type? (Technical/Behavioral/etc.)"
User: "Technical"
↓
Bot: "What role?"
User: "Python Developer"
↓
... (continues asking questions)
↓
Bot: "Ready to start?"
User: "Yes"
↓
Bot launches interview with collected parameters
```

### 3. Contextual Help
```
User is in an interview with a question about "What is REST API?"
User asks in chat: "Can you explain REST API?"
↓
Bot searches knowledge base + uses interview context
↓
Bot: "REST API stands for... [explanation without giving answer]"
```

## Project Structure

```
chatbot/
├── backend/
│   ├── langgraph_agent/
│   │   ├── __init__.py
│   │   ├── state.py          # State definitions
│   │   ├── nodes.py          # LangGraph nodes
│   │   ├── graph.py          # LangGraph workflow
│   │   └── knowledge_base.py # RAG implementation
│   ├── database.py           # MongoDB connection
│   ├── main.py              # FastAPI app
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── Chatbot.jsx          # React component
│   └── Chatbot.css          # Styles
└── README.md
```

## Customization

### Adding More Website Pages to Index

Edit `langgraph_agent/knowledge_base.py`:

```python
pages = [
    "/",
    "/home",
    "/about",
    "/your-new-page",  # Add here
    # ... more pages
]
```

Then re-run indexing:
```bash
python -m langgraph_agent.knowledge_base
```

### Modifying Interview Setup Questions

Edit `langgraph_agent/nodes.py` in the `setup_interview_node` function:

```python
setup_steps = [
    ("your_param", "Your question here?"),
    # Add more steps
]
```

### Changing LLM Model

Edit `langgraph_agent/nodes.py`:

```python
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",  # Change model here
    temperature=0.7
)
```

## Troubleshooting

### 1. "No module named 'langgraph'"
```bash
pip install langgraph langchain langchain-google-genai
```

### 2. "ChromaDB collection error"
```bash
# Delete and recreate
rm -rf chroma_db/
python -m langgraph_agent.knowledge_base
```

### 3. "MongoDB connection failed"
Check your MONGODB_URL in .env file

### 4. "Website indexing fails"
Make sure your frontend is running on the WEBSITE_BASE_URL

### 5. Frontend can't connect to backend
Check CORS settings in main.py and ensure backend is running on port 8001

## Running Both Servers

**Terminal 1 - Backend:**
```bash
cd chatbot/backend
python main.py
```

**Terminal 2 - Main App Backend:**
```bash
cd backend
uv run uvicorn main:app --reload
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Features to Add (Future)

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Export chat history
- [ ] Chat suggestions/quick replies
- [ ] Typing indicators
- [ ] File upload in chat
- [ ] Code syntax highlighting
- [ ] Interview performance analytics from chat

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License

## Credits

- Built with ❤️ for Interview Bot
- Powered by Google Gemini AI
- LangGraph for conversation flow
- ChromaDB for knowledge base

---

**Need Help?** Open an issue or contact the development team.
