import os
import time
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import init_db, close_db
from routes import auth, notes, quiz, doubt, explain, studyplan, performance
from utils.model_switcher import router as admin_router

app = FastAPI(
    title="EduMentor AI API",
    description=(
        "AI-powered personalized study companion for Indian students. "
        "Upload your notes, generate quizzes, solve doubts, and get concept explanations "
        "powered by Claude AI."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "EduMentor Team",
        "email": "team@edumentor.ai",
    },
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start) * 1000)
    print(f"[{request.method}] {request.url.path} -> {response.status_code} ({duration_ms}ms)")
    return response


# ---------------------------------------------------------------------------
# Global exception handler
# ---------------------------------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "An unexpected error occurred", "detail": str(exc)},
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
app.include_router(doubt.router, prefix="/doubt", tags=["Doubt"])
app.include_router(explain.router, prefix="/explain", tags=["Explain"])
app.include_router(studyplan.router)
app.include_router(performance.router)
app.include_router(admin_router)


# ---------------------------------------------------------------------------
# Lifecycle events
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✅ Database initialized")


@app.on_event("shutdown")
async def shutdown_event():
    await close_db()
    print("✅ Database connection closed")


# ---------------------------------------------------------------------------
# Core endpoints
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    return {"status": "ok", "service": "EduMentor AI", "version": "1.0.0"}


@app.get("/", tags=["System"], summary="API root")
async def read_root():
    return {
        "name": "EduMentor AI",
        "description": "Personalized AI Study Companion",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
