# Identity Mirror Agent - Backend (FastAPI)

## Setup

1. Create a virtualenv and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Copy environment file and edit values:

```bash
cp .env.example .env
```

3. Ensure Postgres is running and database exists (default: `identity_mirror`). Update `DATABASE_URL` if needed.

4. Run the API:

```bash
uvicorn app.main:app --reload --port 8000
```

Health check: http://localhost:8000/health

## Endpoints

- POST `/log` — Create a daily entry with summarization and sentiment
- GET `/summary/{user_id}` — Return last 5 logs with a combined summary
- GET `/reflect/{user_id}` — If ≥5 logs, return reflection and enable mirror mode
- POST `/mirror-chat` — Chat with the mirror self

## Testing

```bash
pytest -q
```

Note: tests set `SKIP_DB_CREATE=1` to avoid table creation during startup.
