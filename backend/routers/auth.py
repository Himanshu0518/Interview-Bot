from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from utils.logger import logging
from utils.exception import MyException
from connections.mongo_client import MongoDBClient
from models.auth import User, UserCreate, UserInDB, Token, TokenData
from datetime import datetime, timedelta, timezone
from typing import Annotated
from bson import ObjectId
import jwt
import os
import sys
from passlib.context import CryptContext
from jwt.exceptions import InvalidTokenError

# JWT config
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# FastAPI router
auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
MAX_BCRYPT_BYTES = 72  # bcrypt limit
def truncate_password(password: str) -> str:
    return password[:MAX_BCRYPT_BYTES]

def hash_password(password: str) -> str:
    return pwd_context.hash(truncate_password(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(truncate_password(plain_password), hashed_password)

# MongoDB client
client = MongoDBClient()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# JWT token creation
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Get current user
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if username is None or user_id is None:
            raise credentials_exception

        user_db = await client.find_one("Users", {"_id": ObjectId(user_id)})
        if not user_db:
            raise credentials_exception

        return TokenData(username=username, user_id=user_id)

    except InvalidTokenError:
        raise credentials_exception

# Register new user
@auth_router.post("/register", response_model=User, status_code=201)
async def register_user(user_data: UserCreate):
    try:
        user_dict = user_data.model_dump()
        username = user_dict["username"]
        email = user_dict["email"]

        # Check if username or email exists
        existing_user = await client.find_one("Users", {"$or": [{"username": username}, {"email": email}]})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Bad Request",
                    "message": "Username or Email already exists. Try logging in or use another email.",
                    "code": 1001,
                }
            )

        # Hash password safely
        plain_password = user_dict.pop("password")
        hashed_password = hash_password(plain_password)

        # Create DB model
        user_db = UserInDB(**user_dict, hashed_password=hashed_password)

        # Insert into MongoDB
        await client.insert_one("Users", user_db.model_dump())

        # Return public user info
        return User(**user_dict)

    except HTTPException:
        raise
    except Exception as e:
        raise MyException(e, sys)

# Login and get JWT token
@auth_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    try:
        identifier = form_data.username   # username OR email
        password = form_data.password

        # Decide query by username/email
        query = {"email": identifier} if "@" in identifier and "." in identifier else {"username": identifier}
        user_db = await client.find_one("Users", query)
        logging.info("user data received")

        if not user_db or not verify_password(password, user_db["hashed_password"]):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Authentication Failed",
                    "message": "The username/email or password is incorrect.",
                    "code": 1001
                }
            )

        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_db["username"], "user_id": str(user_db["_id"])},
            expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        raise MyException(e, sys)
