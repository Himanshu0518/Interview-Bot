# 🚀 Quick Start Guide

## Installation (5 minutes)

```bash
# 1. Navigate to chatbot backend
cd Interview-Bot/chatbot/backend

# 2. Run setup (Windows)
setup.bat

# 3. Start server
python main.py
```

## Integration (2 minutes)

```bash
# 1. Copy chatbot to frontend
cd ../frontend
copy Chatbot.jsx ../../frontend/src/components/
copy Chatbot.css ../../frontend/src/components/

# 2. Edit RootLayout.jsx - Add these lines:
```

```jsx
import Chatbot from '../components/Chatbot';
import { useSelector } from 'react-redux';

// Inside component:
const userId = useSelector(state => state.auth?.userData?.user_id) || 'guest';

// In return:
<Chatbot userId={userId} />
```

## Running Everything

```bash
# Terminal 1: Chatbot Backend
cd chatbot/backend
python main.py

# Terminal 2: Main Backend  
cd backend
uv run uvicorn main:app --reload

# Terminal 3: Frontend
cd frontend
npm run dev
```

## Test It

1. Open http://localhost:5173
2. Click chat button (bottom-right)
3. Try: "I want to start an interview"

## 3 Modes

| Mode | Trigger | Example |
|------|---------|---------|
| **Normal** | General questions | "How do I upload resume?" |
| **Setup** | Interview keywords | "Start interview" |
| **Help** | During interview | "Explain REST API" |

## Key Features

✅ Multi-turn questionnaire  
✅ Website knowledge (RAG)  
✅ Chat history per user  
✅ Interview launch  
✅ Contextual help  

## Files Created

```
chatbot/
├── backend/
│   ├── langgraph_agent/    (AI logic)
│   ├── main.py            (API server)
│   └── database.py        (MongoDB)
├── frontend/
│   ├── Chatbot.jsx        (UI)
│   └── Chatbot.css        (Styles)
└── README.md              (Full docs)
```

## Common Commands

```bash
# Re-index website
python -m langgraph_agent.knowledge_base

# Check API docs
http://localhost:8001/docs

# View logs
# Check terminal running main.py
```

## Environment Variables

Edit `chatbot/backend/.env`:
```
GOOGLE_API_KEY=your_key_here
MONGODB_URL=your_mongodb_url
WEBSITE_BASE_URL=http://localhost:5173
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | `pip install -r requirements.txt` |
| Can't connect | Check backend is running on 8001 |
| No responses | Check GOOGLE_API_KEY in .env |
| CORS error | Verify frontend URL in main.py |

## Next Steps

1. ✅ Install dependencies
2. ✅ Start chatbot backend
3. ✅ Copy files to frontend
4. ✅ Add to RootLayout
5. ✅ Test all 3 modes
6. 🎨 Customize colors/position
7. 📝 Add more pages to index

## Support

- 📖 Full docs: `chatbot/README.md`
- 🔗 Integration: `chatbot/INTEGRATION.md`
- 📊 Summary: `chatbot/SUMMARY.md`

---

**Time to completion: ~10 minutes** ⏱️
