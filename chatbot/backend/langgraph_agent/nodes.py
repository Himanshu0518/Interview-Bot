from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph_agent.state import ChatState, ChatMessage
from langgraph_agent.knowledge_base import WebsiteKnowledgeBase
from datetime import datetime
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

# Initialize LLM with correct model name
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.7
)

# Initialize Knowledge Base
kb = WebsiteKnowledgeBase()

def intent_detection_node(state: ChatState) -> ChatState:
    """Detect user intent and route to appropriate mode"""
    
    last_message = state["messages"][-1]["content"].lower()
    in_interview = state.get("in_interview", False)
    
    # Check if already in setup mode and not awaiting confirmation
    current_mode = state.get("mode", "idle")
    if current_mode == "setup" and not state.get("awaiting_confirmation", False):
        return state
    
    # Keywords-based intent detection (more reliable)
    setup_keywords = ["start", "begin", "interview", "test", "mock", "setup", "configure", "create", "new interview", "want to", "need to"]
    help_keywords = ["explain", "what is", "don't understand", "help", "clarify", "tell me about", "how does", "hint", "clue", "question"]
    
    # Check for setup intent
    if in_interview and any(keyword in last_message for keyword in help_keywords):
        state["mode"] = "help"
    elif any(keyword in last_message for keyword in setup_keywords):
        state["mode"] = "setup"
    else:
        state["mode"] = "normal"
    
    return state


def normal_chat_node(state: ChatState) -> ChatState:
    """Handle normal conversation with RAG and conversation history"""
    
    last_message = state["messages"][-1]["content"]
    
    # Get conversation history (last 5 messages for context)
    conversation_history = ""
    if len(state["messages"]) > 1:
        recent_messages = state["messages"][-6:-1]  # Get last 5 messages before current
        for msg in recent_messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            conversation_history += f"{role}: {msg['content']}\n"
    
    # Search knowledge base
    search_results = kb.search(last_message, n_results=3)
    
    # Build context from search results
    context = ""
    if search_results:
        context = "\n\n".join([
            f"From {result['metadata'].get('title', 'page')}: {result['content'][:300]}"
            for result in search_results
        ])
    
    # Generate response with conversation history
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful AI assistant for the Interview Bot platform. 
        Answer the user's question using the provided context from the website and conversation history.
        
        Previous Conversation:
        {conversation_history}
        
        Website Context:
        {context}
        
        Important:
        - Use the conversation history to understand context and refer to previous messages
        - If the user refers to something mentioned earlier, use that information
        - Be friendly, concise, and helpful
        - If the context doesn't contain relevant information, use your general knowledge about interview preparation platforms"""),
        ("user", "{message}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({
        "message": last_message,
        "context": context or "No specific context found.",
        "conversation_history": conversation_history or "No previous conversation."
    })
    
    # Add assistant message to state
    state["messages"].append({
        "role": "assistant",
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    })
    
    state["mode"] = "idle"
    return state


def setup_interview_node(state: ChatState) -> ChatState:
    """Handle multi-turn interview setup questionnaire"""
    
    # ALWAYS work with _temp_params during setup
    params = state.get("_temp_params", {})
    current_step = state.get("setup_step")
    last_message = state["messages"][-1]["content"].strip()
    
    print(f"\n setup_interview_node called:")
    print(f"   Current step: {current_step}")
    print(f"   Loaded params from _temp_params: {params}")
    print(f"   User message: {last_message}")
    
    # Define setup flow - FIXED ORDER
    base_steps = [
        ("interview_format", "Would you like to take an **MCQ Test** or a **Mock Interview**? Please reply with 'MCQ' or 'Mock'."),
        ("interview_type", "What type of interview?\n\nOptions:\n• Technical\n• Behavioral\n• Case Study\n• Coding\n• Aptitude\n• Reasoning\n\nPlease choose one:"),
        ("role", "What role/position are you preparing for?\n\n(e.g., Software Engineer, Data Analyst, Product Manager)"),
        ("difficulty", "What difficulty level?\n\nOptions:\n• Easy\n• Medium\n• Hard\n\nPlease choose one:"),
        ("num_questions", "How many questions would you like?\n\n(e.g., 5, 10, 15, 20)"),
    ]
    
    # Start setup if not started
    if not current_step:
        state["setup_step"] = "interview_format"
        state["_temp_params"] = {}
        state["interview_params"] = {}  # Clear any old params
        state["mode"] = "setup"
        state["messages"].append({
            "role": "assistant",
            "content": " **Let's set up your interview!**\n\n" + base_steps[0][1],
            "timestamp": datetime.now().isoformat()
        })
        return state
    
    # Validation and processing
    if current_step == "interview_format":
        format_clean = last_message.lower()
        if "mcq" in format_clean or "test" in format_clean:
            params["interview_format"] = "MCQ"
            state["setup_step"] = "interview_type"
        elif "mock" in format_clean or "interview" in format_clean:
            params["interview_format"] = "Mock"
            state["setup_step"] = "interview_type"
        else:
            state["messages"].append({
                "role": "assistant",
                "content": " Please choose either 'MCQ' or 'Mock'.",
                "timestamp": datetime.now().isoformat()
            })
            return state
    
    elif current_step == "interview_type":
        types = ["technical", "behavioral", "case study", "coding", "aptitude", "reasoning"]
        type_found = None
        for t in types:
            if t in last_message.lower():
                type_found = t.title()
                break
        
        if type_found:
            params["interview_type"] = type_found
            state["setup_step"] = "role"
        else:
            state["messages"].append({
                "role": "assistant",
                "content": " Please choose a valid interview type: Technical, Behavioral, Case Study, Coding, Aptitude, or Reasoning.",
                "timestamp": datetime.now().isoformat()
            })
            return state
    
    elif current_step == "role":
        if len(last_message) > 2:
            params["role"] = last_message
            state["setup_step"] = "difficulty"
        else:
            state["messages"].append({
                "role": "assistant",
                "content": " Please enter a valid role name.",
                "timestamp": datetime.now().isoformat()
            })
            return state
    
    elif current_step == "difficulty":
        diff = last_message.lower()
        if "easy" in diff:
            params["difficulty"] = "Easy"
            state["setup_step"] = "num_questions"
        elif "medium" in diff:
            params["difficulty"] = "Medium"
            state["setup_step"] = "num_questions"
        elif "hard" in diff:
            params["difficulty"] = "Hard"
            state["setup_step"] = "num_questions"
        else:
            state["messages"].append({
                "role": "assistant",
                "content": " Please choose: Easy, Medium, or Hard.",
                "timestamp": datetime.now().isoformat()
            })
            return state
    
    elif current_step == "num_questions":
        try:
            num = int(re.search(r'\d+', last_message).group())
            if 1 <= num <= 50:
                params["num_questions"] = num
                # Branch based on format
                if params.get("interview_format") == "MCQ":
                    state["setup_step"] = "target_companies"
                else:
                    state["setup_step"] = "job_description"
            else:
                raise ValueError
        except:
            state["messages"].append({
                "role": "assistant",
                "content": " Please enter a valid number between 1 and 50.",
                "timestamp": datetime.now().isoformat()
            })
            return state
    
    elif current_step == "target_companies":
        params["target_companies"] = last_message
        state["setup_step"] = "job_description"
    
    elif current_step == "job_description":
        params["job_description"] = last_message
        state["setup_step"] = "confirmation"
        state["awaiting_confirmation"] = True
    
    elif current_step == "confirmation":
        if last_message.lower() in ["yes", "y", "start", "go", "confirm", "proceed", "ok"]:
            # CRITICAL: Transfer params from temp to interview_params BEFORE changing state
            state["interview_params"] = params.copy()  # Copy the complete params
            state["awaiting_confirmation"] = False
            state["mode"] = "idle"
            state["setup_step"] = None
            state["_temp_params"] = {}  # Clear temp
            
            # DEBUG LOG
            print("="  * 60)
            print(" INTERVIEW SETUP COMPLETE!")
            print(f"Mode: {state['mode']}")
            print(f"Awaiting confirmation: {state.get('awaiting_confirmation')}")
            print(f"Setup step: {state.get('setup_step')}")
            print(f"interview_params: {json.dumps(state.get('interview_params', {}), indent=2)}")
            print("=" * 60)
            
            state["messages"].append({
                "role": "assistant",
                "content": f" **Perfect!** Launching your {state['interview_params'].get('interview_format', 'interview')}...\n\n" + 
                          "**Click the 'Start Interview' button below to begin!** 🚀",
                "timestamp": datetime.now().isoformat()
            })
            return state
        elif last_message.lower() in ["no", "n", "cancel", "restart"]:
            state["setup_step"] = None
            state["interview_params"] = {}
            state["_temp_params"] = {}
            state["mode"] = "idle"
            state["awaiting_confirmation"] = False
            state["messages"].append({
                "role": "assistant",
                "content": "No problem! Let me know when you'd like to start again. ",
                "timestamp": datetime.now().isoformat()
            })
            return state
        else:
            state["messages"].append({
                "role": "assistant",
                "content": " Please reply with 'Yes' to confirm or 'No' to cancel.",
                "timestamp": datetime.now().isoformat()
            })
            return state
    
    # CRITICAL: Always save params back to state after each step
    # This ensures data persists across function calls
    state["_temp_params"] = params
    print(f" Saving to _temp_params at step '{state.get('setup_step')}': {params}")
    
    # IMPORTANT: Only move to interview_params after confirmation
    # This prevents the launch button from appearing too early
    if state["setup_step"] == "confirmation":
        # At confirmation stage, also update interview_params for display
        state["interview_params"] = params.copy()
        print(f"Also copying to interview_params: {state['interview_params']}")
    
    # Move to next step and ask next question
    if state["setup_step"] == "confirmation":
        params_text = "\n".join([f"• **{k.replace('_', ' ').title()}**: {v}" for k, v in params.items()])
        message = f" **Great! Let me confirm your setup:**\n\n{params_text}\n\n**Ready to start?** (Reply with 'Yes' or 'No')"
    elif state["setup_step"] == "target_companies":
        message = " **Which companies are you targeting?**\n\n(e.g., FAANG, Google, Microsoft, Amazon)"
    elif state["setup_step"] == "job_description":
        if params.get("interview_format") == "Mock":
            message = " **Please paste the full job description here:**"
        else:
            message = " **Brief job description or key skills to focus on?**\n\n(e.g., Backend development with Django and APIs)"
    else:
        # Find next step in base_steps
        step_names = [s[0] for s in base_steps]
        if state["setup_step"] in step_names:
            idx = step_names.index(state["setup_step"])
            message = base_steps[idx][1]
        else:
            message = "Please continue..."
    
    state["messages"].append({
        "role": "assistant",
        "content": message,
        "timestamp": datetime.now().isoformat()
    })
    
    return state


def contextual_help_node(state: ChatState) -> ChatState:
    """Provide help during interview with access to ALL questions and conversation history"""
    
    last_message = state["messages"][-1]["content"]
    
    # Get conversation history (last 3 messages for context)
    conversation_history = ""
    if len(state["messages"]) > 1:
        recent_messages = state["messages"][-4:-1]  # Get last 3 messages before current
        for msg in recent_messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            conversation_history += f"{role}: {msg['content']}\n"
    
    # Get ALL questions from state
    all_questions = state.get("all_questions", [])
    
    # Extract question number from message if mentioned
    question_number = None
    # FIXED: More robust pattern matching for question numbers
    question_match = re.search(r'\b(?:question|q)\s*#?\s*(\d+)\b', last_message.lower())
    if question_match:
        question_number = int(question_match.group(1)) - 1  # Convert to 0-indexed
    
    # Build context with all questions or specific question
    if all_questions:
        if question_number is not None and 0 <= question_number < len(all_questions):
            # User asked about specific question
            q = all_questions[question_number]
            context_info = f"**Question {question_number + 1}:** {q.get('question', '')}\n"
            if q.get('options'):
                formatted_options = [f"{chr(65+i)}) {opt}" for i, opt in enumerate(q['options'])]
                context_info += "\nOptions:\n" + "\n".join(formatted_options)
            context_info += f"\n\n_This is question {question_number + 1} out of {len(all_questions)} total questions._"
        else:
            # Show all questions for context
            context_info = f"**All Questions on This Page ({len(all_questions)} total):**\n\n"
            for idx, q in enumerate(all_questions):
                context_info += f"**Q{idx + 1}:** {q.get('question', '')[:100]}...\n"
                if q.get('options'):
                    formatted_options = [f"{chr(65+i)}) {opt[:50]}..." for i, opt in enumerate(q['options'][:2])]
                    context_info += "   " + " | ".join(formatted_options) + "\n"
                context_info += "\n"
            context_info += "\n_You can ask about any specific question by number (e.g., 'explain question 3')_"
    else:
        # Fallback to single current question
        current_question = state.get("current_question", "")
        if current_question:
            context_info = f"Current Question: {current_question}"
        else:
            context_info = "No question context available"
    
    # Search knowledge base for additional explanations
    search_results = kb.search(last_message, n_results=2)
    
    additional_context = ""
    if search_results:
        additional_context = "\n".join([result['content'][:300] for result in search_results])
    
    # Generate helpful response with conversation history
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a helpful tutor assisting a student during an interview/test.
        
        PREVIOUS CONVERSATION:
        {conversation_history}
        
        QUESTIONS AVAILABLE ON THIS PAGE:
        {question_context}
        
        Additional Knowledge:
        {additional_context}
        
        CRITICAL INSTRUCTIONS:
        1. You have access to ALL questions on the page - answer about ANY question they ask about
        2. Use the conversation history to understand what they've asked before
        3. If they refer to "the previous question" or "what I asked earlier", use the conversation history
        4. If they ask about "question 2" or "question 5", focus on that specific question
        5. Provide hints and explanations WITHOUT giving the direct answer
        6. Explain concepts, guide reasoning, use analogies
        7. If they ask about an option, explain the concept without revealing which is correct
        8. You can reference other questions if it helps explain a concept
        9. Be conversational and remember what you've explained before
        
        DO NOT:
        - Give the direct answer or tell them which option is correct
        - Say "I don't have access" - you have ALL the questions
        - Solve the problem completely for them
        - Ignore the conversation history
        """),
        ("user", "{message}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({
        "message": last_message,
        "question_context": context_info,
        "additional_context": additional_context or "No additional context available",
        "conversation_history": conversation_history or "No previous conversation."
    })
    
    # Format response
    formatted_response = " **Here's a hint:**\n\n" + response.content
    
    if all_questions:
        formatted_response += f"\n\n_ I have access to all {len(all_questions)} questions. Ask about any specific question by number!_"
    
    state["messages"].append({
        "role": "assistant",
        "content": formatted_response,
        "timestamp": datetime.now().isoformat()
    })
    
    state["mode"] = "idle"
    return state
