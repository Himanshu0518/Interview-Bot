# generative_model.py
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from utils.logger import logging
from utils.exception import MyException
import sys 


load_dotenv()

class GenerativeAIModel:
    def __init__(self, MODEL="gemini-1.5-flash", API_KEY=os.getenv("GOOGLE_API_KEY")):
        self.model = ChatGoogleGenerativeAI(model=MODEL, api_key=API_KEY,temperature = 1.5)
        
    def get_general_query(self, question: str):
        try:
            response = self.model.invoke(question)  # returns BaseMessage
        except Exception as e:
            raise MyException(e,sys)
        return response
    
    async def get_response(self, prompt: str):
        try:
            response = await self.model.ainvoke(prompt)  # async safe
        except Exception as e:
            raise MyException(e,sys)
        return response
 