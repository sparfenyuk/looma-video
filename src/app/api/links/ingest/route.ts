import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureDemoCreator } from "@/server/services/creator-service";
import { ingestLinks } from "@/server/services/link-service";

const requestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(50),
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
    const assets = await ingestLinks(creatorId, parsed.data.urls);

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Failed to ingest links", error);
    return NextResponse.json({ error: "Unable to ingest links" }, { status: 500 });
  }
}
