export type LessonKeyPoint = {
  label: string;
  detail?: string;
};

export type CourseLesson = {
  id: string;
  moduleId: string;
  linkAssetId?: string;
  index: number;
  title: string;
  summary?: string;
  keyPoints: LessonKeyPoint[];
  difficulty?: "beginner" | "intermediate" | "advanced";
  estMinutes?: number;
};

export type CourseModule = {
  id: string;
  index: number;
  title: string;
  description?: string;
  lessons: CourseLesson[];
};

export type CourseOutline = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  coverUrl?: string;
  isPaid: boolean;
  priceCents?: number;
  currency?: string;
  modules: CourseModule[];
};
