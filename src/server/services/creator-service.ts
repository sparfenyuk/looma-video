import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

const DEMO_EMAIL = "demo@looma.local";
const DEMO_HANDLE = "demo";

export async function ensureDemoCreator() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      email: DEMO_EMAIL,
      name: "Demo Creator",
      image: null,
      accounts: {
        create: {
          plan: "free",
          stripeCustomerId: null,
        },
      },
    },
    update: {},
    include: {
      creatorProfile: true,
    },
  });

  if (user.creatorProfile) {
    return { userId: user.id, creatorId: user.creatorProfile.id };
  }

  const creator = await prisma.creatorProfile.create({
    data: {
      userId: user.id,
      handle: `${DEMO_HANDLE}-${nanoid(6)}`,
      brandColor: "#2563eb",
      logoUrl: null,
      subdomain: null,
    },
  });

  return { userId: user.id, creatorId: creator.id };
}
