import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const WORKER_API_URL = process.env.WORKER_API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const model =
      typeof body === "object" && body !== null && typeof (body as any).model === "string"
        ? (body as any).model.trim()
        : "bandgap";
    const inputText =
      typeof body === "object" &&
      body !== null &&
      (typeof (body as any).input === "string" || typeof (body as any).input_text === "string")
        ? ((body as any).input ?? (body as any).input_text).trim()
        : "";

    if (!inputText) {
      return NextResponse.json({ error: "input is required." }, { status: 400 });
    }

    const fastApiResponse = await fetch(`${WORKER_API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, input: inputText }),
    });

    let data: unknown;
    try {
      data = await fastApiResponse.json();
    } catch (parseError) {
      const text = await fastApiResponse.text();
      return NextResponse.json(
        { error: "FastAPI response was not valid JSON.", details: text },
        { status: fastApiResponse.ok ? 500 : fastApiResponse.status },
      );
    }

    if (!fastApiResponse.ok) {
      return NextResponse.json(data, { status: fastApiResponse.status });
    }

    const label = typeof (data as any).prediction === "string"
      ? (data as any).prediction
      : String((data as any).prediction ?? "Unknown");
    const bandGap = typeof (data as any).band_gap === "number"
      ? (data as any).band_gap
      : typeof (data as any).prediction === "number"
      ? (data as any).prediction
      : null;

    if (bandGap === null || Number.isNaN(bandGap)) {
      return NextResponse.json({ error: "Invalid band_gap value from FastAPI." }, { status: 500 });
    }

    const output = {
      label,
      band_gap_ev: bandGap,
      confidence: 0.82,
      source: "fastapi",
    } as const;

    if (userEmail) {
      try {
        const user = await prisma.user.findUnique({
          where: { email: userEmail },
        });

        if (user) {
          await prisma.predictionHistory.create({
            data: {
              prompt: inputText,
              result: output,
              userId: user.id,
            },
          });
        }
      } catch (dbError) {
        console.error("Database error saving prediction:", dbError);
        // Don't fail the request if we can't save to database
        // The prediction is still returned to the user
      }
    }

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Prediction route error:", error);
    return NextResponse.json({ error: "Prediction failed." }, { status: 500 });
  }
}
