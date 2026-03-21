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
