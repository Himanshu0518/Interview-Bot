from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

mongo_uri = os.getenv("MONGODB_URL")
db_name = os.getenv("MONGODB_DATABASE_NAME")

if not mongo_uri or not db_name:
    raise ValueError("❌ Missing environment variables. Check your .env file.")

client = MongoClient(mongo_uri)
db = client[db_name]

print("✅ Connected successfully to database:", db.name)
