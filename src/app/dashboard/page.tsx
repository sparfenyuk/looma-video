import Link from "next/link";
import { Card } from "@/components/card";
import { Button } from "@/components/button";

const demoLinks = [
  {
    title: "Paste social links",
    description: "Queue ingestion jobs and watch metadata land in MongoDB.",
    href: "/api/links/ingest",
  },
  {
    title: "Compose a draft course",
    description: "Use stored link assets to auto-generate modules and lessons.",
    href: "/api/courses/compose",
  },
];

const checklist = [
  "Connect better-auth with email magic link + Google",
  "Add Redis-backed caching for metadata fetches",
  "Implement drag-and-drop module reordering",
  "Ship Stripe checkout and paid course gating",
];

export default function DashboardPage() {
  return (
    <main className="space-y-10 text-slate-200">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-widest text-blue-200">Creator dashboard</p>
        <h1 className="text-3xl font-semibold text-white">Operate your auto-generated courses</h1>
        <p className="max-w-2xl text-sm text-slate-300">
          This skeleton surfaces the core flows the MVP will offer creators. Today you can trigger ingestion, review course
          drafts, and preview the public viewer. Upcoming iterations layer in auth, payments, and richer analytics.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card
          title="Ingest links"
          description="Kick off background workers by submitting links from any supported platform."
          className="bg-slate-900/60 backdrop-blur"
          footer={
            <Button variant="primary" asChild>
              <Link href="/api/links/ingest">Open ingest endpoint</Link>
            </Button>
          }
        >
          <p className="text-sm text-slate-300">
            POST <code className="font-mono text-xs text-blue-300">/api/links/ingest</code> with a list of URLs. Each URL
            is normalized, deduped, and queued for metadata fetching.
          </p>
        </Card>
        <Card
          title="Compose course"
          description="Generate a draft curriculum using previously ingested link assets."
          className="bg-slate-900/60 backdrop-blur"
          footer={
            <Button variant="secondary" asChild>
              <Link href="/api/courses/compose">Compose course</Link>
            </Button>
          }
        >
          <p className="text-sm text-slate-300">
            This calls the course composer service, clustering clips into modules and lessons with starter summaries.
          </p>
        </Card>
        <Card
          title="Preview public viewer"
          description="Confirm the distraction-free learner experience before publishing."
          className="bg-slate-900/60 backdrop-blur"
          footer={
            <Button variant="ghost" asChild>
              <Link href="/courses/demo-course">View demo course</Link>
            </Button>
          }
        >
          <p className="text-sm text-slate-300">
            Run through a mock course page with summaries, key points, and progress markers to validate the narrative.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card
          title="Execution checklist"
          description="Track what remains to reach production readiness."
          className="bg-slate-900/60 backdrop-blur"
        >
          <ul className="space-y-2 text-sm text-slate-300">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          title="Reference endpoints"
          description="Key REST surfaces for the MVP."
          className="bg-slate-900/60 backdrop-blur"
        >
          <ul className="space-y-3 text-sm text-slate-300">
            {demoLinks.map((link) => (
              <li key={link.title}>
                <p className="font-semibold text-white">{link.title}</p>
                <p className="text-xs text-slate-400">{link.description}</p>
                <Link href={link.href} className="text-xs text-blue-300">
                  {link.href}
                </Link>
              </li>
            ))}
            <li>
              <p className="font-semibold text-white">Queue health</p>
              <p className="text-xs text-slate-400">Monitor background worker state</p>
              <code className="text-xs text-blue-300">link_ingest · transcript_fetch · llm_summarize</code>
            </li>
          </ul>
        </Card>
      </section>
    </main>
  );
}
