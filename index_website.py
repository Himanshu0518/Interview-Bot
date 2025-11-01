import sys
sys.path.insert(0, r"C:\Users\Kumar Abhishek\OneDrive\Desktop\Interview-Bot\chatbot\backend")

from langgraph_agent.knowledge_base import WebsiteKnowledgeBase

print("Starting website indexing...")
try:
    kb = WebsiteKnowledgeBase()
    kb.index_website()
    print("\n✅ Indexing complete!")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
