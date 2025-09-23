import os
from dotenv import load_dotenv

# Load environment variables from a .env file if present
load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:Success%402025@localhost:5432/identity_mirror")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
