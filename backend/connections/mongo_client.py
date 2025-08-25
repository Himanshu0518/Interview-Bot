import os
import sys
import motor.motor_asyncio
import certifi
from bson import ObjectId   # ✅ Add this

from utils.exception import MyException
from utils.logger import logging

ca = certifi.where()

class MongoDBClient:
    """
    Async MongoDB Client using Motor for non-blocking operations in FastAPI.
    """

    client = None  # Shared Motor client instance

    def __init__(self, database_name: str = os.getenv("MONGODB_DATABASE_NAME")) -> None:
        try:
            if MongoDBClient.client is None:
                mongo_db_url = os.getenv("MONGODB_URL_KEY")
                if not mongo_db_url:
                    raise Exception("Environment variable MONGODB_URL_KEY is not set.")

                MongoDBClient.client = motor.motor_asyncio.AsyncIOMotorClient(
                    mongo_db_url,
                    # tlsCAFile=ca,
                    connectTimeoutMS=60000,
                    serverSelectionTimeoutMS=60000,
                    socketTimeoutMS=60000
                )

            self.client = MongoDBClient.client
            self.database = self.client[database_name]
            self.database_name = database_name
            logging.info(f"Connected to MongoDB (async) database: {database_name}")

        except Exception as e:
            raise MyException(e, sys)

    def get_collection(self, collection_name: str):
        """Return a Motor collection instance."""
        return self.database[collection_name]

    def to_object_id(self, id_str: str) -> ObjectId:
        """Convert string ID to ObjectId safely."""
        try:
            return ObjectId(id_str)
        except Exception:
            raise ValueError(f"Invalid ObjectId: {id_str}")

    async def insert_one(self, collection_name: str, data: dict):
        """Insert a document asynchronously."""
        try:
            result = await self.get_collection(collection_name).insert_one(data)
            logging.info(f"Inserted into {collection_name} with ID: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            raise MyException(e, sys)

    async def find_one(self, collection_name: str, query: dict):
        """Find a single document asynchronously."""
        try:
            return await self.get_collection(collection_name).find_one(query)
        except Exception as e:
            raise MyException(e, sys)

    async def find_many(self, collection_name: str, query: dict, limit: int = 0):
        """Find multiple documents asynchronously."""
        try:
            cursor = self.get_collection(collection_name).find(query)
            if limit > 0:
                cursor = cursor.limit(limit)
            return [doc async for doc in cursor]
        except Exception as e:
            raise MyException(e, sys)

    async def update_one(self, collection_name: str, query: dict, update_data: dict):
        """Update a document asynchronously."""
        try:
            result = await self.get_collection(collection_name).update_one(query, {"$set": update_data})
            logging.info(f"Matched {result.matched_count}, Modified {result.modified_count}")
            return result.modified_count
        except Exception as e:
            raise MyException(e, sys)

    async def delete_one(self, collection_name: str, query: dict):
        """Delete a document asynchronously."""
        try:
            result = await self.get_collection(collection_name).delete_one(query)
            logging.info(f"Deleted {result.deleted_count} document(s)")
            return result.deleted_count
        except Exception as e:
            raise MyException(e, sys)