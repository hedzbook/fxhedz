import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"

export async function GET(req: NextRequest) {

  const jwtUser = verifyAccessToken(req)

  let deviceId: string | undefined
  let email: string | undefined

  // 🔹 Android (JWT)
if (jwtUser && typeof jwtUser === "object") {
  deviceId = (jwtUser as any).deviceId
  email = (jwtUser as any).email
}

  // 🔹 Web / Telegram fallback
  if (!deviceId) {
    deviceId = req.cookies.get("fx_device")?.value
  }

  const fingerprint =
    req.nextUrl.searchParams.get("fingerprint") || ""

if (!deviceId) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  )
}

  try {

    const res = await fetch(
      `${process.env.GAS_AUTH_URL}?secret=${process.env.GAS_SECRET}
&device_id=${deviceId}
&email=${encodeURIComponent(email ?? "")}
&fingerprint=${encodeURIComponent(fingerprint)}`,
      { cache: "no-store" }
    )

    const data = await res.json()

    return NextResponse.json({
      active: Boolean(data?.active),
      blocked: Boolean(data?.blocked),
      status: data?.plan ?? null,
      expiry: data?.expiry ?? null
    })

  } catch {

    return NextResponse.json({
      active: false,
      blocked: true,
      status: null,
      expiry: null
    })
  }
}