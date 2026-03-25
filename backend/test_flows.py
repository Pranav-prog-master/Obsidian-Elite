"""
EduMentor AI — Automated Flow Tester
Usage:  python test_flows.py <token> <subject_id>
Example: python test_flows.py eyJhbGci... a1b2c3d4-...

Make sure the FastAPI server is running on localhost:8000 before running this.
"""

import sys
import time
import json

# ── arg check ──────────────────────────────────────────────────────────────

if len(sys.argv) != 3:
    print()
    print("  Usage:   python test_flows.py <token> <subject_id>")
    print("  Example: python test_flows.py eyJhbGci... a1b2c3d4-...")
    print()
    sys.exit(1)

TOKEN      = sys.argv[1].strip()
SUBJECT_ID = sys.argv[2].strip()

# ── imports ────────────────────────────────────────────────────────────────

try:
    import requests
except ImportError:
    print("  ❌  'requests' library not found. Run:  pip install requests")
    sys.exit(1)

# ── config ─────────────────────────────────────────────────────────────────

BASE_URL = "http://localhost:8000"
HEADERS  = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

# ── result tracker ─────────────────────────────────────────────────────────

results: dict[str, bool] = {}

def mark(label: str, passed: bool):
    results[label] = passed

def ok(msg):   print(f"    ✅  {msg}")
def err(msg):  print(f"    ❌  {msg}")
def step(msg): print(f"\n  ▶  {msg}")
def sep():     print("\n" + "=" * 60)

def safe_post(url, payload, label):
    try:
        r = requests.post(url, headers=HEADERS, json=payload, timeout=60)
        return r
    except requests.exceptions.ConnectionError:
        err(f"Cannot connect to {BASE_URL}. Is the server running?")
        mark(label, False)
        return None
    except requests.exceptions.Timeout:
        err("Request timed out after 60 seconds.")
        mark(label, False)
        return None

def safe_get(url, label):
    try:
        r = requests.get(url, headers=HEADERS, timeout=60)
        return r
    except requests.exceptions.ConnectionError:
        err(f"Cannot connect to {BASE_URL}. Is the server running?")
        mark(label, False)
        return None
    except requests.exceptions.Timeout:
        err("Request timed out after 60 seconds.")
        mark(label, False)
        return None

# ══════════════════════════════════════════════════════════════════════════
# FLOW 1 — Hard Quiz: Generate → Submit → Summary
# ══════════════════════════════════════════════════════════════════════════

sep()
print("  FLOW 1 — Hard Quiz Generation, Submission & Summary")
sep()

session_id   = None
question_ids = []

# ── 1.1 Generate quiz ──────────────────────────────────────────────────────

step("Generating hard quiz...")
r = safe_post(
    f"{BASE_URL}/quiz/generate",
    {"subject_id": SUBJECT_ID, "difficulty": "hard"},
    "Flow 1 Quiz Generation",
)

if r is not None:
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        session_id   = data.get("session_id")
        question_ids = [q["id"] for q in data.get("questions", [])]
        ok(f"Quiz generated. Session ID: {session_id}")
        ok(f"Questions received: {len(question_ids)}")
        mark("Flow 1 Quiz Generation", True)
    else:
        err(f"Error response: {r.text[:300]}")
        mark("Flow 1 Quiz Generation", False)

# ── 1.2 Submit answers ─────────────────────────────────────────────────────

step("Submitting answers (all 'a' as dummy answers)...")

if session_id and question_ids:
    answers = [{"question_id": qid, "user_answer": "a"} for qid in question_ids]
    r = safe_post(
        f"{BASE_URL}/quiz/submit",
        {"session_id": session_id, "answers": answers},
        "Flow 1 Quiz Submission",
    )
    if r is not None:
        print(f"    Status: {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            score      = data.get("score", 0)
            total      = data.get("total", 10)
            percentage = data.get("percentage", 0.0)
            ok(f"Score: {score} out of {total} ({percentage}%)")
            mark("Flow 1 Quiz Submission", True)
        else:
            err(f"Error response: {r.text[:300]}")
            mark("Flow 1 Quiz Submission", False)
else:
    err("Skipping submission — no session_id from previous step.")
    mark("Flow 1 Quiz Submission", False)

# ── 1.3 Session summary ────────────────────────────────────────────────────

step("Getting session summary...")

if session_id:
    r = safe_get(f"{BASE_URL}/quiz/session/{session_id}/summary", "Flow 1 Session Summary")
    if r is not None:
        print(f"    Status: {r.status_code}")
        if r.status_code == 200:
            data         = r.json()
            perf_label   = data.get("performance_label", "N/A")
            wrong_count  = len(data.get("wrong_questions", []))
            ok(f"Performance label: {perf_label}")
            ok(f"Wrong questions: {wrong_count}")
            mark("Flow 1 Session Summary", True)
        else:
            err(f"Error response: {r.text[:300]}")
            mark("Flow 1 Session Summary", False)
else:
    err("Skipping summary — no session_id from previous step.")
    mark("Flow 1 Session Summary", False)

# ══════════════════════════════════════════════════════════════════════════
# FLOW 2 — Doubt: Ask → History
# ══════════════════════════════════════════════════════════════════════════

sep()
print("  FLOW 2 — Doubt Asking & History")
sep()

# ── 2.1 Ask doubt ──────────────────────────────────────────────────────────

step("Asking doubt: 'What is Newton's Second Law of Motion?'")
r = safe_post(
    f"{BASE_URL}/doubt/ask",
    {"subject_id": SUBJECT_ID, "question": "What is Newton's Second Law of Motion?"},
    "Flow 2 Doubt Ask",
)

if r is not None:
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        answer = r.json().get("answer", "")
        preview = answer[:150] + "..." if len(answer) > 150 else answer
        ok(f"Answer preview: {preview}")
        mark("Flow 2 Doubt Ask", True)
    else:
        err(f"Error response: {r.text[:300]}")
        mark("Flow 2 Doubt Ask", False)

# ── 2.2 Doubt history ─────────────────────────────────────────────────────

# Brief pause to respect rate limiter
time.sleep(6)

step("Fetching doubt history...")
r = safe_get(f"{BASE_URL}/doubt/history/{SUBJECT_ID}", "Flow 2 Doubt History")

if r is not None:
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        count = len(r.json())
        ok(f"Total doubts asked: {count}")
        mark("Flow 2 Doubt History", True)
    else:
        err(f"Error response: {r.text[:300]}")
        mark("Flow 2 Doubt History", False)

# ══════════════════════════════════════════════════════════════════════════
# FLOW 3 — Topics + Explanation: Extract → Explain → History
# ══════════════════════════════════════════════════════════════════════════

sep()
print("  FLOW 3 — Topic Extraction, Concept Explanation & History")
sep()

# ── 3.1 Extract topics ────────────────────────────────────────────────────

time.sleep(6)

step("Extracting topics from notes...")
r = safe_get(f"{BASE_URL}/quiz/topics/{SUBJECT_ID}", "Flow 3 Topic Extraction")

if r is not None:
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        topics = r.json().get("topics", [])
        ok(f"Topics found: {topics}")
        mark("Flow 3 Topic Extraction", True)
    else:
        err(f"Error response: {r.text[:300]}")
        mark("Flow 3 Topic Extraction", False)

# ── 3.2 Explain concept ───────────────────────────────────────────────────

time.sleep(6)

step("Getting explanation for 'Laws of Motion'...")
r = safe_post(
    f"{BASE_URL}/explain/topic",
    {"subject_id": SUBJECT_ID, "topic_name": "Laws of Motion"},
    "Flow 3 Concept Explanation",
)

if r is not None:
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        explanation = r.json().get("explanation", "")
        preview = explanation[:200] + "..." if len(explanation) > 200 else explanation
        ok(f"Explanation preview: {preview}")
        mark("Flow 3 Concept Explanation", True)
    else:
        err(f"Error response: {r.text[:300]}")
        mark("Flow 3 Concept Explanation", False)

# ── 3.3 Explanation history ───────────────────────────────────────────────

step("Fetching explanation history...")
r = safe_get(f"{BASE_URL}/explain/history/{SUBJECT_ID}", "Flow 3 Explanation History")

if r is not None:
    print(f"    Status: {r.status_code}")
    if r.status_code == 200:
        count = len(r.json())
        ok(f"Total explanations viewed: {count}")
        mark("Flow 3 Explanation History", True)
    else:
        err(f"Error response: {r.text[:300]}")
        mark("Flow 3 Explanation History", False)

# ══════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY TABLE
# ══════════════════════════════════════════════════════════════════════════

sep()
print("  FINAL TEST RESULTS")
sep()

TEST_ORDER = [
    "Flow 1 Quiz Generation",
    "Flow 1 Quiz Submission",
    "Flow 1 Session Summary",
    "Flow 2 Doubt Ask",
    "Flow 2 Doubt History",
    "Flow 3 Topic Extraction",
    "Flow 3 Concept Explanation",
    "Flow 3 Explanation History",
]

passed = 0
print()
for label in TEST_ORDER:
    status = results.get(label, False)
    icon   = "✅ PASSED" if status else "❌ FAILED"
    print(f"  {label:<35} {icon}")
    if status:
        passed += 1

total = len(TEST_ORDER)
print()
print("=" * 60)
print(f"  Overall: {passed} out of {total} tests passed.")
print("=" * 60)

if passed == total:
    print()
    print("  🎉  All tests passed! The AI engine is fully working.")
elif passed >= total // 2:
    print()
    print("  ⚠️   Some tests failed. Check the errors above.")
    print("       Common fixes: see Troubleshooting in README.md")
else:
    print()
    print("  🚨  Most tests failed. Make sure:")
    print("       1. The FastAPI server is running on port 8000")
    print("       2. Your token is valid (run get_token.py again)")
    print("       3. setup_and_test.py passed all checks")

print()
