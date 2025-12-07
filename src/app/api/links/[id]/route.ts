import { NextResponse } from "next/server";
import { z } from "zod";
import { getLinkAsset } from "@/server/services/link-service";

const paramsSchema = z.object({
  id: z.string().min(4),
});

export async function GET(_request: Request, context: { params: unknown }) {
  const parsed = paramsSchema.safeParse(context.params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid link id" }, { status: 400 });
  }

  const asset = await getLinkAsset(parsed.data.id);

  if (!asset) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  return NextResponse.json({ asset });
}
