"""
EduMentor AI — Token Generator (Register + Login in one command)
Usage:  python get_token.py <email> <password>
Example: python get_token.py student@test.com test123
"""

import os
import sys
from datetime import datetime, timedelta, timezone

# ── arg check ──────────────────────────────────────────────────────────────

if len(sys.argv) != 3:
    print()
    print("  Usage:   python get_token.py <email> <password>")
    print("  Example: python get_token.py student@test.com test123")
    print()
    sys.exit(1)

EMAIL    = sys.argv[1].strip().lower()
PASSWORD = sys.argv[2].strip()

# ── imports ────────────────────────────────────────────────────────────────

from dotenv import load_dotenv
load_dotenv()

import bcrypt
from jose import jwt
from supabase_client import supabase

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

if not SECRET_KEY:
    print("  ❌  SECRET_KEY is not set in your .env file. Cannot generate token.")
    sys.exit(1)

# ── helpers ────────────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MIN)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# ── main logic ─────────────────────────────────────────────────────────────

print()
print("=" * 60)
print("  EduMentor AI — Token Generator")
print("=" * 60)

# Check if user already exists
res = supabase.table("profiles").select("id, email, hashed_password").eq("email", EMAIL).execute()

if res.data:
    # ── Existing user — verify password ───────────────────────────────────
    user = res.data[0]
    print(f"\n  Found existing account for {EMAIL}")

    if not verify_password(PASSWORD, user["hashed_password"]):
        print("  ❌  Incorrect password. Please try again.")
        sys.exit(1)

    user_id = user["id"]
    print("  ✅  Password verified.")

else:
    # ── New user — register ────────────────────────────────────────────────
    print(f"\n  No account found for {EMAIL}. Creating new account...")

    hashed = hash_password(PASSWORD)
    insert_res = supabase.table("profiles").insert({
        "email": EMAIL,
        "hashed_password": hashed,
    }).execute()

    if not insert_res.data:
        print("  ❌  Failed to create account. Check your Supabase connection.")
        sys.exit(1)

    user_id = insert_res.data[0]["id"]
    print(f"  ✅  Account created successfully.")

# ── Generate token ─────────────────────────────────────────────────────────

token = create_token(user_id, EMAIL)

print()
print("=" * 60)
print("  Your token is:")
print("=" * 60)
print()
print(f"  {token}")
print()
print("=" * 60)
print("  Your user_id is:")
print("=" * 60)
print()
print(f"  {user_id}")
print()
print("=" * 60)
print(f"  Token expires in: {EXPIRE_MIN} minutes ({EXPIRE_MIN // 60} hours)")
print("=" * 60)
print()
print("  Copy the token above and use it as:  Bearer <token>")
print("  Copy the user_id above for create_test_data.py")
print()
