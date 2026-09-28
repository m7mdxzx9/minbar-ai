"""
Minbar AI (منبر الذكاء الاصطناعي)
Main FastAPI Application Entrypoint
Platform for Drafting, Editing & Verifying Islamic Friday Sermons (Khutbahs)
Adhering strictly to Ahl al-Sunnah wal-Jama'ah (Zero-Hallucination Policy)
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import init_database
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite / PostgreSQL database and verified seed corpora
    init_database()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent, authenticated platform for drafting and editing Islamic Friday Sermons adhering strictly to Ahl al-Sunnah wal-Jama'ah creed with zero LLM hallucination.",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(router)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "creed": settings.THEOLOGICAL_CREED,
        "docs_url": "/docs",
        "api_prefix": "/api"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
