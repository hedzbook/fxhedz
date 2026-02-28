import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {

  const jwtUser = verifyAccessToken(req)

  if (!jwtUser || typeof jwtUser !== "object") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { pushToken } = await req.json()
  const email = (jwtUser as any).email

  if (!pushToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  await fetch(process.env.GAS_AUTH_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      push_token: pushToken
    })
  })

  return NextResponse.json({ success: true })
}