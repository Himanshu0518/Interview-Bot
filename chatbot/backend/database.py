from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()


class ChatHistoryDB:
    """MongoDB connection for storing chat history"""

    def __init__(self):
        mongo_uri = os.getenv("MONGODB_URL")
        db_name = os.getenv("MONGODB_DATABASE_NAME", "InterviewBot")

        #  Add SSL fix (tls=True, tlsAllowInvalidCertificates=True)
        self.client = AsyncIOMotorClient(
            mongo_uri,
            tls=True,
            tlsAllowInvalidCertificates=False,  # Set to True only for development
            maxPoolSize=50,
            minPoolSize=10,
            maxIdleTimeMS=45000,
            waitQueueTimeoutMS=10000,
            connectTimeoutMS=30000,
            serverSelectionTimeoutMS=30000
        )

        self.db = self.client[db_name]
        self.chat_collection = self.db["ChatHistory"]

    async def save_message(self, user_id: str, session_id: str, role: str, content: str):
        """Save a single message to chat history"""
        message = {
            "user_id": user_id,
            "session_id": session_id,
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        }
        await self.chat_collection.insert_one(message)

    async def get_chat_history(self, user_id: str, session_id: str, limit: int = 50) -> List[Dict]:
        """Retrieve chat history for a user session"""
        cursor = self.chat_collection.find(
            {"user_id": user_id, "session_id": session_id}
        ).sort("timestamp", -1).limit(limit)

        messages = await cursor.to_list(length=limit)
        return list(reversed(messages))

    async def get_all_sessions(self, user_id: str) -> List[Dict]:
        """Get all chat sessions for a user"""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$session_id",
                "last_message": {"$last": "$timestamp"},
                "message_count": {"$sum": 1}
            }},
            {"$sort": {"last_message": -1}}
        ]

        cursor = self.chat_collection.aggregate(pipeline)
        sessions = await cursor.to_list(length=100)
        return sessions

    async def delete_session(self, user_id: str, session_id: str):
        """Delete a chat session"""
        await self.chat_collection.delete_many({
            "user_id": user_id,
            "session_id": session_id
        })

    async def save_conversation_state(self, user_id: str, session_id: str, state: Dict):
        """Save the entire conversation state"""
        state_doc = {
            "user_id": user_id,
            "session_id": session_id,
            "state": state,
            "updated_at": datetime.now().isoformat()
        }

        await self.db["ConversationState"].update_one(
            {"user_id": user_id, "session_id": session_id},
            {"$set": state_doc},
            upsert=True
        )

    async def get_conversation_state(self, user_id: str, session_id: str) -> Optional[Dict]:
        """Retrieve conversation state"""
        doc = await self.db["ConversationState"].find_one({
            "user_id": user_id,
            "session_id": session_id
        })
        return doc.get("state") if doc else None



chat_db = ChatHistoryDB()
