from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from supabase_client import supabase

load_dotenv()

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "changeme")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode({"sub": user_id, "email": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register", summary="Register a new user account")
def register(body: RegisterRequest):
    existing = supabase.table("profiles").select("id").eq("email", body.email.lower()).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed = pwd_context.hash(body.password)
    res = supabase.table("profiles").insert({
        "email": body.email.lower(),
        "hashed_password": hashed,
    }).execute()

    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create account.")

    user_id = res.data[0]["id"]
    return {"access_token": create_token(user_id, body.email), "token_type": "bearer", "user_id": user_id}


@router.post("/login", summary="Login and get a JWT token")
def login(body: LoginRequest):
    res = supabase.table("profiles").select("id, email, hashed_password").eq("email", body.email.lower()).execute()
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = res.data[0]
    if not pwd_context.verify(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"access_token": create_token(user["id"], user["email"]), "token_type": "bearer", "user_id": user["id"]}


@router.get("/me", summary="Get current logged-in user info")
def get_me(user_id: str, email: str):
    return {"user_id": user_id, "email": email}
