import { NextResponse } from "next/server";
import { z } from "zod";
import { composeCourseDraft } from "@/server/services/course-composer";
import { ensureDemoCreator } from "@/server/services/creator-service";

const requestSchema = z.object({
  linkAssetIds: z.array(z.string().min(4)).min(1),
  title: z.string().min(3).max(120).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const { creatorId } = await ensureDemoCreator();
    const course = await composeCourseDraft({
      creatorId,
      linkAssetIds: parsed.data.linkAssetIds,
      title: parsed.data.title,
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Failed to compose course", error);
    return NextResponse.json({ error: "Unable to compose course" }, { status: 500 });
  }
}
