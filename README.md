# LevelComp — Compensation Intelligence System

> Track C submission for Full Stack Developer Internship Demo Task

A production-grade compensation intelligence system inspired by Levels.fyi, built for the Indian tech market.

**Live URL:** `[your-vercel-url]`
**Backend API:** `[your-railway-url]`

---

## Architecture

```
compensation-intel/
├── backend/          # Node.js + TypeScript + Express + Prisma
│   ├── src/
│   │   ├── index.ts  # All API routes
│   │   └── seed.ts   # 45+ seed salary entries
│   └── prisma/
│       └── schema.prisma
└── frontend/         # Next.js 14 + Tailwind CSS
    └── src/app/
        ├── page.tsx           # Home
        ├── salaries/page.tsx  # Core table
        ├── compare/page.tsx   # Comparison view
        ├── submit/page.tsx    # Data submission
        └── company/[company]/ # Company profile
```

## Core Concept: Levels > Titles

- **L4 at Google ≠ Senior at Infosys** — same title, vastly different comp
- **Total = Base + Bonus + Stock** — never just base
- **Company normalization** — "Google", " google ", "GOOGLE" → all same
- **Duplicate detection** — prevents near-identical entries

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, Zod |
| Database | PostgreSQL + Prisma ORM |
| Deploy | Vercel (frontend) + Railway (backend) |

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ingest-salary` | Submit new salary with full validation |
| GET | `/salaries` | Paginated salary table with filters |
| GET | `/company/:company` | Company stats + level distribution |
| GET | `/compare?ids=a,b,c` | Side-by-side comparison of 2-3 entries |
| GET | `/companies` | All distinct companies |
| GET | `/levels` | All distinct levels |
| GET | `/health` | Health check |

## Edge Cases Handled

- **Missing bonus/stock** → defaults to 0, never null
- **Company variations** → normalized to lowercase + trimmed
- **Duplicate entries** → rejected with 5% salary tolerance check
- **Invalid data** → Zod schema validation with detailed error messages
- **Empty states** → proper UI feedback for no results
- **API errors** → caught and displayed to user

## Local Setup

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit: NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

## Deployment

### Backend → Railway
1. Create new project on railway.app
2. Connect GitHub repo, select `/backend` folder
3. Add env var: `DATABASE_URL` (Railway auto-provisions PostgreSQL)
4. Deploys automatically via `railway.json`
5. After deploy: run seed via Railway CLI or one-time command

### Frontend → Vercel
1. Import GitHub repo on vercel.com
2. Set root directory to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-railway-backend-url`
4. Deploy

## Data Model

```prisma
model Salary {
  id                 String   @id @default(cuid())
  company            String          // normalized
  role               String
  level              String          // L3, L4, L5, SDE1, etc.
  location           String
  experience_years   Int
  base_salary        Float
  bonus              Float   @default(0)
  stock              Float   @default(0)
  total_compensation Float           // always computed: base+bonus+stock
  confidence_score   Float   @default(1.0)
  created_at         DateTime @default(now())
}
```

## Loom Video Talking Points

1. **Why levels matter** — show two "Senior" entries with 4x compensation difference
2. **Architecture walkthrough** — frontend → API → Prisma → PostgreSQL
3. **Ingest flow** — submit a salary, show normalization + duplicate check
4. **Core table** — filter by level, sort by TC, select for compare
5. **Compare page** — select 2 entries, show diffs, winner banner
6. **Edge cases** — try submitting invalid data, duplicate, missing bonus
7. **Company page** — level distribution chart, median vs avg

---

Built with ownership. No hardcoding. Config-agnostic data layer.
