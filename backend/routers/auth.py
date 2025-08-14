from fastapi import APIRouter
from utils.logger import logging
from utils.exception import MyException
from connections.mongo_client import MongoDBClient
from models.auth import User,UserCreate,UserInDB,Token,TokenData
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
import os
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
import sys

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


auth_router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]    
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
client = MongoDBClient()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)])-> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

        # Check in DB if user exists
        user_db = await client.find_one("Users", {"username": username})
        if not user_db:
            raise credentials_exception

        # Return as TokenData or full user dict depending on your needs
        return TokenData(username=username)

    except InvalidTokenError:
        raise credentials_exception

@auth_router.post("/register", response_model=User, status_code=201)
async def register_user(user_data: UserCreate):
    try:
        # Convert incoming pydantic model to dict
        user_dict = user_data.model_dump()

        username = user_dict["username"]
        email = user_dict["email"]

        # --- 1. Check if username or email already exists ---
        existing_user = await client.find_one(
            "Users", 
            {"$or": [{"username": username}, {"email": email}]}
        )
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username or Email already exists."
            )

        # --- 2. Hash password ---
        plain_password = user_dict.pop("password")
        hashed_password = pwd_context.hash(plain_password)

        # --- 3. Create DB model ---
        user_db = UserInDB(**user_dict, hashed_password=hashed_password)

        # --- 4. Insert into MongoDB ---
        await client.insert_one("Users", user_db.model_dump())

        # --- 5. Return public user info ---
        return User(**user_dict)

    except HTTPException:
        raise
    except Exception as e:
        raise MyException(e, sys)


@auth_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    try:
        username = form_data.username
        password = form_data.password

        user_db = await client.find_one("Users", {"username": username})
        logging.info(user_db)
        if not user_db or not verify_password(password, user_db["hashed_password"]):
            raise HTTPException(status_code=400, detail="Incorrect username or password.")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)    

        access_token = create_access_token(
            data={"sub": user_db["username"]},
            expires_delta=access_token_expires
        )

        return Token(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        raise MyException(e, sys)

        