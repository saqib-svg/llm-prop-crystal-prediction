import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { runPrediction } from "@/lib/predictions";
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

  const output = await runPrediction(inputText);

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
