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
    """
    Truncate password to 72 bytes for bcrypt compatibility.
    FIXED: Now properly handles UTF-8 multi-byte characters.
    """
    password_bytes = password.encode('utf-8')[:MAX_BCRYPT_BYTES]
    return password_bytes.decode('utf-8', errors='ignore')

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(truncate_password(password))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password"""
    return pwd_context.verify(truncate_password(plain_password), hashed_password)

# MongoDB client
client = MongoDBClient()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# JWT token creation
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Get current user
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenData:
    """
    Validate JWT token and return user data.
    FIXED: Proper JWT exception handling.
    """
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

    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.DecodeError) as e:
        # FIXED: Catch specific JWT exceptions instead of deprecated PyJWTError
        logging.warning(f"JWT validation failed: {type(e).__name__}")
        raise credentials_exception
    except Exception as e:
        logging.error(f"Token validation error: {e}")
        raise credentials_exception

# Register new user
@auth_router.post("/register", response_model=User, status_code=201)
async def register_user(user_data: UserCreate):
    """
    Register a new user.
    Validates username/email uniqueness and securely hashes password.
    """
    try:
        user_dict = user_data.model_dump()
        username = user_dict["username"]
        email = user_dict["email"]

        # Validate username length
        if len(username) < 3 or len(username) > 30:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Bad Request",
                    "message": "Username must be between 3 and 30 characters.",
                    "code": 1002,
                }
            )

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
        
        # Validate password strength
        if len(plain_password) < 8:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Bad Request",
                    "message": "Password must be at least 8 characters long.",
                    "code": 1003,
                }
            )
        
        hashed_password = hash_password(plain_password)

        # Create DB model
        user_db = UserInDB(**user_dict, hashed_password=hashed_password)

        # Insert into MongoDB
        await client.insert_one("Users", user_db.model_dump())

        logging.info(f"New user registered: {username}")

        # Return public user info
        return User(**user_dict)

    except HTTPException:
        raise
    except Exception as e:
        raise MyException(e, sys)

# Login and get JWT token
@auth_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """
    Authenticate user and return JWT token.
    Accepts username or email as identifier.
    """
    try:
        identifier = form_data.username   # username OR email
        password = form_data.password

        # Decide query by username/email
        query = {"email": identifier} if "@" in identifier and "." in identifier else {"username": identifier}
        user_db = await client.find_one("Users", query)
        
        logging.info(f"Login attempt for: {identifier}")

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

        logging.info(f"User logged in successfully: {user_db['username']}")

        return Token(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        raise MyException(e, sys)
