from langgraph.graph import StateGraph, END
from langgraph_agent.state import ChatState
from langgraph_agent.nodes import (
    intent_detection_node,
    normal_chat_node,
    setup_interview_node,
    contextual_help_node
)

def should_skip_intent_detection(state: ChatState) -> str:
    """Check if we should skip intent detection and go directly to setup"""
    # If we're in setup mode and have a setup_step, stay in setup
    if state.get("mode") == "setup" or state.get("setup_step"):
        return "setup"
    return "intent_detection"

def route_by_mode(state: ChatState) -> str:
    """Route to appropriate node based on mode"""
    mode = state.get("mode", "idle")
    
    if mode == "setup":
        return "setup"
    elif mode == "help":
        return "help"
    elif mode == "normal":
        return "normal"
    else:
        return "end"

def create_chatbot_graph():
    """Create the LangGraph workflow"""
    
    # Initialize the graph
    workflow = StateGraph(ChatState)
    
    # Add nodes
    workflow.add_node("intent_detection", intent_detection_node)
    workflow.add_node("normal", normal_chat_node)
    workflow.add_node("setup", setup_interview_node)
    workflow.add_node("help", contextual_help_node)
    
    # Set entry point with conditional routing
    workflow.set_conditional_entry_point(
        should_skip_intent_detection,
        {
            "intent_detection": "intent_detection",
            "setup": "setup"
        }
    )
    
    # Add conditional edges from intent_detection
    workflow.add_conditional_edges(
        "intent_detection",
        route_by_mode,
        {
            "normal": "normal",
            "setup": "setup",
            "help": "help",
            "end": END
        }
    )
    
    # All nodes lead to END
    workflow.add_edge("normal", END)
    workflow.add_edge("setup", END)
    workflow.add_edge("help", END)
    
    # Compile the graph
    return workflow.compile()

# Create the compiled graph
chatbot_graph = create_chatbot_graph()
