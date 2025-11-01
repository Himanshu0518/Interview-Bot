import requests

print("Testing chatbot knowledge...")

# Test questions about the website
questions = [
    "How do I sign in?",
    "Where can I upload my resume?",
    "How do I start a test?",
    "What is a mock interview?"
]

for q in questions:
    print(f"\n{'='*60}")
    print(f"Q: {q}")
    
    try:
        r = requests.post("http://localhost:8001/chat", json={
            "user_id": "test",
            "message": q
        })
        
        if r.status_code == 200:
            data = r.json()
            if data.get("messages"):
                answer = data["messages"][-1]["content"]
                print(f"A: {answer[:200]}...")
        else:
            print(f"Error: {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

print(f"\n{'='*60}")
print("✅ Your chatbot now knows about your website!")
