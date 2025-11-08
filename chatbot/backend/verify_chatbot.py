"""
Chatbot Backend Setup Verification
Run this before starting the chatbot server
"""

import os
import sys
from dotenv import load_dotenv

def verify_chatbot_setup():
    print(" Verifying Chatbot Backend Setup...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Check required environment variables
    required_vars = {
        "GOOGLE_API_KEY": "Google Gemini API Key",
        "MONGODB_URL": "MongoDB Connection URL",
        "MONGODB_DATABASE_NAME": "MongoDB Database Name",
        "WEBSITE_BASE_URL": "Website Base URL",
        "EMBEDDING_MODEL": "Embedding Model Name"
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            print(f" {var} - Missing")
            missing_vars.append(var)
        else:
            # Mask sensitive values
            if "KEY" in var or "SECRET" in var:
                masked = value[:10] + "..." if len(value) > 10 else "***"
                print(f" {var} - Set ({masked})")
            else:
                print(f" {var} - Set ({value})")
    
    print()
    
    if missing_vars:
        print(f" ERROR: Missing {len(missing_vars)} required environment variable(s)")
        print("Please check your .env file")
        return False
    
    # Test MongoDB connection
    print(" Testing MongoDB connection...")
    try:
        import motor.motor_asyncio
        import asyncio
        
        async def test_connection():
            client = motor.motor_asyncio.AsyncIOMotorClient(
                os.getenv("MONGODB_URL"),
                serverSelectionTimeoutMS=5000,
                tls=True,
                tlsAllowInvalidCertificates=True
            )
            await client.server_info()
            client.close()
            return True
        
        result = asyncio.run(test_connection())
        if result:
            print(" MongoDB connection successful\n")
        else:
            print(" MongoDB connection failed\n")
            return False
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}\n")
        return False
    
    # Test Google Gemini
    print(" Testing Google Gemini API...")
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.7
        )
        
        # Test simple invocation
        response = llm.invoke("Say 'test successful'")
        if "test" in response.content.lower() or "successful" in response.content.lower():
            print(" Google Gemini API working\n")
        else:
            print(" Gemini responded but unexpected content\n")
            
    except Exception as e:
        print(f" Google Gemini API test failed: {e}\n")
        return False
    
    # Test ChromaDB
    print(" Testing ChromaDB...")
    try:
        import chromadb
        from chromadb.config import Settings
        
        client = chromadb.Client(Settings(
            anonymized_telemetry=False
        ))
        print(" ChromaDB initialized\n")
            
    except Exception as e:
        print(f" ChromaDB test failed: {e}\n")
        return False
    
    # Test Sentence Transformers
    print(" Testing Sentence Transformers...")
    try:
        from sentence_transformers import SentenceTransformer
        
        model_name = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
        print(f"Loading model: {model_name}...")
        model = SentenceTransformer(model_name)
        
        # Test embedding
        test_text = "This is a test"
        embedding = model.encode([test_text])
        
        if embedding is not None and len(embedding) > 0:
            print(f" Sentence Transformers working (embedding size: {len(embedding[0])})\n")
        else:
            print(" Embedding generation failed\n")
            return False
            
    except Exception as e:
        print(f" Sentence Transformers test failed: {e}\n")
        print("Note: First run downloads the model, this may take a while...\n")
        return False
    
    # All checks passed
    print("=" * 60)
    print(" All checks passed! Chatbot backend is ready to start.")
    print("=" * 60)
    print("\nTo start the chatbot server, run:")
    print("  python main.py")
    print("\nThe server will run on: http://localhost:8001")
    print("\nAPI Documentation will be available at:")
    print("  http://localhost:8001/docs")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = verify_chatbot_setup()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n Setup verification cancelled")
        sys.exit(1)
    except Exception as e:
        print(f"\n Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
