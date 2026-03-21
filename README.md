# Obsidian Elite (EduMentor AI)

AI-powered study companion for exam preparation with personalized quizzes, adaptive study plans, doubt solving, concept explanation, and performance analytics.

## Overview

Obsidian Elite helps students prepare smarter by generating learning activities from their own notes and adapting recommendations based on real quiz performance.

### Core Capabilities

- AI quiz generation from uploaded PDF notes
- Instant doubt solving and concept explanation
- Weak-topic detection from quiz history
- Personalized study plan generation by exam date and available daily hours
- Performance trends and subject-level analytics

## Tech Stack

| Layer       | Technology                                          |
| ----------- | --------------------------------------------------- |
| Backend     | Python 3.11, FastAPI, SQLAlchemy, PostgreSQL, Redis |
| Frontend    | React 18, Vite, TailwindCSS, Chart.js               |
| AI          | Anthropic Claude API                                |
| Auth        | JWT (`python-jose`)                                 |
| PDF Parsing | PyMuPDF (`fitz`)                                    |
| DevOps      | Docker, Docker Compose                              |

## Repository Structure

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
├── TEAM_GUIDE.md
└── README.md
```

## Key Modules

### Backend

- `routes/studyplan.py`: study plan APIs
- `routes/performance.py`: analytics and trend APIs
- `services/studyplan_engine.py`: adaptive study plan logic

### Frontend

- `pages/StudyPlan.jsx`: plan generation and visualization
- `pages/Performance.jsx`: performance dashboard
- `components/TrendChart.jsx`: score trend chart
- `components/WeakTopicsBadge.jsx`: weak-topic severity badges

## Getting Started

### Prerequisites

- Docker and Docker Compose (recommended)
- OR Python 3.11+, Node.js 18+, PostgreSQL 15, Redis 7

### Quick Start (Docker)

```bash
git clone https://github.com/Pranav-prog-master/Obsidian-Elite
cd Obsidian-Elite

# Create local environment file
cp .env.example .env

# Start full stack
docker-compose up -d
```

### Service URLs

- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs

### Useful Docker Commands

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
docker-compose build --no-cache
docker-compose down -v
```

## Manual Setup (Without Docker)

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

## Main API Endpoints

### Study Plan

| Method | Endpoint               | Purpose                      |
| ------ | ---------------------- | ---------------------------- |
| POST   | `/studyplan/generate`  | Generate a personalized plan |
| GET    | `/studyplan/{plan_id}` | Fetch a specific plan        |
| GET    | `/studyplan/list/all`  | List all user plans          |

### Performance

| Method | Endpoint                            | Purpose                            |
| ------ | ----------------------------------- | ---------------------------------- |
| GET    | `/performance/summary/{subject_id}` | Subject-level summary              |
| GET    | `/performance/all`                  | Multi-subject performance overview |
| GET    | `/performance/trends/{subject_id}`  | Chart trend data                   |

## How Personalization Works

- Quiz attempts are tracked per subject and topic.
- Topics with failure rate above 50% are tagged as weak.
- Study plan generation prioritizes weak topics with higher time allocation.

## Troubleshooting

### Containers not starting

```bash
docker-compose logs <service_name>
docker-compose ps
```

### Backend health check

```bash
curl http://localhost:8000/health
```

### Reset local database volumes

```bash
docker-compose down -v
docker-compose up -d
```

## Team

| Role                               | Owner   |
| ---------------------------------- | ------- |
| Frontend                           | Nikhil  |
| Backend Core & Database            | Pranav  |
| AI Engine                          | Kirtan  |
| Analytics, Study Planning & DevOps | Prahlad |

## Contributing

1. Create a branch: `git checkout -b feature/your-feature`
2. Commit with clear messages
3. Open a pull request with a short summary and test notes

## License

MIT License

---

Last updated: March 2026
