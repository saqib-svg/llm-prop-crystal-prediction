import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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

    const inputText =
      typeof body === "object" &&
      body !== null &&
      (typeof (body as any).input === "string" || typeof (body as any).input_text === "string")
        ? ((body as any).input ?? (body as any).input_text).trim()
        : "";

    if (!inputText) {
      return NextResponse.json({ error: "input is required." }, { status: 400 });
    }

    const fastApiResponse = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: inputText }),
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
      if (!isSupabaseConfigured) {
        return NextResponse.json(
          { error: "Supabase environment variables are not configured." },
          { status: 500 },
        );
      }

      const { error } = await supabase.from("history").insert([
        {
          user_email: userEmail,
          input_text: inputText,
          output,
        },
      ]);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ output });
  } catch (error) {
    console.error("Prediction route error:", error);
    return NextResponse.json({ error: "Prediction failed." }, { status: 500 });
  }
}
