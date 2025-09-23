# Identity Mirror Agent

An MVP that lets users log daily reflections, stores them in Postgres, and—after 5 logs—generates a reflection and enables a "mirror" conversation powered by Anthropic.

## Overview

- Backend: `FastAPI` (Python)
- Frontend: `Next.js` (React)
- Database: `PostgreSQL` via SQLAlchemy
- AI Layer: Anthropic API (summarization + reflection + mirror chat)
- NLP: TextBlob for basic sentiment

## Repository Structure

- `backend/`
  - `app/main.py` — FastAPI app, CORS, and lifespan
  - `app/database.py` — SQLAlchemy engine and session
  - `app/models.py` — `User`, `Log` models
  - `app/schemas.py` — Pydantic schemas
  - `app/routers/logs.py` — API endpoints
  - `app/ai.py` — Anthropic + TextBlob utilities
  - `requirements.txt` — Python dependencies
  - `.env.example` — Example backend environment
  - `tests/` — Minimal API tests
  - `README.md` — Backend instructions
- `frontend/`
  - `pages/` — `index`, `journal`, `history`, `mirror`
  - `components/` — `JournalForm`, `LogList`, `MirrorChat`
  - `.env.local.example` — Example frontend environment
  - `README.md` — Frontend instructions

## Database Schema (MVP)

- `users`: `id`, `name`, `email`
- `logs`: `id`, `user_id`, `text`, `summary`, `sentiment`, `created_at`

Tables are auto-created at startup (MVP). For production, add Alembic migrations.

## Backend API

Base URL: `http://localhost:8000`

- `GET /health`
  - Health check.
- `POST /log`
  - Body: `{ "user_id": number, "text": string }`
  - Stores a log, runs summary + sentiment, returns saved `Log`.
- `GET /summary/{user_id}`
  - Returns the last 5 logs and a combined summary.
  - If Anthropic is unavailable, returns a deterministic fallback.
- `GET /reflect/{user_id}`
  - If user has ≥ 5 logs, returns reflection and `mirror_ready: true`.
  - Otherwise returns `mirror_ready: false` and logs.
  - If Anthropic is unavailable, returns a deterministic fallback reflection.
- `POST /mirror-chat`
  - Body: `{ "user_id": number, "message": string, "history"?: [{role, content}] }`
  - Conversational mirror response.
- `GET /debug/ai`
  - Tiny Anthropic request to verify connectivity. Returns `{ ok: true }` when AI calls work.

## Frontend Pages

Base URL: `http://localhost:3000`

- `/journal`
  - Textarea to submit journal entries to `/log`.
- `/history`
  - Requires explicit User ID; shows last logs and combined summary from `/summary/{user_id}`.
- `/mirror`
  - Requires explicit User ID; loads reflection from `/reflect/{user_id}` and offers chat via `/mirror-chat`.

## Quick Start

Prereqs: Python 3.13 (venv), Postgres, Node 18.17+ (Node 20 recommended)

1) Postgres
- Create DB (default name: `identity_mirror`).
- If needed: `createdb identity_mirror`

2) Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env for DATABASE_URL, ANTHROPIC_API_KEY, FRONTEND_ORIGIN
uvicorn app.main:app --reload --port 8000
```
Health: http://localhost:8000/health

3) Frontend
```bash
cd frontend
# Node >= 18.17.0 required (use nvm to switch if needed)
npm install
cp .env.local.example .env.local
npm run dev
```
Open: http://localhost:3000

## Environment Variables

Backend `.env`:
- `DATABASE_URL` — e.g. `postgresql+psycopg://postgres:password@localhost:5432/identity_mirror`
- `ANTHROPIC_API_KEY` — Anthropic API key (required for real AI output)
- `FRONTEND_ORIGIN` — CORS origin (default `http://localhost:3000`)
- `AI_INSECURE_SSL` — Set to `1` to bypass TLS verification for Anthropic (DEV ONLY)

Frontend `.env.local`:
- `NEXT_PUBLIC_API_BASE` — e.g. `http://localhost:8000`

## Troubleshooting

- Psycopg/psycopg2 build issues on Python 3.13
  - The project uses psycopg v3. Ensure `DATABASE_URL` uses `+psycopg` and that `requirements.txt` does not require psycopg2.
- Pydantic EmailStr error (`email-validator` not installed)
  - Ensure `email-validator` is installed (already in `requirements.txt`).
- Anthropic connection errors / TLS / proxies
  - Verify: `GET http://localhost:8000/debug/ai` returns `{ ok: true }`.
  - Dev bypass: `export AI_INSECURE_SSL=1` then restart the backend.
  - Corporate CA: set `REQUESTS_CA_BUNDLE` and `SSL_CERT_FILE` to your CA PEM.
  - Proxies: set `HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY=localhost,127.0.0.1,api.anthropic.com`.
- Next.js requires Node >= 18.17.0
  - Use `nvm` to `nvm use 20` (or `nvm install 20`).

## Development Notes

- Startup creates tables automatically; migrations recommended for production.
- Anthropic failures are handled gracefully with deterministic fallbacks so endpoints don’t 500.
- Mirror and History pages require explicit User ID entry (no default user).

## Roadmap (Suggested Next Steps)

- Add authentication and per-user sessions.
- Alembic migrations and seeding scripts.
- Richer analytics (themes, trends) and better sentiment/tone classifier.
- Persistent chat history and memory.
- Production-grade logging and observability.
- Docker Compose for Postgres + backend + frontend.

---

If you run into any issues or want enhancements, open an issue or ask for help. Happy reflecting!
