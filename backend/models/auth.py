from pydantic import BaseModel, EmailStr
from typing import Annotated 
from pydantic.fields import Field

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: Annotated[EmailStr, ...]
    full_name: str | None = None
    
class UserInDB(User):
    hashed_password: str

class UserCreate(User):
    password: Annotated[str, Field(min_length=6, max_length=32 , description="Password must be at least 6 characters long")]

