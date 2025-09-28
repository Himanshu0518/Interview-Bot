from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from utils.logger import logging
from utils.exception import MyException
import sys 

load_dotenv()

class GenerativeAIModel:
    def __init__(self, MODEL="gemini-2.5-flash", API_KEY=os.getenv("GOOGLE_API_KEY")):
        if not API_KEY:
            raise MyException("GOOGLE_API_KEY not found in .env", sys)
        
        self.model = ChatGoogleGenerativeAI(
            model=MODEL,
            api_key=API_KEY,
            temperature=0.7
        )
        
    def get_general_query(self, question: str):
        try:
            response = self.model.invoke(question)
            return response.content  # extract text
        except Exception as e:
            raise MyException(e, sys)
    
    async def get_response(self, prompt: str):
        try:
            response = await self.model.ainvoke(prompt)
            return response.content
        except Exception as e:
            raise MyException(e, sys)
