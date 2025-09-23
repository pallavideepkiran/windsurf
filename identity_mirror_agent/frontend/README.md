# Identity Mirror Agent - Frontend (Next.js)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file and set API base:

```bash
cp .env.local.example .env.local
```

3. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Pages

- `/journal` — Write a daily entry
- `/history` — View last 5 logs and combined summary
- `/mirror` — Reflection and mirror chat (unlocks after 5 logs)
