"""
Simple script to manually add website knowledge to chatbot
Run this from: chatbot/backend folder
"""
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("="*60)
print("INDEXING INTERVIEW BOT WEBSITE")
print("="*60)

try:
    print("\n1. Importing modules...")
    from langgraph_agent.knowledge_base import WebsiteKnowledgeBase
    print("   ✅ Modules imported")
    
    print("\n2. Creating knowledge base...")
    kb = WebsiteKnowledgeBase()
    print("   ✅ Knowledge base created")
    
    print("\n3. Starting indexing (this may take 1-2 minutes)...")
    kb.index_website()
    
    print("\n" + "="*60)
    print("✅ SUCCESS! Website indexed successfully!")
    print("="*60)
    
    print("\n4. Testing search...")
    results = kb.search("upload resume", n_results=2)
    if results:
        print(f"   ✅ Found {len(results)} results")
        print(f"   Sample: {results[0]['content'][:100]}...")
    else:
        print("   ⚠️  No results found")
    
except ImportError as e:
    print(f"\n❌ Import Error: {e}")
    print("\nMissing packages! Install with:")
    print("   pip install chromadb sentence-transformers beautifulsoup4 requests")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    
print("\n" + "="*60)
