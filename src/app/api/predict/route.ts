import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function POST(request: Request) {
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
    "input_text" in body &&
    typeof body.input_text === "string"
      ? body.input_text.trim()
      : "";

  if (!inputText) {
    return NextResponse.json({ error: "input_text is required." }, { status: 400 });
  }

  const fastApiResponse = await fetch("http://localhost:8000/predict-bandgap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: inputText }),
  });

  const data = await fastApiResponse.json();

  if (!fastApiResponse.ok) {
    return NextResponse.json(data, { status: fastApiResponse.status });
  }

  const prediction = Number(data.prediction);

  if (Number.isNaN(prediction)) {
    return NextResponse.json({ error: "Invalid prediction value from FastAPI." }, { status: 500 });
  }

  const output: {
    label: string;
    band_gap_ev: number;
    confidence: number;
    source: "fastapi";
  } = {
    label: prediction >= 2.5 ? "wide-gap semiconductor" : "narrow-gap semiconductor",
    band_gap_ev: prediction,
    confidence: 0.82,
    source: "fastapi",
  };

  if (userEmail) {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 },
      );
    }

    const { error } = await supabase.from("history").insert({
      user_email: userEmail,
      input_text: inputText,
      output,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ output });
}
