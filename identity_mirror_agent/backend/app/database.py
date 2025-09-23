from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import DATABASE_URL

print("DATABASE_URL =", DATABASE_URL)

# Normalize URL to psycopg v3 if needed
normalized_url = DATABASE_URL
if DATABASE_URL.startswith("postgresql+psycopg2://"):
    normalized_url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    # Default bare driver historically maps to psycopg2; force psycopg v3
    normalized_url = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# SQLAlchemy setup
engine = create_engine(normalized_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
