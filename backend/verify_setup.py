"""
Startup verification script for Interview Bot backend
Run this before starting the server to check configuration
"""

import os
import sys
from dotenv import load_dotenv

def verify_setup():
    print("🔍 Verifying Interview Bot Backend Setup...\n")
    
    # Load environment variables
    load_dotenv()
    
    # Check required environment variables
    required_vars = {
        "GOOGLE_API_KEY": "Google Gemini API Key",
        "MONGODB_URL_KEY": "MongoDB Connection URL",
        "MONGODB_DATABASE_NAME": "MongoDB Database Name",
        "JWT_SECRET_KEY": "JWT Secret Key"
    }
    
    missing_vars = []
    for var, description in required_vars.items():
        value = os.getenv(var)
        if not value:
            print(f"❌ {var} - Missing")
            missing_vars.append(var)
        else:
            # Mask sensitive values
            if "KEY" in var or "SECRET" in var:
                masked = value[:10] + "..." if len(value) > 10 else "***"
                print(f"✅ {var} - Set ({masked})")
            else:
                print(f"✅ {var} - Set ({value})")
    
    print()
    
    if missing_vars:
        print(f"❌ ERROR: Missing {len(missing_vars)} required environment variable(s)")
        print("Please check your .env file")
        return False
    
    # Test MongoDB connection
    print("🔗 Testing MongoDB connection...")
    try:
        import motor.motor_asyncio
        import asyncio
        
        async def test_connection():
            client = motor.motor_asyncio.AsyncIOMotorClient(
                os.getenv("MONGODB_URL_KEY"),
                serverSelectionTimeoutMS=5000
            )
            # Try to get server info
            await client.server_info()
            client.close()
            return True
        
        result = asyncio.run(test_connection())
        if result:
            print("✅ MongoDB connection successful\n")
        else:
            print("❌ MongoDB connection failed\n")
            return False
            
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}\n")
        return False
    
    # Test JWT
    print("🔐 Testing JWT functionality...")
    try:
        import jwt
        from datetime import datetime, timedelta, timezone
        
        secret = os.getenv("JWT_SECRET_KEY")
        test_data = {"sub": "test_user", "exp": datetime.now(timezone.utc) + timedelta(minutes=1)}
        token = jwt.encode(test_data, secret, algorithm="HS256")
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        
        if decoded["sub"] == "test_user":
            print("✅ JWT encoding/decoding works\n")
        else:
            print("❌ JWT test failed\n")
            return False
            
    except Exception as e:
        print(f"❌ JWT test failed: {e}\n")
        return False
    
    # All checks passed
    print("=" * 50)
    print("✅ All checks passed! Backend is ready to start.")
    print("=" * 50)
    print("\nTo start the server, run:")
    print("  uv run uvicorn main:app --reload")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = verify_setup()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Setup verification cancelled")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
