import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    // 🔐 Verify JWT
    const jwtUser = verifyAccessToken(req)

    if (!jwtUser || typeof jwtUser !== "object") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const email = (jwtUser as any).email

    // Only accept instruments from body
    const { app_instruments } = await req.json()

    if (!Array.isArray(app_instruments)) {
      return NextResponse.json(
        { error: "Invalid instruments" },
        { status: 400 }
      )
    }

    // Optional: sanitize values (recommended)
    const sanitized = app_instruments
      .map((p: string) => String(p).toUpperCase().trim())
      .filter(Boolean)

    const res = await fetch(process.env.GAS_AUTH_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        app_instruments: sanitized
      })
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "GAS update failed" },
        { status: 500 }
      )
    }

    const data = await res.json()

    return NextResponse.json(data)

  } catch {
    return NextResponse.json(
      { error: "Toggle failed" },
      { status: 500 }
    )
  }
}