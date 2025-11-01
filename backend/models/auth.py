from pydantic import BaseModel, EmailStr, field_validator
from typing import Annotated 
from pydantic.fields import Field
import re

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    user_id: str | None = None 


class User(BaseModel):
    username: str
    email: Annotated[EmailStr, ...]
    full_name: str | None = None

    @field_validator("username")
    @classmethod
    def username_must_be_valid(cls, value):
        if not re.match(r'^\w+$', value):
            raise ValueError("Username must contain only letters, numbers, or underscores")
        return value
    
class UserInDB(User):
    hashed_password: str

class UserCreate(User):
    password: Annotated[str, Field(min_length=6, max_length=32 , description="Password must be at least 6 characters long")]

class CurrentUser(BaseModel):
    user_id: str
    username: str