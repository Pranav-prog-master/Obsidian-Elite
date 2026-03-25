# 🎓 EduMentor AI — Personalized AI Study Companion & Exam Prep Engine

A revolutionary AI-powered study platform that provides personalized quiz generation, instant doubt resolution, concept explanation, and adaptive study planning for students preparing for competitive exams (JEE, NEET, UPSC, college exams).

## 🚀 Problem Solved

Students preparing for exams lack personalized guidance. They study from generic content, never knowing their weak areas, can't get instant doubt resolution, and have no personalized study schedules. Coaching is expensive. **EduMentor AI** is the solution:

- **Free, instant personalized tutoring** 24/7
- **Custom quizzes** from your own notes (PDF upload)
- **Automatic weak topic detection** with performance analytics
- **Adaptive study plans** based on exam date and daily availability
- **Instant answers** to any doubt in simple language
- **Concept explanations** with real-life examples

_Market Impact:_ 250M+ students in India. Personalized tutoring costs ₹50,000+/year → Now free and instant.

---

## 📊 Tech Stack

| Layer              | Technology                                          |
| ------------------ | --------------------------------------------------- |
| **Backend**        | Python 3.11, FastAPI, PostgreSQL, SQLAlchemy, Redis |
| **Frontend**       | React 18, Vite, TailwindCSS, Chart.js               |
| **AI**             | Anthropic Claude API                                |
| **Auth**           | JWT (python-jose)                                   |
| **PDF Processing** | PyMuPDF (fitz)                                      |
| **DevOps**         | Docker, Docker Compose                              |
| **File Upload**    | Multipart form handling                             |

---

## 👥 Team Roles & Responsibilities

### 🎨 **NIKHIL** — Frontend UI

- Login, Register, Dashboard pages
- Notes upload with drag-and-drop
- Quiz interface with timer
- Doubt Solver chat UI
- Concept Explainer page

### 🗄️ **PRANAV** — Backend Core & Database

- FastAPI project setup
- PostgreSQL schema & ORM models
- JWT authentication
- PDF upload & text extraction
- Database design

### 🤖 **KIRTAN** — AI Engine

- Claude API integration
- Quiz generation from notes
- Doubt solving with AI
- Concept explanation engine
- Prompt engineering

### 📈 **PRAHLAD** — Analytics, Performance Tracking & DevOps

- Study plan generation engine
- Performance analytics & weak topic detection
- Trend tracking with Chart.js
- Docker setup
- Deployment & DevOps

---

## 📁 Complete Project Structure

```
edumentor-ai/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── database.py             # DB connection & config
│   ├── models/
│   │   ├── user.py             # User model
│   │   ├── notes.py            # Subject & Notes models
│   │   ├── quiz.py             # QuizSession & Question models
│   │   └── studyplan.py        # StudyPlan model
│   ├── routes/
│   │   ├── auth.py             # Login/Register endpoints (Pranav)
│   │   ├── notes.py            # PDF upload endpoints (Pranav)
│   │   ├── quiz.py             # Quiz endpoints (Kirtan)
│   │   ├── doubt.py            # Doubt solver endpoints (Kirtan)
│   │   ├── explain.py          # Concept explainer endpoints (Kirtan)
│   │   ├── studyplan.py        # Study plan generation (Prahlad) ⭐
│   │   └── performance.py      # Performance tracking (Prahlad) ⭐
│   ├── services/
│   │   ├── claude_service.py   # Claude API wrapper (Kirtan)
│   │   ├── quiz_engine.py      # Quiz logic (Kirtan)
│   │   └── studyplan_engine.py # Study plan engine (Prahlad) ⭐
│   ├── utils/
│   │   ├── pdf_parser.py       # PDF extraction (Pranav)
│   │   └── prompt_templates.py # Claude prompts
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page (Nikhil)
│   │   │   ├── Register.jsx        # Register page (Nikhil)
│   │   │   ├── Dashboard.jsx       # Dashboard (Nikhil)
│   │   │   ├── UploadNotes.jsx     # PDF upload (Nikhil)
│   │   │   ├── QuizPage.jsx        # Quiz interface (Nikhil)
│   │   │   ├── QuizResult.jsx      # Results page (Nikhil)
│   │   │   ├── DoubtSolver.jsx     # Doubt solver (Nikhil)
│   │   │   ├── ConceptExplainer.jsx # Concept explainer (Nikhil)
│   │   │   ├── StudyPlan.jsx       # Study plan display (Prahlad) ⭐
│   │   │   └── Performance.jsx     # Performance analytics (Prahlad) ⭐
│   │   ├── components/
│   │   │   ├── QuestionCard.jsx    # Quiz question component (Nikhil)
│   │   │   ├── Timer.jsx           # Question timer (Nikhil)
│   │   │   ├── TrendChart.jsx      # Performance chart (Prahlad) ⭐
│   │   │   └── WeakTopicsBadge.jsx # Weak topics display (Prahlad) ⭐
│   │   └── services/
│   │       └── api.js             # Axios API client (Nikhil/Prahlad)
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Docker Compose setup (Prahlad) ⭐
├── .env.example            # Environment variables
├── README.md               # This file
└── .gitignore
```

---

## 🛠️ Local Setup Instructions

### Prerequisites

- **Docker & Docker Compose** (easiest)  
  OR
- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **PostgreSQL 15**
- **Redis 7**

### Quick Start (Recommended — Docker)

#### 1️⃣ Clone & Configure

```bash
git clone https://github.com/Pranav-prog-master/Obsidian-Elite
cd edumentor-ai

# Copy environment file
cp .env.example .env

# Edit .env and add your Anthropic API key
# ANTHROPIC_API_KEY=sk-ant-your_key_here
nano .env
```

#### 2️⃣ Start All Services with Docker Compose

```bash
docker-compose up -d
```

This will:

- ✅ Start PostgreSQL (port 5432)
- ✅ Start Redis (port 6379)
- ✅ Build and start FastAPI backend (port 8000)
- ✅ Build and start React frontend (port 5173)

#### 3️⃣ Verify Services

```bash
# Check all containers
docker-compose ps

# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend
```

#### 4️⃣ Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/docs (Swagger UI)
- **Database:** postgres://postgres:password@localhost:5432/edumentor

---

### Manual Setup (Without Docker)

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example ../.env

# Initialize database (run migrations)
# alembic upgrade head

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔍 Prahlad's Specific Work — Performance & Analytics

### Files Created by Prahlad (⭐ marks)

#### Backend

1. **`backend/services/studyplan_engine.py`** ⭐
   - `StudyPlanEngine` class with `generate_plan()` method
   - Claude integration for study plan generation
   - Returns JSON array of daily study tasks with topics, durations, task types

2. **`backend/routes/studyplan.py`** ⭐
   - `POST /studyplan/generate` — Generate personalized study plan
   - `GET /studyplan/{plan_id}` — Retrieve saved plan
   - `GET /studyplan/list/all` — List user's plans
   - Auto-detects weak topics from quiz performance

3. **`backend/routes/performance.py`** ⭐
   - `GET /performance/summary/{subject_id}` — Subject performance overview
   - `GET /performance/all` — All subjects performance
   - `GET /performance/trends/{subject_id}` — Trend data for charts
   - Calculates weak topics (failure rate > 50%)
   - Returns quiz history with scores and percentages

#### Frontend

1. **`frontend/src/pages/StudyPlan.jsx`** ⭐
   - Study plan generation form with date & daily hours input
   - Display generated plan with day-by-day schedule
   - Shows task types (read/practice/revise) with color coding
   - Navigation between form and display

2. **`frontend/src/pages/Performance.jsx`** ⭐
   - Single subject performance analytics
   - Overall performance dashboard (all subjects)
   - Integration with Performance API
   - Study plan generation modal from performance page

3. **`frontend/src/components/TrendChart.jsx`** ⭐
   - React-ChartJS-2 line chart
   - Quiz score trends over time
   - Shows target line (70% benchmark)
   - Responsive and interactive tooltips

4. **`frontend/src/components/WeakTopicsBadge.jsx`** ⭐
   - Visual badge for weak topics
   - Color-coded by failure rate (red/orange/yellow)
   - Shows failure percentage and attempts
   - Severity emoji indicators

#### DevOps & Config

1. **`docker-compose.yml`** ⭐
   - Full stack orchestration (PostgreSQL, Redis, Backend, Frontend)
   - Environment variable configuration
   - Volume management for data persistence
   - Health checks for all services
   - Networks for inter-service communication

2. **`backend/Dockerfile`** ⭐
   - Python 3.11-slim base image
   - Installs build dependencies
   - Manages requirements
   - Exposes port 8000
   - Health check endpoint

3. **`frontend/Dockerfile`** ⭐
   - Node 20-alpine base image
   - npm install & build
   - Vite development server
   - Exposes port 5173

### Key Features Prahlad Implemented

#### 1. **Study Plan Generation**

```
Input:  exam_date, daily_hours, user's subjects, weak topics
Process: Claude creates day-by-day schedule
Output: JSON with date, subject, topic, duration, task_type
```

**Smart Features:**

- Allocates MORE time to weak topics (60-90 min)
- Normal topics get 45-60 min
- Strong topics get 30-45 min
- Considers daily study hours
- Spreads study load across days

#### 2. **Performance Analytics**

```
Tracks:
- Quiz score history (all attempts)
- Average percentage
- Topic-wise performance
- Weak topics (>50% failure rate)
```

**Weak Topic Detection Algorithm:**

```
For each topic across all quiz sessions:
  If (failed_attempts / total_attempts) * 100 > 50%
    → Mark as weak topic
```

#### 3. **Visualization**

- **Trend Chart:** Line graph showing score progression over time
- **Weak Topics Badge:** Color-coded severity indicators
- **Performance Summary:** Grid of key metrics

#### 4. **DevOps Setup**

- One-command startup: `docker-compose up -d`
- Persistent data volumes
- Service health checks
- Clean environment variable handling

---

## 📋 Complete Feature Workflow

### 1. Student Registration & Login

```
User → Register/Login → JWT Token → Stored in localStorage
```

### 2. Subject Creation

```
User → Create Subject (Physics, Chemistry) → Stored in DB
```

### 3. Notes Upload

```
User → Upload PDF → PyMuPDF extracts text → Chunked & stored
```

### 4. Quiz Generation & Taking

```
User → "Generate Quiz" → Claude creates 10 MCQs from notes
→ Display one question with timer
→ Auto-submit when timer ends
→ Show results with explanations
```

### 5. Performance Tracking ⭐ (Prahlad)

```
Backend stores quiz results → Frontend fetches via /performance/summary
→ Calculate weak topics → Display charts & badges
```

### 6. Study Plan Generation ⭐ (Prahlad)

```
User inputs exam date + daily hours
→ Backend identifies weak topics
→ Claude generates personalized day-by-day plan
→ Display on StudyPlan page
```

### 7. Doubt Solving & Concept Explanation

```
User asks question → Claude answers in simple language
→ Include real-life example
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set in `.env`
- [ ] Anthropic API key configured
- [ ] Database migrations run
- [ ] Both frontend & backend tested locally
- [ ] Docker images build successfully

### Deployment Commands

```bash
# Build images
docker-compose build

# Start production
docker-compose up -d

# View logs
docker-compose logs -f

# Scaling example (run 3 backend instances)
docker-compose up -d --scale backend=3
```

### Production Considerations

- Use HTTPS (add SSL certificates)
- Set strong JWT secret key
- Configure CORS for your domain
- Use managed PostgreSQL & Redis (e.g., AWS RDS, Redis Cloud)
- Configure CDN for static files
- Set up CI/CD pipeline

---

## 🧪 Testing

### Backend API Testing

```bash
# Access Swagger UI
http://localhost:8000/docs

# Example API calls:
curl -X POST http://localhost:8000/studyplan/generate \
  -H "Content-Type: application/json" \
  -d '{"exam_date": "2024-06-15", "daily_hours": 6}'

curl -X GET http://localhost:8000/performance/summary/{subject_id}
```

### Frontend Testing

```bash
# Jest + React Testing Library
npm test

# Coverage report
npm test -- --coverage
```

---

## 📱 API Endpoints Summary

### Study Plan Routes (Prahlad) ⭐

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| POST   | `/studyplan/generate`  | Generate new study plan |
| GET    | `/studyplan/{plan_id}` | Get specific plan       |
| GET    | `/studyplan/list/all`  | List all user's plans   |

### Performance Routes (Prahlad) ⭐

| Method | Endpoint                            | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| GET    | `/performance/summary/{subject_id}` | Subject performance summary |
| GET    | `/performance/all`                  | All subjects performance    |
| GET    | `/performance/trends/{subject_id}`  | Trend data for charts       |

---

## 🐛 Troubleshooting

### Docker Issues

```bash
# Containers won't start
docker-compose logs <service_name>

# Port already in use
docker ps  # Check what's running
lsof -i :8000  # Find process on port 8000
kill -9 <PID>

# Rebuild images
docker-compose build --no-cache
```

### Database Issues

```bash
# Connect to PostgreSQL
docker exec -it edumentor_postgres psql -U postgres -d edumentor

# Reset database
docker-compose down -v  # Remove volumes
docker-compose up  # Recreate empty database
```

### API Connection Issues

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend is connecting
Open DevTools → Network tab → Check API calls
```

---

## 📚 API Response Examples

### Study Plan Generation Response

```json
{
  "id": "uuid-string",
  "exam_date": "2024-06-15",
  "plan_items": [
    {
      "date": "2024-05-20",
      "subject": "Physics",
      "topic": "Electromagnetism",
      "duration_minutes": 90,
      "task_type": "read"
    },
    {
      "date": "2024-05-21",
      "subject": "Physics",
      "topic": "Electromagnetism",
      "duration_minutes": 60,
      "task_type": "practice"
    }
  ],
  "created_at": "2024-05-20T10:30:00"
}
```

### Performance Summary Response

```json
{
  "subject_id": "uuid-string",
  "subject_name": "Physics",
  "quiz_history": [
    {
      "session_id": "uuid",
      "date": "2024-05-15T14:20:00",
      "score": 7,
      "total": 10,
      "percentage": 70.0
    }
  ],
  "weak_topics": [
    {
      "topic": "Quantum Mechanics",
      "failure_rate": 62.5,
      "total_attempts": 8
    }
  ],
  "average_percentage": 68.5
}
```

---

## 📞 Support & Contributing

### Report Issues

```bash
# GitHub Issues
Create issue with:
- Clear title
- Reproduction steps
- Expected vs actual behavior
- Environment details
```

### Contributing

```bash
# Fork → Branch → Commit → PR
git checkout -b feature/your-feature
git commit -m "feat: add new feature"
git push origin feature/your-feature
```

---

## 📄 License

MIT License — Free for personal and commercial use

---

## 👨‍🔬 Team Credits

| Role                  | Developer   | Responsibilities                             |
| --------------------- | ----------- | -------------------------------------------- |
| 🔧 DevOps & Analytics | **PRAHLAD** | Performance tracking, study planning, Docker |
| 🎨 Frontend           | **NIKHIL**  | UI/UX, React components, pages               |
| 🗄️ Backend            | **PRANAV**  | Database, auth, API core                     |
| 🤖 AI Engine          | **KIRTAN**  | Claude integration, quiz/doubt/explain       |

---

## ⭐ Quick Links

- [Backend API Docs](http://localhost:8000/docs)
- [Frontend](http://localhost:5173)
- [Anthropic Claude Docs](https://docs.anthropic.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [React Docs](https://react.dev)

---

**Last Updated:** March 2024  
**Version:** 1.0.0  
**Status:** Dev Release 🚀

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
