# Looma Video · MVP Scaffold

Looma Video turns the social clips you already published into a structured, distraction-free course. This repository implements the first slice of the MVP described in [issue #1](https://github.com/sparfenyuk/looma-video/issues/1):

- Next.js (App Router) application with a marketing landing page, creator dashboard skeleton, and public course preview.
- MongoDB data model expressed via Prisma, covering creators, link assets, courses, lessons, payments, and background jobs.
- REST endpoints for link ingestion and course composition, wired to Prisma services and BullMQ queues.
- Node.js worker entry point ready to process ingestion, transcript, and summarisation jobs against Redis queues.

The goal is to provide an end‑to‑end baseline that reflects the product spec so that subsequent tickets can deepen functionality instead of repeating scaffolding work.

## Tech Stack

| Layer                | Tooling                                                                |
| -------------------- | ---------------------------------------------------------------------- |
| Web app / API        | [Next.js 16](https://nextjs.org/) · TypeScript · App Router            |
| Data access          | [Prisma](https://www.prisma.io/) (MongoDB provider)                    |
| Background jobs      | [BullMQ](https://docs.bullmq.io/) on Redis via `ioredis`               |
| Styling              | Tailwind CSS v4 (inline theme)                                         |
| Validation           | [Zod](https://zod.dev/)                                                |
| Utilities            | `nanoid`, custom logger helpers                                        |

## Project Structure

```
├─ prisma/                 # Prisma schema (Mongo provider)
├─ src/
│  ├─ app/
│  │  ├─ api/              # Next.js Route Handlers (REST endpoints)
│  │  ├─ courses/[slug]/   # Public course preview page
│  │  ├─ dashboard/        # Creator dashboard skeleton
│  │  └─ page.tsx          # Marketing / product overview
│  ├─ components/          # Shared UI primitives (Card, Button, Badge)
│  ├─ lib/                 # Env parsing, Prisma client, helpers
│  ├─ server/services/     # Domain logic (links, course composer, creators)
│  └─ server/workers/      # Redis connection + queue helpers
├─ worker/index.ts         # BullMQ worker bootstrap
├─ .env.example            # Environment variables reference
└─ README.md
```

## Environment variables

Duplicate `.env.example` → `.env` and populate values:

- `DATABASE_URL` – MongoDB connection string (Prisma uses the Mongo provider).
- `REDIS_URL` – Redis instance for BullMQ queues.
- `NEXT_PUBLIC_APP_URL`, `AUTH_*` – used later for auth and branding.
- External service keys (OpenAI/Anthropic, Stripe, S3) are optional for now but placeholders are provided.

## Commands

```bash
# Install dependencies
npm install

# Run the Next.js web app (marketing + dashboard + API routes)
npm run dev

# Start the background worker locally (requires Redis)
npm run worker:dev

# Sync the Prisma schema to Mongo (development only)
npm run db:push

# Type check & lint
npm run typecheck
npm run lint
```

## API Overview

| Endpoint                | Method | Description                                      |
| ----------------------- | ------ | ------------------------------------------------ |
| `/api/health`           | GET    | Lightweight heartbeat check.                     |
| `/api/links/ingest`     | POST   | Accepts `{ urls: string[] }`, stores LinkAssets, queues ingestion jobs. |
| `/api/links/:id`        | GET    | Fetch metadata for a previously ingested link.   |
| `/api/courses/compose`  | POST   | Accepts `{ linkAssetIds[], title? }`, creates a draft Course with modules/lessons. |

> ⚠️ The ingestion and course composition endpoints currently operate against the demo creator seeded by `ensureDemoCreator()`. This keeps the scaffold usable without a full auth layer.

## Background Worker

The worker connects to BullMQ queues when `REDIS_URL` is defined. Each queue handles a distinct stage:

- `link_ingest` → normalizes + enriches metadata for each social link.
- `transcript_fetch` → stubbed transcript hydration (ready for real integrations).
- `llm_summarize` → updates lesson summaries; currently deterministic placeholders.
- `course_compose` → reserved for future refinements post draft creation.

You can launch the worker locally with `npm run worker:start` once Redis is available.

## Next Steps

The scaffold leaves clear hooks for upcoming tickets:

1. Connect better-auth for creator sign-in and viewer access control.
2. Replace placeholder transcript/summary logic with actual API integrations.
3. Flesh out the dashboard editor (drag/reorder, branding controls) and publish flow.
4. Wire up Stripe Checkout, payment webhooks, and viewer gating for paid courses.
5. Add observability: structured logging sinks, queue depth metrics, and job dashboard.

With these foundations in place the repository reflects the architecture from the MVP spec, enabling focused, incremental progress on the remaining capabilities.
