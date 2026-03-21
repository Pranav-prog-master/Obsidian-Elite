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

MIT
