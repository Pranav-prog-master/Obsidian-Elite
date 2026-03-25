"""
EduMentor AI — Test Data Creator
Usage:  python create_test_data.py <token> <subject_name>
Example: python create_test_data.py eyJhbGci... "Physics Class 12"
"""

import os
import sys

# ── arg check ──────────────────────────────────────────────────────────────

if len(sys.argv) < 3:
    print()
    print("  Usage:   python create_test_data.py <token> <subject_name>")
    print('  Example: python create_test_data.py eyJhbGci... "Physics Class 12"')
    print()
    sys.exit(1)

TOKEN        = sys.argv[1].strip()
SUBJECT_NAME = " ".join(sys.argv[2:]).strip()

# ── imports ────────────────────────────────────────────────────────────────

from dotenv import load_dotenv
load_dotenv()

from jose import jwt, JWTError
from supabase_client import supabase

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

# ── helpers ────────────────────────────────────────────────────────────────

def ok(msg):  print(f"  ✅  {msg}")
def err(msg): print(f"  ❌  {msg}")
def info(msg):print(f"  ℹ️   {msg}")
def sep():    print("-" * 60)

SAMPLE_NOTES = (
    "Chapter 1: Laws of Motion. "
    "Newton's First Law states that an object at rest stays at rest and an object in motion stays in motion "
    "unless acted upon by an external force. This is also called the law of inertia. "
    "Newton's Second Law states that Force equals mass times acceleration. F = ma. "
    "The unit of force is Newton. "
    "Newton's Third Law states that every action has an equal and opposite reaction. "
    "Chapter 2: Work Energy and Power. "
    "Work is defined as force multiplied by displacement in the direction of force. W = F x d. "
    "Kinetic energy is the energy of motion. KE = half times mass times velocity squared. "
    "Potential energy is stored energy. PE = mgh where m is mass g is 9.8 and h is height. "
    "Power is rate of doing work. P = W divided by t. "
    "Chapter 3: Gravitation. "
    "Every object in the universe attracts every other object with a force called gravity. "
    "F = G times m1 times m2 divided by r squared. "
    "G is the universal gravitational constant equal to 6.67 times 10 to the power negative 11. "
    "The escape velocity from earth is 11.2 km per second. "
    "Orbital velocity depends on the radius of the orbit."
)

# ── main ───────────────────────────────────────────────────────────────────

print()
print("=" * 60)
print("  EduMentor AI — Test Data Creator")
print("=" * 60)

# Step 1: Decode token to get user_id
sep()
print("STEP 1 — Decoding token")
sep()

try:
    payload = jwt.decode(
        TOKEN,
        SECRET_KEY,
        algorithms=[ALGORITHM],
        options={"verify_aud": False},
    )
    user_id = payload.get("sub")
    email   = payload.get("email", "unknown")
    if not user_id:
        raise ValueError("Token has no sub claim")
    ok(f"Token valid. User: {email} | ID: {user_id}")
except JWTError as e:
    err(f"Token is invalid or expired: {e}")
    info("Run  python get_token.py <email> <password>  to get a fresh token.")
    sys.exit(1)
except ValueError as e:
    err(str(e))
    sys.exit(1)

# Step 2 & 3: Check or create subject
sep()
print("STEP 2 — Checking / creating subject")
sep()

existing = (
    supabase.table("subjects")
    .select("id, name")
    .eq("user_id", user_id)
    .eq("name", SUBJECT_NAME)
    .execute()
)

if existing.data:
    subject_id = existing.data[0]["id"]
    ok(f"Subject already exists with id: {subject_id}")
else:
    insert_res = supabase.table("subjects").insert({
        "user_id": user_id,
        "name": SUBJECT_NAME,
        "exam_target": "JEE",
    }).execute()

    if not insert_res.data:
        err("Failed to create subject. Check your Supabase connection.")
        sys.exit(1)

    subject_id = insert_res.data[0]["id"]
    ok(f"Subject created with id: {subject_id}")

# Step 4: Check if notes already exist
sep()
print("STEP 3 — Checking / creating sample notes")
sep()

notes_res = supabase.table("notes").select("id").eq("subject_id", subject_id).execute()

if notes_res.data:
    ok("Notes already exist for this subject. Skipping notes creation.")
else:
    # Step 5 & 6: Insert sample notes
    notes_insert = supabase.table("notes").insert({
        "subject_id": subject_id,
        "filename": "sample_physics_notes.txt",
        "raw_text": SAMPLE_NOTES,
        "chunk_count": 1,
        "storage_path": "sample",
    }).execute()

    if not notes_insert.data:
        err("Failed to insert sample notes. Check your Supabase connection.")
        sys.exit(1)

    ok("Sample notes created successfully.")

# Step 7 & 8: Final output
sep()
print()
ok("You are now ready to test all quiz and explanation flows.")
print()
print("=" * 60)
print("  Your subject_id is:")
print("=" * 60)
print()
print(f"  {subject_id}")
print()
print("=" * 60)
print("  Next steps:")
print("=" * 60)
print()
print("  1. Start the server (if not already running):")
print("       uvicorn main:app --reload --port 8000")
print()
print("  2. Run the automated flow tester:")
print(f"       python test_flows.py YOUR_TOKEN {subject_id}")
print()
