import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/serverAuth";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { user, response } = await requireCurrentUser();
  if (response) return response;

  const { slug } = await context.params;

  const shared = await prisma.sharedPrediction.findFirst({
    where: {
      shareToken: slug,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!shared) {
    return NextResponse.json({ error: "Shared prediction not found." }, { status: 404 });
  }

  await prisma.sharedPrediction.delete({
    where: { id: shared.id },
  });

  return NextResponse.json({ ok: true });
}
