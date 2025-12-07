import { notFound } from "next/navigation";
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import type { CourseOutline } from "@/types/course";

const demoCourse: CourseOutline = {
  id: "demo-course",
  slug: "demo-course",
  title: "Building a Creator Academy from Short-Form Video",
  subtitle: "A curated path that turns TikToks and Reels into a structured learning journey.",
  coverUrl: undefined,
  isPaid: false,
  currency: "usd",
  modules: [
    {
      id: "m1",
      index: 0,
      title: "Foundations",
      description: "Lay the groundwork for your course with positioning and expectations.",
      lessons: [
        {
          id: "l1",
          moduleId: "m1",
          index: 0,
          title: "Welcome and outcomes",
          summary: "Set learner expectations and highlight the transformation they will see by completing the course.",
          keyPoints: [
            { label: "Position the problem your clips solve" },
            { label: "Clarify who the course is for" },
            { label: "Preview the modules and outcomes" },
          ],
          difficulty: "beginner",
          estMinutes: 5,
        },
        {
          id: "l2",
          moduleId: "m1",
          index: 1,
          title: "Organizing your library",
          summary:
            "Understand how Looma clusters your short-form content by topic and difficulty so you can fill any gaps.",
          keyPoints: [
            { label: "How deduplication works" },
            { label: "Tagging clips for module alignment" },
            { label: "Preparing transcripts for better summaries" },
          ],
          difficulty: "intermediate",
          estMinutes: 8,
        },
      ],
    },
    {
      id: "m2",
      index: 1,
      title: "Deep dives",
      description: "Bundle advanced clips into coherent lessons.",
      lessons: [
        {
          id: "l3",
          moduleId: "m2",
          index: 0,
          title: "Crafting lesson narratives",
          summary: "Learn how the summarizer stitches transcripts into digestible briefs for learners.",
          keyPoints: [
            { label: "Balancing detail with brevity" },
            { label: "Highlighting outcomes and tasks" },
            { label: "Reusing cached LLM outputs" },
          ],
          difficulty: "advanced",
          estMinutes: 7,
        },
      ],
    },
  ],
};

type Params = {
  slug: string;
};

export default function CoursePage({ params }: { params: Params }) {
  const course = params.slug === demoCourse.slug ? demoCourse : null;

  if (!course) {
    notFound();
  }

  return (
    <main className="space-y-8 text-slate-200">
      <header className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/40 p-10 backdrop-blur">
        <Badge variant="outline">Public course preview</Badge>
        <h1 className="text-3xl font-semibold text-white">{course.title}</h1>
        {course.subtitle && <p className="max-w-3xl text-sm text-slate-300">{course.subtitle}</p>}
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span>Modules: {course.modules.length}</span>
          <span>Lessons: {course.modules.reduce((total, module) => total + module.lessons.length, 0)}</span>
          <span>Access: {course.isPaid ? "Paid" : "Free"}</span>
        </div>
      </header>

      <section className="space-y-6">
        {course.modules.map((module) => (
          <Card
            key={module.id}
            title={module.title}
            description={module.description}
            className="bg-slate-900/50 backdrop-blur"
          >
            <ol className="space-y-4">
              {module.lessons.map((lesson) => (
                <li key={lesson.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-white">
                      {module.index + 1}.{lesson.index + 1} {lesson.title}
                    </h3>
                    <span className="text-xs uppercase tracking-wide text-blue-200">
                      {lesson.difficulty?.toUpperCase() ?? "INTERMEDIATE"}
                    </span>
                  </div>
                  {lesson.summary && <p className="mt-2 text-sm text-slate-300">{lesson.summary}</p>}
                  <ul className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                    {lesson.keyPoints.map((point) => (
                      <li key={point.label} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                        {point.label}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </section>
    </main>
  );
}
