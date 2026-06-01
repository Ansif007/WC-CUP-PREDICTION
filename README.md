# MRF World Cup Prediction Challenge

Mobile-first PWA for an internal MRF football prediction contest. Employees register, admins approve accounts, participants predict match winners, exact scores, and one scorer, and scores roll into overall, daily, and department leaderboards.

## Stack

- Next.js 15 App Router, React, TypeScript
- Tailwind CSS, shadcn-style primitives, Framer Motion
- Auth.js credentials auth with Argon2 PIN hashing
- Prisma ORM with PostgreSQL
- Docker and Docker Compose
- PWA manifest, service worker, install icons, and offline fallback

## Implemented Workflows

- Registration with pending approval
- PIN login for approved users
- Participant route protection
- Admin-only dashboard and APIs
- Match creation, update, delete, and fixture sync endpoint
- Prediction create/edit before kickoff lock
- Result override and scoring recalculation
- Stage multipliers for group, knockout, semifinal, and final matches
- Overall, daily, and department leaderboards
- In-app notifications and mark-all-read
- CSV leaderboard export
- Cron endpoints for prediction locking, warnings, fixture sync, and leaderboard snapshots
- Demo seed data for an end-to-end walkthrough

## Local Setup

1. Copy `.env.example` to `.env`.
2. Set secure values for `NEXTAUTH_SECRET` and `CRON_SECRET`.
3. Start PostgreSQL:

```powershell
docker compose up -d db
```

4. Apply the schema:

```powershell
npx prisma migrate dev
```

5. Seed demo data:

```powershell
npm run prisma:seed
```

6. Start the app:

```powershell
npm run dev
```

Open `http://localhost:3000`.

## Demo Logins

- Admin: `MRF0001` / `1234`
- Participant: `MRF1023` / `1234`
- Participant: `MRF1044` / `1234`

## Cron Endpoints

All cron endpoints require the `x-cron-secret` header to match `CRON_SECRET`.

```powershell
curl -X POST http://localhost:3000/api/cron/lock-predictions -H "x-cron-secret: your-secret"
curl -X POST http://localhost:3000/api/cron/recalculate -H "x-cron-secret: your-secret"
curl -X POST http://localhost:3000/api/cron/fixture-sync -H "x-cron-secret: your-secret"
```

Suggested schedule:

- `lock-predictions`: every 5 minutes
- `recalculate`: after result updates or every 15 minutes during match windows
- `fixture-sync`: daily, plus manually before tournament start

## Football API Integration

`lib/services/football-api.ts` expects a provider response shaped like:

```json
{
  "fixtures": [
    {
      "externalId": "provider-match-id",
      "homeTeam": "Argentina",
      "awayTeam": "Brazil",
      "kickoffAt": "2026-06-15T18:00:00.000Z",
      "stage": "GROUP",
      "stadium": "Lusail Stadium",
      "matchDay": 1
    }
  ]
}
```

If your provider uses a different format, map its response inside `fetchFixturesFromProvider`.

## Deployment

1. Build the image:

```powershell
docker compose build web
```

2. Start services:

```powershell
docker compose up -d
```

3. Run migrations in the deployed environment:

```powershell
docker compose run --rm web npm run prisma:deploy
```

4. Seed only for demo or staging:

```powershell
docker compose run --rm web npm run prisma:seed
```

Production must use strong secrets, HTTPS, durable PostgreSQL storage, and a scheduler for the cron endpoints.

## Validation

```powershell
npm run build
```

The build includes type checking, route compilation, PWA service worker generation, and static/dynamic route validation.
