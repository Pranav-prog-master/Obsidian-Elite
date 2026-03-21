# 👥 EduMentor AI — Team Development Guide

## Team Members & Responsibilities

### 🎨 NIKHIL — Frontend Lead

**Focus:** User Interface & User Experience

#### Pages to Build:

1. **Login.jsx** — Authentication form
2. **Register.jsx** — User registration
3. **Dashboard.jsx** — Main hub showing subjects and quick actions
4. **UploadNotes.jsx** — Drag-and-drop PDF upload
5. **QuizPage.jsx** — Quiz display with per-question timer
6. **QuizResult.jsx** — Quiz results with explanations
7. **DoubtSolver.jsx** — Chat-style doubt Q&A interface
8. **ConceptExplainer.jsx** — Topic explanation display

#### Components to Build:

- `QuestionCard.jsx` — Individual question display
- `Timer.jsx` — Countdown timer component

---

### 🗄️ PRANAV — Backend Lead

**Focus:** Database Architecture & Core API

#### Key Endpoints:

```
POST   /auth/register       → Register new user
POST   /auth/login          → Login & get JWT
GET    /auth/me             → Get current user
POST   /notes/subjects      → Create subject
GET    /notes/subjects      → List user's subjects
POST   /notes/upload        → Upload PDF file
GET    /notes/subject/{id}  → Get notes for subject
```

---

### 🤖 KIRTAN — AI Engine Lead

**Focus:** Claude API Integration & AI Logic

#### Key Endpoints:

```
POST   /quiz/generate       → Generate quiz from notes
POST   /quiz/submit         → Submit quiz answers
POST   /doubt/ask           → Ask a question
POST   /explain/topic       → Explain a topic
```

---

### 📈 PRAHLAD — Analytics & DevOps Lead

**Focus:** Performance Tracking, Study Planning, Deployment

#### COMPLETED WORK ✅

##### Backend Services:

- ✅ `services/studyplan_engine.py` — Study plan generation using Claude
- ✅ `routes/studyplan.py` — Study plan API endpoints
- ✅ `routes/performance.py` — Performance analytics endpoints

##### Frontend:

- ✅ `pages/StudyPlan.jsx` — Frontend study plan display
- ✅ `pages/Performance.jsx` — Frontend performance dashboard
- ✅ `components/TrendChart.jsx` — Chart.js line chart
- ✅ `components/WeakTopicsBadge.jsx` — Weak topic badges

##### DevOps:

- ✅ `docker-compose.yml` — Full stack orchestration
- ✅ `backend/Dockerfile` — Backend containerization
- ✅ `frontend/Dockerfile` — Frontend containerization

##### Documentation:

- ✅ `README.md` — Comprehensive project documentation
- ✅ `TEAM_GUIDE.md` — This file

### Key API Endpoints (COMPLETED):

```
POST   /studyplan/generate     → Generate personalized study plan
GET    /studyplan/{plan_id}    → Get specific plan
GET    /performance/summary/{subject_id} → Subject analytics
GET    /performance/all        → All subjects performance
GET    /performance/trends/{subject_id}  → Trend data for charts
```

---

## 🚀 Quick Start

### With Docker (Recommended)

```bash
cd edumentor-ai
cp .env.example .env
# Edit .env and add your Anthropic API key
docker-compose up -d
```

Access:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/docs

### Without Docker

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure (COMPLETE)

```
edumentor-ai/
├── backend/
│   ├── main.py                        ✅ Entry point
│   ├── database.py                    ✅ DB setup
│   ├── models/
│   │   ├── user.py                    ✅
│   │   ├── notes.py                   ✅
│   │   ├── quiz.py                    ✅
│   │   └── studyplan.py               ✅
│   ├── routes/
│   │   ├── auth.py                    ✅ (Pranav)
│   │   ├── notes.py                   ✅ (Pranav)
│   │   ├── quiz.py                    (Kirtan)
│   │   ├── doubt.py                   (Kirtan)
│   │   ├── explain.py                 (Kirtan)
│   │   ├── studyplan.py               ✅ (Prahlad)
│   │   └── performance.py             ✅ (Prahlad)
│   ├── services/
│   │   ├── claude_service.py          (Kirtan)
│   │   ├── quiz_engine.py             (Kirtan)
│   │   └── studyplan_engine.py        ✅ (Prahlad)
│   ├── utils/
│   │   ├── pdf_parser.py              ✅ (Pranav)
│   │   └── prompt_templates.py        ✅
│   ├── requirements.txt               ✅
│   └── Dockerfile                     ✅
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudyPlan.jsx          ✅ (Prahlad)
│   │   │   ├── Performance.jsx        ✅ (Prahlad)
│   │   │   ├── Login.jsx              (Nikhil)
│   │   │   ├── Register.jsx           (Nikhil)
│   │   │   ├── Dashboard.jsx          (Nikhil)
│   │   │   ├── UploadNotes.jsx        (Nikhil)
│   │   │   ├── QuizPage.jsx           (Nikhil)
│   │   │   ├── QuizResult.jsx         (Nikhil)
│   │   │   ├── DoubtSolver.jsx        (Nikhil)
│   │   │   └── ConceptExplainer.jsx   (Nikhil)
│   │   ├── components/
│   │   │   ├── TrendChart.jsx         ✅ (Prahlad)
│   │   │   ├── WeakTopicsBadge.jsx    ✅ (Prahlad)
│   │   │   ├── QuestionCard.jsx       (Nikhil)
│   │   │   └── Timer.jsx              (Nikhil)
│   │   └── services/
│   │       └── api.js                 ✅
│   ├── package.json                   ✅
│   └── Dockerfile                     ✅
├── docker-compose.yml                 ✅
├── .env.example                       ✅
├── .gitignore                         ✅
├── README.md                          ✅
└── TEAM_GUIDE.md                      ✅

Legend:
✅ = Completed (Prahlad's work / foundation)
   = To be completed by respective team members
```

---

## 📊 Prahlad's Implementation Details

### Study Plan Generation

**Algorithm:**

```
Input: exam_date, daily_hours, subjects, weak_topics
1. Calculate days until exam
2. For each day:
   - Allocate weak topics: 60-90 min
   - Allocate normal topics: 45-60 min
   - Allocate strong topics: 30-45 min
3. Return day-by-day JSON schedule
```

**Features:**

- Auto-detects weak topics from quiz performance
- Adapts to student's available hours
- Prioritizes weak areas
- Spreads workload evenly

### Performance Analytics

**Weak Topic Detection:**

```
For each topic:
  failure_rate = (failed_attempts / total_attempts) * 100
  If failure_rate > 50%:
    Mark as WEAK
```

**Visualization:**

- Line chart: Score trends over time
- Color-coded badges: Severity indicators
- Performance summary: Key metrics

### Docker Setup

**Services:**

- PostgreSQL 15 (port 5432)
- Redis 7 (port 6379)
- FastAPI Backend (port 8000)
- React Frontend (port 5173)

**Features:**

- One-command startup: `docker-compose up -d`
- Data persistence with volumes
- Health checks for all services
- Environment variable configuration
- Easy scaling for backend

---

## 🧪 Testing Prahlad's Components

### Study Plan Endpoint

```bash
curl -X POST http://localhost:8000/studyplan/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"exam_date": "2024-06-15", "daily_hours": 6}'
```

### Performance Endpoint

```bash
curl -X GET http://localhost:8000/performance/summary/<subject_id> \
  -H "Authorization: Bearer <token>"
```

### Frontend Performance Page

```
Navigate to: http://localhost:5173/performance?subject_id=<id>
```

---

## ✅ Validation Checklist

- [x] All backend routes created
- [x] Frontend pages and components created
- [x] Docker configuration complete
- [x] Environment setup documented
- [x] README with full instructions
- [x] Team guide for collaboration

---

**Status:** Prahlad's Work Complete ✅  
**Next Steps:** Other team members to implement their components

**Quick Summary for Other Team Members:**

1. Database and authentication foundation is ready (Pranav to complete)
2. API client and routes structure ready (Kirtan to add endpoints)
3. Frontend framework ready with Prahlad's performance pages
4. Docker setup ready for one-command deployment
5. All can start building their components in parallel
