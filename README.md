# Obsidian Elite (EduMentor AI)

<<<<<<< HEAD
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

=======
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

>>>>>>> origin/main
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
<<<<<<< HEAD
├── .env.example
=======
>>>>>>> origin/main
├── TEAM_GUIDE.md
└── README.md
```

<<<<<<< HEAD
## Supabase Setup

1. Create a Supabase project.
2. Open **Project Settings → Database**.
3. Copy the connection string and convert it to SQLAlchemy async format:
=======
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
>>>>>>> origin/main

```text
postgresql+asyncpg://postgres.<project-ref>:<db-password>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main

```bash
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
<<<<<<< HEAD
docker-compose down
```

## Run Without Docker
=======
docker-compose build --no-cache
docker-compose down -v
```

## Manual Setup (Without Docker)
>>>>>>> origin/main

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

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main

```bash
curl http://localhost:8000/health
```

<<<<<<< HEAD
## Team

| Area                              | Owner   |
| --------------------------------- | ------- |
| Frontend                          | Nikhil  |
| Backend Core & Database           | Pranav  |
| AI Engine                         | Kirtan  |
| Analytics, Study Planning, DevOps | Prahlad |

## License

MIT
=======
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
>>>>>>> origin/main
