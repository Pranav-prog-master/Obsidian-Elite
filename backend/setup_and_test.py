"""
EduMentor AI — Setup & Connection Checker
Run this first before anything else:  python setup_and_test.py
"""

import os
import sys

# ── helpers ────────────────────────────────────────────────────────────────

def ok(msg):   print(f"  ✅  {msg}")
def err(msg):  print(f"  ❌  {msg}")
def info(msg): print(f"  ℹ️   {msg}")
def warn(msg): print(f"  ⚠️   {msg}")
def sep():     print("-" * 60)

# ── Step 1 — Environment variables ─────────────────────────────────────────

sep()
print("STEP 1 — Checking environment variables")
sep()

from dotenv import load_dotenv
load_dotenv()

REQUIRED_KEYS = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "OPENROUTER_API_KEY", "SECRET_KEY"]
all_env_ok = True

for key in REQUIRED_KEYS:
    val = os.getenv(key, "").strip()
    if not val:
        err(f"MISSING: {key} is not set in your .env file")
        all_env_ok = False
    else:
        ok(f"{key} found")

if not all_env_ok:
    print()
    err("Fix the missing keys in your .env file and run this script again.")
    sys.exit(1)

ok("All environment variables found.")

# ── Step 2 — OpenRouter API key format ─────────────────────────────────────

sep()
print("STEP 2 — Checking OpenRouter API key format")
sep()

openrouter_key = os.getenv("OPENROUTER_API_KEY", "").strip()

if not openrouter_key or openrouter_key == "your_openrouter_api_key_here":
    err("MISSING: OPENROUTER_API_KEY is not set. Get your free key from https://openrouter.ai")
    sys.exit(1)
elif not openrouter_key.startswith("sk-or-"):
    warn(
        "Your OpenRouter key does not start with sk-or- which is unusual. "
        "It may still work but double check at https://openrouter.ai/keys"
    )
else:
    ok("OpenRouter API key format looks correct.")

# ── Step 3 — Supabase connection ────────────────────────────────────────────

sep()
print("STEP 3 — Checking Supabase connection")
sep()

try:
    from supabase_client import supabase
    supabase.table("profiles").select("id").limit(1).execute()
    ok("Supabase connection successful.")
except Exception as e:
    err(f"Supabase connection failed: {e}")
    info("Check that SUPABASE_URL and SUPABASE_SERVICE_KEY are correct in your .env file.")
    sys.exit(1)

# ── Step 4 — OpenRouter API live test ──────────────────────────────────────

sep()
print("STEP 4 — Checking OpenRouter API connection")
sep()

PRIMARY_MODEL = os.getenv("AI_MODEL_PRIMARY", "google/gemma-2-9b-it:free")
BACKUP_MODEL  = os.getenv("AI_MODEL_BACKUP",  "mistralai/mistral-7b-instruct:free")
SITE_URL      = os.getenv("APP_SITE_URL",     "http://localhost:5173")
APP_TITLE     = os.getenv("APP_TITLE",        "EduMentor AI")

try:
    from openai import OpenAI
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_key,
    )

    print(f"  Testing primary model: {PRIMARY_MODEL}")
    response = client.chat.completions.create(
        model=PRIMARY_MODEL,
        messages=[{"role": "user", "content": "Reply with the single word OK and nothing else."}],
        max_tokens=10,
        extra_headers={
            "HTTP-Referer": SITE_URL,
            "X-Title": APP_TITLE,
        },
    )
    reply = response.choices[0].message.content or ""

    if "OK" in reply.upper():
        ok(f"OpenRouter API connection successful. Primary model: {PRIMARY_MODEL}")
    else:
        warn(
            f"OpenRouter responded but with unexpected content. "
            f"This may still work. Response was: {reply[:100]}"
        )

except Exception as primary_exc:
    warn(f"Primary model failed: {primary_exc}")
    print(f"  Trying backup model: {BACKUP_MODEL}")
    try:
        response = client.chat.completions.create(
            model=BACKUP_MODEL,
            messages=[{"role": "user", "content": "Reply with the single word OK and nothing else."}],
            max_tokens=10,
            extra_headers={
                "HTTP-Referer": SITE_URL,
                "X-Title": APP_TITLE,
            },
        )
        reply = response.choices[0].message.content or ""
        if reply.strip():
            ok(f"Backup model works. Consider setting AI_MODEL_PRIMARY={BACKUP_MODEL} in your .env")
        else:
            warn("Backup model returned empty response.")
    except Exception as backup_exc:
        err(
            f"OpenRouter API connection failed.\n"
            f"  Please check:\n"
            f"    1) Your OPENROUTER_API_KEY in .env is correct\n"
            f"    2) You have credits at https://openrouter.ai/credits\n"
            f"    3) Your internet connection is working\n"
            f"  Backup error: {backup_exc}"
        )
        sys.exit(1)

# ── Step 5 — interactions table ────────────────────────────────────────────

sep()
print("STEP 5 — Checking interactions table")
sep()

INTERACTIONS_SQL = """\
CREATE TABLE IF NOT EXISTS interactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  interaction_type text not null,
  input_text text,
  output_text text,
  created_at timestamp with time zone default now()
);"""

try:
    supabase.table("interactions").select("id").limit(1).execute()
    ok("interactions table exists.")
except Exception as e:
    err(f"interactions table not found: {e}")
    print()
    print("  ⚠️  Run the following SQL in your Supabase SQL editor, then re-run this script:")
    print()
    print(INTERACTIONS_SQL)
    print()
    sys.exit(1)

# ── Step 6 — difficulty column in quiz_sessions ────────────────────────────

sep()
print("STEP 6 — Checking difficulty column in quiz_sessions")
sep()

DIFFICULTY_SQL = "ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS difficulty text default 'medium';"

try:
    supabase.table("quiz_sessions").select("difficulty").limit(1).execute()
    ok("difficulty column exists in quiz_sessions.")
except Exception as e:
    err(f"difficulty column missing: {e}")
    print()
    print("  ⚠️  Run the following SQL in your Supabase SQL editor, then re-run this script:")
    print()
    print(f"  {DIFFICULTY_SQL}")
    print()
    sys.exit(1)

# ── Step 7 — Final status ──────────────────────────────────────────────────

sep()
print("STEP 7 — Final status")
sep()
ok("All checks passed!")
print()
print("  🚀  Setup complete. You are ready to run the server and test all flows.")
print()
print("  Next steps:")
print("    1.  python get_token.py student@test.com test123")
print("    2.  python create_test_data.py YOUR_TOKEN \"Physics Class 12\"")
print("    3.  uvicorn main:app --reload --port 8000")
print("    4.  python test_flows.py YOUR_TOKEN YOUR_SUBJECT_ID")
print()
print("  Bonus — switch AI model live during demo:")
print("    curl -X POST http://localhost:8000/admin/switch-model \\")
print("         -H 'Content-Type: application/json' \\")
print("         -d '{\"model_name\": \"mistral\"}'")
print()
