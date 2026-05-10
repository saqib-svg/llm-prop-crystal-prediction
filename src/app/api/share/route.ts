import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/serverAuth";
import { shareCreateSchema, zodErrorMessage } from "@/lib/validation";

function createSlug() {
  return randomBytes(8).toString("base64url");
}

export async function POST(request: Request) {
  const { user, response } = await requireCurrentUser();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = shareCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  }

  const prediction = await prisma.predictionHistory.findFirst({
    where: {
      id: parsed.data.predictionId,
      userId: user.id,
    },
    select: {
      id: true,
      prompt: true,
    },
  });

  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found." }, { status: 404 });
  }

  const existing = await prisma.sharedPrediction.findFirst({
    where: {
      predictionId: prediction.id,
      userId: user.id,
    },
    select: {
      shareToken: true,
      title: true,
    },
  });

  const origin = new URL(request.url).origin;

  if (existing) {
    return NextResponse.json({
      slug: existing.shareToken,
      url: `${origin}/share/${existing.shareToken}`,
      title: existing.title,
    });
  }

  const shared = await prisma.sharedPrediction.create({
    data: {
      title: parsed.data.title ?? prediction.prompt.slice(0, 80),
      predictionId: prediction.id,
      shareToken: createSlug(),
      userId: user.id,
    },
    select: {
      shareToken: true,
      title: true,
    },
  });

  return NextResponse.json({
    slug: shared.shareToken,
    url: `${origin}/share/${shared.shareToken}`,
    title: shared.title,
  });
}
