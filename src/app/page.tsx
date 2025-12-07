import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/styles";

const featureHighlights = [
  {
    title: "Link ingestion that understands the platform",
    description:
      "Drop up to 50 Instagram, TikTok, or YouTube URLs and Looma deduplicates, normalizes, and queues metadata fetches automatically.",
    bullets: [
      "URL normalization + creator scoped dedupe",
      "Platform-aware metadata fetch + transcript attempts",
      "Retries with exponential backoff and dead-letter queues",
    ],
  },
  {
    title: "Auto-composed curriculum",
    description:
      "We cluster related clips into themed modules, draft lesson summaries and key points, and leave space for creators to tweak before publish.",
    bullets: [
      "Heuristic grouping by topic, difficulty, and runtime",
      "LLM-backed lesson summaries cached per asset",
      "Course slug + pricing heuristics for rapid publishing",
    ],
  },
  {
    title: "Distraction-free playback",
    description:
      "Embeds stay compliant with platform policies while our viewer chrome surfaces summaries, key points, and progress tracking in a focused layout.",
    bullets: [
      "SEO-friendly App Router + edge caching",
      "Progress markers for authenticated and guest viewers",
      "Branding controls for color, logo, and paid/free toggles",
    ],
  },
];

const pipelineStages = [
  {
    name: "Normalize",
    detail: "Detect platform, extract IDs, and stage job payloads with deterministic hashes.",
  },
  {
    name: "Fetch",
    detail: "Metadata + transcripts through YouTube Data, Instagram oEmbed, or TikTok oEmbed APIs with quota-aware retries.",
  },
  {
    name: "Summarize",
    detail: "Background worker fans out LLM prompts per lesson, caching outputs for repeat compositions.",
  },
  {
    name: "Compose",
    detail: "Course heuristics assemble modules/lessons, ready for creators to approve or edit before publication.",
  },
];

const roadmap = [
  "Stripe checkout → paid course gating and receipts",
  "Creator dashboard with drag-to-reorder modules",
  "Granular analytics: lesson completion funnel + job telemetry",
  "Expanding providers: Vimeo, X video, Shorts, Reels",
];

const prismaSchemaExcerpt = `model link_assets {
  _id             String   @id @map("_id") @db.ObjectId
  creatorId       String   @db.ObjectId
  url             String
  platform        LinkPlatform
  externalId      String
  title           String?
  description     String?
  durationSec     Int?
  status          LinkStatus @default(PENDING)
  fetchedAt       DateTime?
  metadataJson    Json?
}

model courses {
  _id          String   @id @map("_id") @db.ObjectId
  creatorId    String   @db.ObjectId
  slug         String   @unique
  title        String
  subtitle     String?
  isPublished  Boolean  @default(false)
  isPaid       Boolean  @default(false)
  modules      Module[]
  lessons      Lesson[]
}`;

export default function HomePage() {
  return (
    <main className="space-y-28 pb-12 text-slate-200">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-8">
          <Badge>Issue · MVP Foundation</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Transform your short-form videos into structured learning experiences.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Looma ingests the content you have already published, runs it through a background pipeline, and
              produces a distraction-free course viewer with payment, auth, and observability baked in.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-blue-500 px-5 py-2 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
            >
              Explore creator dashboard
            </Link>
            <Link
              href="/api/health"
              className="inline-flex items-center rounded-full border border-slate-700 px-5 py-2 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/40"
            >
              API heartbeat →
            </Link>
          </div>
          <dl className="grid gap-6 sm:grid-cols-3">
            <Stat label="Pipeline latency goal" value="&lt; 2 min" />
            <Stat label="Supported link types" value="YouTube · Instagram · TikTok" />
            <Stat label="Queues" value="link_ingest · transcript_fetch · llm_summarize" />
          </dl>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-blue-500/10">
          <h2 className="text-base font-semibold text-slate-200">System Topology</h2>
          <p className="mt-2 text-sm text-slate-400">
            Single Next.js codebase with MongoDB, Redis-backed workers, and background jobs orchestrating ingestion and
            composition. Deploy as a Docker stack on Hetzner or your preferred VM provider.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            <li>
              <span className="font-medium text-white">App Router</span> — SSR marketing, dashboard, and public viewer
            </li>
            <li>
              <span className="font-medium text-white">Route handlers</span> — ingest, compose, webhooks, auth
            </li>
            <li>
              <span className="font-medium text-white">BullMQ worker</span> — metadata fetch, transcripts, LLM prompts
            </li>
            <li>
              <span className="font-medium text-white">Prisma (Mongo)</span> — creators, link assets, courses, payments
            </li>
          </ul>
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-xs font-mono text-slate-400">
            <p className="text-slate-500">Next steps:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              {roadmap.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <SectionHeading eyebrow="Pipeline" align="center" description="The ingestion + composition flow drives the MVP deliverable.">
          Four-stage background orchestration
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pipelineStages.map((stage, index) => (
            <Card
              key={stage.name}
              title={`${index + 1}. ${stage.name}`}
              description={stage.detail}
              className="h-full bg-slate-900/50 backdrop-blur"
            />
          ))}
        </div>
      </section>

      <section className="space-y-12">
        <SectionHeading
          eyebrow="Feature set"
          align="center"
          description="These are the pillars we target in the first development milestone to ship usable value quickly."
        >
          MVP scope, framed as shippable capabilities
        </SectionHeading>
        <div className="grid gap-6 lg:grid-cols-3">
          {featureHighlights.map((feature) => (
            <Card
              key={feature.title}
              title={feature.title}
              description={feature.description}
              className="h-full bg-slate-900/50 backdrop-blur"
            >
              <ul className="space-y-2 text-sm text-slate-300">
                {feature.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-6">
          <SectionHeading eyebrow="Data model" description="Mongo-friendly Prisma schema with typed relations for creators, link assets, lessons, and payments.">
            Persistence designed for change streams & scale
          </SectionHeading>
          <p className="text-sm leading-7 text-slate-300">
            The schema mirrors the spec: creator-scoped link assets, denormalized modules/lessons optimized for course read
            performance, and a jobs collection to surface background processing telemetry. Indexes keep queries snappy and
            set us up for real-time UI updates via Mongo change streams.
          </p>
          <pre className="max-h-80 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-5 text-xs leading-relaxed text-slate-200">
            <code>{prismaSchemaExcerpt}</code>
          </pre>
        </div>
        <Card
          title="Operational guardrails"
          description="Non-negotiables to keep the MVP resilient from day one."
          className="bg-slate-900/50 backdrop-blur"
        >
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <strong>Structured logs:</strong> correlation IDs on requests + jobs via a shared logger utility.
            </li>
            <li>
              <strong>Rate limits:</strong> better-auth defaults plus middleware hooks per ingest request.
            </li>
            <li>
              <strong>Error handling:</strong> queue retries, lastError persistence on the jobs collection, and
              notifications ready for later webhook wiring.
            </li>
            <li>
              <strong>Cache strategy:</strong> Redis short TTL to protect external API quotas and reuse LLM summaries when
              assets remain unchanged.
            </li>
          </ul>
        </Card>
      </section>

      <section className="space-y-10 rounded-3xl border border-slate-800 bg-slate-900/40 p-10 backdrop-blur">
        <SectionHeading
          eyebrow="Roadmap"
          description="Sequence the work so we can learn from real creators quickly, while keeping escape hatches for future depth."
          align="center"
        >
          Minimum viable path to launch
        </SectionHeading>
        <ol className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
          <TimelineItem step={1}>Repo scaffolding → Prisma schema → auth + dashboard shell</TimelineItem>
          <TimelineItem step={2}>Link ingestion + metadata persistence + simple viewer</TimelineItem>
          <TimelineItem step={3}>LLM summaries + auto course composition heuristics</TimelineItem>
          <TimelineItem step={4}>Editor polish, publish flows, and web player UX</TimelineItem>
          <TimelineItem step={5}>Progress sync + Stripe checkout + webhook gating for paid courses</TimelineItem>
          <TimelineItem step={6}>Observability pass, rate-limits, error handling, job inspector</TimelineItem>
        </ol>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="primary" asChild>
            <Link href="/dashboard">Open dashboard skeleton</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="https://api.github.com/repos/sparfenyuk/looma-video/issues/1" target="_blank" rel="noreferrer">
              View original MVP spec ↗
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left">
      <dd className="text-2xl font-semibold text-white" dangerouslySetInnerHTML={{ __html: value }} />
      <dt className="mt-1 text-xs uppercase tracking-wide text-slate-500">{label}</dt>
    </div>
  );
}

type TimelineItemProps = {
  step: number;
  children: ReactNode;
};

function TimelineItem({ step, children }: TimelineItemProps) {
  return (
    <li className={timelineClass()}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-blue-400 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-100">
        {step.toString().padStart(2, "0")}
      </span>
      <span className="block text-slate-200">{children}</span>
    </li>
  );
}

function timelineClass() {
  return cn(
    "relative rounded-2xl border border-slate-800 bg-slate-950/50 p-4 pl-16",
    "before:absolute before:left-4 before:top-1/2 before:h-px before:w-6 before:-translate-y-1/2 before:bg-blue-500"
  );
}
