"""FastAPI Application Entry Point"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from database import init_db, close_db
from routes import auth, notes, quiz, doubt, explain, studyplan, performance

# Initialize FastAPI
app = FastAPI(
    title="EduMentor AI",
    description="Personalized AI Study Companion & Exam Prep Engine",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(notes.router)
app.include_router(quiz.router)
app.include_router(doubt.router)
app.include_router(explain.router)
app.include_router(studyplan.router)
app.include_router(performance.router)


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()
    print("✅ Database initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_db()
    print("✅ Database connection closed")


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "service": "EduMentor AI Backend"
    }


# Root endpoint
@app.get("/")
async def read_root():
    return {
        "name": "EduMentor AI",
        "description": "Personalized AI Study Companion",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
