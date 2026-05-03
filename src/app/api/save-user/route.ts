import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("SAVE USER BODY:", body)

    const { email } = body
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!normalizedEmail) {
      return Response.json({ error: "No email" }, { status: 400 })
    }

    console.log("SAVE USER EMAIL:", normalizedEmail)

    const { error } = await supabase
      .from("users")
      .upsert([{ email: normalizedEmail }], { onConflict: "email" })

    if (error) {
      console.error("SUPABASE ERROR:", error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error("Server error:", err)
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}
