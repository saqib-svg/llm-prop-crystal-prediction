import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PredictionRow = {
  id: string;
  prompt: string;
  result: {
    band_gap_ev?: number;
    [key: string]: unknown;
  };
  createdAt: Date;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return NextResponse.json({ history: [] });
    }

    const predictions = await prisma.predictionHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        prompt: true,
        result: true,
        createdAt: true,
      },
    });

    const history = (predictions as PredictionRow[]).map((p) => ({
      id: p.id,
      user_email: userEmail,
      input_text: p.prompt,
      output: p.result,
      created_at: p.createdAt,
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
