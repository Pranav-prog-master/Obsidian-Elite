# Obsidian Elite (EduMentor AI)

Obsidian Elite is an AI-powered study companion for exam preparation. It helps students upload notes, generate quizzes, identify weak topics, and build personalized study plans.

## Highlights

- AI quiz generation from uploaded PDF notes
- Concept explanation and instant doubt solving
- Weak-topic detection from quiz performance
- Adaptive study plan generation
- Performance trends and analytics dashboard

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Backend     | Python 3.11, FastAPI, SQLAlchemy, Supabase Postgres |
| Frontend    | React 18, Vite, TailwindCSS, Chart.js               |
| AI          | Anthropic Claude API                                |
| Auth        | JWT (`python-jose`)                                 |
| PDF Parsing | PyMuPDF (`fitz`)                                    |
| DevOps      | Docker, Docker Compose                              |

## Project Structure

```text
Obsidian-Elite/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── TEAM_GUIDE.md
└── README.md
```

## Supabase Setup

1. Create a Supabase project.
2. Open **Project Settings → Database**.
3. Copy the connection string and convert it to SQLAlchemy async format:

```text
postgresql+asyncpg://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

4. Create a local environment file from the template:

```bash
cp .env.example .env
```

5. Set at minimum the following values in `.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres
DB_SSL=require
SECRET_KEY=your_jwt_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Run with Docker

```bash
docker-compose up -d --build
```

Services:

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs

Useful commands:

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose down
```

## Run Without Docker

### Backend

```bash
cd backend
python -m venv venv

# Linux/macOS
source venv/bin/activate
# Windows
# venv\Scripts\activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Study Plan

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| POST   | `/studyplan/generate`  | Generate personalized study plan |
| GET    | `/studyplan/{plan_id}` | Get one study plan               |
| GET    | `/studyplan/list/all`  | List all user study plans        |

### Performance

| Method | Endpoint                            | Description                      |
| ------ | ----------------------------------- | -------------------------------- |
| GET    | `/performance/summary/{subject_id}` | Subject performance summary      |
| GET    | `/performance/all`                  | All-subject performance overview |
| GET    | `/performance/trends/{subject_id}`  | Trend data for charts            |

## Troubleshooting

- If backend fails on startup, verify `DATABASE_URL` and `DB_SSL` in `.env`.
- If API is unreachable, check backend logs:

```bash
docker-compose logs backend
```

- Health check:

```bash
curl http://localhost:8000/health
```

## Team

| Area                              | Owner   |
| --------------------------------- | ------- |
| Frontend                          | Nikhil  |
| Backend Core & Database           | Pranav  |
| AI Engine                         | Kirtan  |
| Analytics, Study Planning, DevOps | Prahlad |

## License

Made with ❤️ by Team EduMentor

---

## 🤖 Testing the AI Engine (Kirtan's Module)

This section covers everything needed to test the quiz, doubt, and explanation flows end-to-end on your local machine using four helper scripts inside the `backend/` folder.

---

### Prerequisites

- Python 3.11 installed and added to PATH
- `.env` file filled with all required keys: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`, `SECRET_KEY`
- Supabase project running with the correct tables created
- FastAPI server running on `localhost:8000`
- All Python dependencies installed:

```bash
pip install -r backend/requirements.txt
```

---

### Step-by-Step Testing Commands (Run in This Exact Order)

#### Command 1 — Check all connections and database setup

```bash
cd backend
python setup_and_test.py
```

Checks every environment variable, tests the Supabase connection, tests the Claude API, and verifies that the `interactions` table and `difficulty` column exist. If anything is missing it prints the exact SQL you need to run in your Supabase SQL editor. **Always run this first.**

---

#### Command 2 — Create a test account and get your JWT token

```bash
python get_token.py student@test.com test123
```

Creates a new account if it doesn't exist, or logs in if it does. Prints your JWT token and your `user_id`. Copy both — you need them for the next commands. No Postman or frontend needed.

---

#### Command 3 — Create a test subject and sample notes

```bash
python create_test_data.py YOUR_TOKEN_HERE "Physics Class 12"
```

Decodes your token, creates a subject called "Physics Class 12" under your account, and inserts sample physics notes (Laws of Motion, Work Energy Power, Gravitation) into the database. Prints your `subject_id` at the end. Copy it.

---

#### Command 4 — Start the FastAPI server

```bash
uvicorn main:app --reload --port 8000
```

Keep this running in a separate terminal. API docs are at `http://localhost:8000/docs`.

---

#### Command 5 — Run all 3 flows automatically

```bash
python test_flows.py YOUR_TOKEN_HERE YOUR_SUBJECT_ID_HERE
```

Runs all three flows automatically and prints a pass/fail result for each of the 8 test steps. Respects the 5-second rate limiter by adding pauses between AI calls automatically.

---

### Manual curl Commands

Replace `TOKEN` with the token from `get_token.py` and `SUBJECT_ID` with the subject_id from `create_test_data.py`.

#### Flow 1 — Generate a hard quiz → Submit answers → Get session summary

```bash
# Step 1: Generate a hard quiz
curl -X POST http://localhost:8000/quiz/generate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"subject_id\": \"SUBJECT_ID\", \"difficulty\": \"hard\"}"

# Step 2: Submit answers (use question IDs from the generate response)
curl -X POST http://localhost:8000/quiz/submit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"session_id\": \"SESSION_ID\", \"answers\": [{\"question_id\": \"QUESTION_ID_1\", \"user_answer\": \"b\"}, {\"question_id\": \"QUESTION_ID_2\", \"user_answer\": \"a\"}, {\"question_id\": \"QUESTION_ID_3\", \"user_answer\": \"c\"}, {\"question_id\": \"QUESTION_ID_4\", \"user_answer\": \"d\"}, {\"question_id\": \"QUESTION_ID_5\", \"user_answer\": \"a\"}, {\"question_id\": \"QUESTION_ID_6\", \"user_answer\": \"b\"}, {\"question_id\": \"QUESTION_ID_7\", \"user_answer\": \"c\"}, {\"question_id\": \"QUESTION_ID_8\", \"user_answer\": \"a\"}, {\"question_id\": \"QUESTION_ID_9\", \"user_answer\": \"d\"}, {\"question_id\": \"QUESTION_ID_10\", \"user_answer\": \"b\"}]}"

# Step 3: Get full session summary with performance label
curl http://localhost:8000/quiz/session/SESSION_ID/summary \
  -H "Authorization: Bearer TOKEN"
```

#### Flow 2 — Ask a doubt → View doubt history

```bash
# Step 1: Ask a doubt
curl -X POST http://localhost:8000/doubt/ask \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"subject_id\": \"SUBJECT_ID\", \"question\": \"What is the difference between mitosis and meiosis?\"}"

# Step 2: View all past doubts for this subject
curl http://localhost:8000/doubt/history/SUBJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

#### Flow 3 — Get topics from notes → Explain a topic → View explanation history

```bash
# Step 1: Extract topics from uploaded notes
curl http://localhost:8000/quiz/topics/SUBJECT_ID \
  -H "Authorization: Bearer TOKEN"

# Step 2: Explain one of the returned topics (cached after first call)
curl -X POST http://localhost:8000/explain/topic \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"subject_id\": \"SUBJECT_ID\", \"topic_name\": \"Laws of Motion\"}"

# Step 3: View explanation history for this subject
curl http://localhost:8000/explain/history/SUBJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

---

### Key Behaviors to Know

- **Rate limiter** — 5-second cooldown per user across all AI calls. Returns HTTP 429 if you call too fast. `test_flows.py` handles this automatically with `time.sleep(6)` between calls.
- **Retry logic** — Every Claude API call retries up to 3 times with a 2-second delay before returning HTTP 503. You will see `Claude API attempt 1 of 3...` printed in the server logs.
- **Explanation cache** — The same topic + subject combination never calls Claude twice in the same server session. The second call returns instantly from memory.
- **JSON fence cleaning** — Claude sometimes wraps JSON in markdown code fences even when told not to. The engine strips these automatically before parsing.
- **Quiz validation** — The quiz response is validated for exactly 10 items and all 7 required keys (`question`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `explanation`) before saving to the database.
- **Difficulty column** — Run the `ALTER TABLE` SQL printed by `setup_and_test.py` in your Supabase SQL editor before using difficulty in production.
- **Correct answers hidden** — The `POST /quiz/generate` response never includes `correct_option` or `explanation` so students cannot cheat. These are only revealed after submitting via `POST /quiz/submit`.

---

### Troubleshooting

| Issue | Fix |
|-------|-----|
| **HTTP 503 on quiz generate** | Your `ANTHROPIC_API_KEY` may be invalid or expired. Check it at [console.anthropic.com](https://console.anthropic.com). |
| **HTTP 401 Unauthorized** | Your token has expired or is malformed. Run `python get_token.py` again to get a fresh token. |
| **HTTP 404 No notes found** | Run `python create_test_data.py` first to insert sample notes before generating a quiz. |
| **HTTP 429 Too many requests** | Wait 5 seconds between AI requests. The rate limiter blocks faster requests per user. `test_flows.py` handles this automatically. |
| **`relation "interactions" does not exist`** | Run the `CREATE TABLE` SQL printed by `setup_and_test.py` in your Supabase SQL editor. |
| **`column "difficulty" does not exist`** | Run the `ALTER TABLE` SQL printed by `setup_and_test.py` in your Supabase SQL editor. |
| **`ModuleNotFoundError: supabase`** | Run `pip install supabase` or `pip install -r requirements.txt`. |
| **`ModuleNotFoundError: requests`** | Run `pip install requests` (only needed for `test_flows.py`). |
| **`ModuleNotFoundError: bcrypt`** | Run `pip install bcrypt` (only needed for `get_token.py`). |
| **Server not found on port 8000** | Make sure you ran `uvicorn main:app --reload --port 8000` from inside the `backend/` folder. |
| **Token decode error in create_test_data.py** | Your `SECRET_KEY` in `.env` must match the one used when the token was generated. Run `get_token.py` and `create_test_data.py` with the same `.env` file. |
