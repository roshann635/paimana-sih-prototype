"""
Database Session Management (backend/app/database/session.py)
Configures SQLite / PostgreSQL connection engine and session factory.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.app.database.schema import Base

# Default to SQLite local database file; automatically switches if DATABASE_URL is set
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/paimana.db"))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

DEFAULT_SQLITE_URL = f"sqlite:///{DB_PATH}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE_URL)

# SQLite requires check_same_thread=False for FastAPI concurrency
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes all database tables defined in Base metadata."""
    Base.metadata.create_all(bind=engine)
    print(f"Database initialized at: {DATABASE_URL}")

def get_db():
    """FastAPI dependency for yielding database session with auto-close."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
