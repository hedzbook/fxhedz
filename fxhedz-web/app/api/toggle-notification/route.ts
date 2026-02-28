import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(req: NextRequest) {

  let email: string | null = null

  // ============================
  // ANDROID (JWT)
  // ============================
  const jwtUser = verifyAccessToken(req)
  if (jwtUser && typeof jwtUser === "object") {
    email = (jwtUser as any).email
  }

  // ============================
  // WEB / TELEGRAM (SESSION)
  // ============================
  if (!email) {
    const session = await getServerSession(authOptions)
    email = session?.user?.email || null
  }

  if (!email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { app_instruments } = await req.json()

  if (!Array.isArray(app_instruments)) {
    return NextResponse.json(
      { error: "Invalid instruments" },
      { status: 400 }
    )
  }

  const sanitized = app_instruments
    .map((p: string) => String(p).toUpperCase().trim())
    .filter(Boolean)

  // ============================
  // PLATFORM DETECTION
  // ============================
  const platform =
    req.cookies.get("fx_platform")?.value || "web"

  let payload: any = { email }

  if (platform === "telegram") {
    payload.telegram_instruments = sanitized
  } else if (platform === "android") {
    payload.app_instruments = sanitized
  } else {
    payload.web_instruments = sanitized
  }

  const res = await fetch(process.env.GAS_AUTH_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: "GAS update failed" },
      { status: 500 }
    )
  }

  const data = await res.json()

  return NextResponse.json(data)
}