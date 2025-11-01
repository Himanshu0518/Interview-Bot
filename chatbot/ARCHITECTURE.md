# 🏗️ Chatbot Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                          │
│                         (React Frontend)                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Floating Chat Widget (Chatbot.jsx)                    │    │
│  │  • Message display                                      │    │
│  │  • Input textarea                                       │    │
│  │  • Session management                                   │    │
│  │  • Interview launch button                              │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ HTTP POST /chat
                                │ {user_id, message, session_id}
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       CHATBOT BACKEND                            │
│                      (FastAPI + LangGraph)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    main.py (API)                          │  │
│  │  • /chat endpoint                                         │  │
│  │  • Load conversation state                                │  │
│  │  • Invoke LangGraph                                       │  │
│  │  • Save to MongoDB                                        │  │
│  └─────────────────────┬────────────────────────────────────┘  │
│                        │                                         │
│                        ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              LangGraph Workflow (graph.py)                │  │
│  │                                                            │  │
│  │    ┌─────────────────────────────────────────┐           │  │
│  │    │    Intent Detection Node                 │           │  │
│  │    │  • Classify user message                 │           │  │
│  │    │  • Route to appropriate mode             │           │  │
│  │    └──────────┬──────────────────────────────┘           │  │
│  │               │                                            │  │
│  │      ┌────────┴────────┐                                  │  │
│  │      │                 │                 │                │  │
│  │      ▼                 ▼                 ▼                │  │
│  │  ┌────────┐      ┌─────────┐      ┌──────────┐          │  │
│  │  │ Normal │      │  Setup  │      │   Help   │          │  │
│  │  │  Chat  │      │Interview│      │Contextual│          │  │
│  │  │  Node  │      │   Node  │      │   Node   │          │  │
│  │  └───┬────┘      └────┬────┘      └────┬─────┘          │  │
│  │      │                │                 │                │  │
│  │      │                │                 │                │  │
│  │      └────────┬───────┴────────┬────────┘                │  │
│  │               │                │                          │  │
│  │               ▼                ▼                          │  │
│  │      ┌─────────────┐  ┌──────────────┐                  │  │
│  │      │  RAG Search │  │Multi-turn Q&A│                  │  │
│  │      │ (ChromaDB)  │  │  State Mgmt  │                  │  │
│  │      └─────────────┘  └──────────────┘                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Google Gemini LLM (nodes.py)                      │  │
│  │  • Intent classification                                  │  │
│  │  • Response generation                                    │  │
│  │  • Context understanding                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────┬──────────────────────────┬───────────────────┘
                 │                          │
                 ▼                          ▼
    ┌──────────────────────┐    ┌────────────────────────┐
    │   ChromaDB           │    │   MongoDB              │
    │   (Vector Store)     │    │   (Chat History)       │
    │                      │    │                        │
    │  • Website content   │    │  • Messages            │
    │  • Text embeddings   │    │  • Sessions            │
    │  • Semantic search   │    │  • Conversation state  │
    └──────────────────────┘    └────────────────────────┘
```

## Data Flow

### 1. Normal Chat (with RAG)
```
User Message
    ↓
Intent Detection → "normal"
    ↓
Search ChromaDB for relevant content
    ↓
Generate response using context + Gemini
    ↓
Return answer to user
```

### 2. Interview Setup (Multi-turn)
```
User: "Start interview"
    ↓
Intent Detection → "setup"
    ↓
Check current step in state
    ↓
Ask next question in sequence:
  1. Format (MCQ/Mock)
  2. Type (Technical/Behavioral)
  3. Role
  4. Difficulty
  5. Num questions
  6. Companies/Job desc
  7. Confirmation
    ↓
Collect answer → Save to state
    ↓
Move to next step
    ↓
When complete → Return launch params
```

### 3. Contextual Help
```
User in interview asks question
    ↓
Intent Detection → "help"
    ↓
Get current question context
    ↓
Search ChromaDB + use context
    ↓
Generate explanation (no answer)
    ↓
Return helpful response
```

## State Management

```javascript
ChatState {
  messages: [
    {role: "user", content: "...", timestamp: "..."},
    {role: "assistant", content: "...", timestamp: "..."}
  ],
  mode: "normal" | "setup" | "help" | "idle",
  interview_params: {
    interview_format: "MCQ" | "Mock",
    interview_type: "Technical",
    role: "Python Developer",
    difficulty: "Medium",
    num_questions: 10,
    target_companies: "FAANG",
    job_description: "..."
  },
  in_interview: true/false,
  current_question: "What is REST API?",
  user_id: "user123",
  session_id: "session456",
  setup_step: "difficulty",
  awaiting_confirmation: false
}
```

## Technology Stack Layers

```
┌──────────────────────────────────────────────┐
│              Presentation Layer               │
│         React + CSS + Lucide Icons           │
└──────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────┐
│              Application Layer                │
│         FastAPI + RESTful Endpoints          │
└──────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────┐
│            Business Logic Layer               │
│  LangGraph (State Machine) + LangChain       │
└──────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────┐
│              AI/ML Layer                      │
│   Google Gemini + Sentence Transformers      │
└──────────────────────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────┐
│              Data Layer                       │
│   MongoDB (History) + ChromaDB (Vectors)     │
└──────────────────────────────────────────────┘
```

## Component Interactions

```
┌────────────┐
│  Chatbot   │──┐
│   Widget   │  │
└────────────┘  │
                │ Props: userId, inInterview, currentQuestion
                │
                ▼
        API Call: POST /chat
                │
                ▼
┌───────────────────────────────┐
│       FastAPI Server          │
│  • Receive message            │
│  • Load state from MongoDB    │
│  • Call LangGraph             │
│  • Save updated state         │
│  • Return response            │
└───────────────────────────────┘
                │
                ▼
┌───────────────────────────────┐
│        LangGraph              │
│  1. Intent detection          │
│  2. Route to node             │
│  3. Execute node logic        │
│  4. Update state              │
│  5. Return new state          │
└───────────────────────────────┘
                │
                ▼
        Response with:
        • messages[]
        • interview_params
        • should_launch
```

## Database Schema

### MongoDB Collections

**1. ChatHistory**
```javascript
{
  _id: ObjectId,
  user_id: "user123",
  session_id: "session456",
  role: "user" | "assistant",
  content: "message text",
  timestamp: ISOString
}
```

**2. ConversationState**
```javascript
{
  _id: ObjectId,
  user_id: "user123",
  session_id: "session456",
  state: { /* Complete ChatState object */ },
  updated_at: ISOString
}
```

### ChromaDB Collection

**website_content**
```
Documents: ["text chunk 1", "text chunk 2", ...]
Embeddings: [[0.1, 0.2, ...], [0.3, 0.4, ...], ...]
Metadata: [
  {url: "/about", title: "About", page: "/about", chunk_id: 0},
  ...
]
IDs: ["doc_0_0", "doc_0_1", "doc_1_0", ...]
```

## Request/Response Examples

### Example 1: Initial Chat Request
```json
// Request
POST /chat
{
  "user_id": "user123",
  "message": "I want to start an interview",
  "in_interview": false
}

// Response
{
  "session_id": "abc-123",
  "messages": [
    {"role": "user", "content": "I want to start an interview", "timestamp": "..."},
    {"role": "assistant", "content": "Would you like MCQ or Mock?", "timestamp": "..."}
  ],
  "interview_params": {},
  "should_launch_interview": false
}
```

### Example 2: Complete Setup
```json
// Final Request
{
  "user_id": "user123",
  "session_id": "abc-123",
  "message": "Yes"
}

// Response
{
  "session_id": "abc-123",
  "messages": [...],
  "interview_params": {
    "interview_format": "MCQ",
    "interview_type": "Technical",
    "role": "Python Developer",
    "difficulty": "Medium",
    "num_questions": 10,
    "target_companies": "FAANG"
  },
  "should_launch_interview": true
}
```

---

**This architecture ensures:**
- ✅ Scalability
- ✅ Maintainability  
- ✅ Separation of concerns
- ✅ Stateful conversations
- ✅ Intelligent routing
- ✅ Persistent storage
