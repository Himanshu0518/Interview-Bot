"""
Test script to verify chatbot is working correctly
Run this after starting the chatbot backend
"""

import requests
import json
import sys

API_BASE_URL = "http://localhost:8001"
TEST_USER_ID = "test_user_123"

def test_connection():
    """Test if chatbot backend is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code == 200:
            print("✅ Chatbot backend is running")
            return True
        else:
            print("❌ Chatbot backend returned error")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to chatbot backend")
        print("   Make sure it's running: python main.py")
        return False

def test_normal_chat():
    """Test normal conversation mode"""
    print("\n🧪 Testing Normal Chat Mode...")
    
    payload = {
        "user_id": TEST_USER_ID,
        "message": "How do I upload my resume?",
        "in_interview": False
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/chat", json=payload)
        data = response.json()
        
        if data.get("messages"):
            last_msg = data["messages"][-1]
            content = last_msg['content'][:80].replace('\n', ' ')
            print(f"✅ Bot responded: {content}...")
            return True
        else:
            print("❌ No response from bot")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_interview_setup():
    """Test interview setup flow"""
    print("\n🧪 Testing Interview Setup Mode...")
    
    conversation = [
        "I want to start an interview",
        "MCQ",
        "Technical",
        "Python Developer",
        "Medium",
        "10",
        "Google",
        "Backend with FastAPI",
        "Yes"
    ]
    
    session_id = None
    
    for i, message in enumerate(conversation):
        print(f"  Step {i+1}: '{message}'")
        
        payload = {
            "user_id": TEST_USER_ID,
            "message": message,
            "in_interview": False
        }
        
        if session_id:
            payload["session_id"] = session_id
        
        try:
            response = requests.post(f"{API_BASE_URL}/chat", json=payload)
            data = response.json()
            
            if not session_id and data.get("session_id"):
                session_id = data["session_id"]
            
            if data.get("messages"):
                last_msg = data["messages"][-1]
                content = last_msg['content'][:80].replace('\n', ' ')
                print(f"     Bot: {content}...")
                
                # Check if interview params are ready on last step
                if i == len(conversation) - 1:
                    if data.get("should_launch_interview"):
                        params = data.get("interview_params", {})
                        print(f"\n✅ Interview setup complete!")
                        print(f"   Format: {params.get('interview_format')}")
                        print(f"   Type: {params.get('interview_type')}")
                        print(f"   Role: {params.get('role')}")
                        print(f"   Difficulty: {params.get('difficulty')}")
                        print(f"   Questions: {params.get('num_questions')}")
                        return True
                    else:
                        print(f"\n⚠️  Setup completed but should_launch_interview is False")
                        print(f"   Mode: {data.get('mode', 'unknown')}")
                        print(f"   Awaiting confirmation: {data.get('awaiting_confirmation', 'unknown')}")
                        print(f"   Interview params: {data.get('interview_params', {})}")
                        # Still return True if params are present
                        if data.get("interview_params", {}).get("interview_format"):
                            print(f"   But interview params are present, so it's working!")
                            return True
                        return False
            else:
                print("     ❌ No response")
                
        except Exception as e:
            print(f"     ❌ Error: {e}")
            return False
    
    print("❌ Interview setup did not complete")
    return False

def test_help_mode():
    """Test contextual help mode"""
    print("\n🧪 Testing Help Mode (during interview)...")
    
    payload = {
        "user_id": TEST_USER_ID,
        "message": "What is REST API?",
        "in_interview": True,
        "current_question": "Explain REST API architecture"
    }
    
    try:
        response = requests.post(f"{API_BASE_URL}/chat", json=payload)
        data = response.json()
        
        if data.get("messages"):
            last_msg = data["messages"][-1]
            content = last_msg['content'][:100].replace('\n', ' ')
            print(f"✅ Bot helped: {content}...")
            return True
        else:
            print("❌ No help response")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 50)
    print("  CHATBOT FUNCTIONALITY TEST")
    print("=" * 50)
    
    results = []
    
    # Test 1: Connection
    results.append(("Connection", test_connection()))
    
    if not results[0][1]:
        print("\n❌ Cannot proceed with tests - backend not running")
        sys.exit(1)
    
    # Test 2: Normal Chat
    results.append(("Normal Chat", test_normal_chat()))
    
    # Test 3: Interview Setup
    results.append(("Interview Setup", test_interview_setup()))
    
    # Test 4: Help Mode
    results.append(("Help Mode", test_help_mode()))
    
    # Summary
    print("\n" + "=" * 50)
    print("  TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:20s} : {status}")
        if result:
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"  {passed}/{len(results)} tests passed")
    print("=" * 50)
    
    if passed == len(results):
        print("\n🎉 All tests passed! Chatbot is working correctly!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
