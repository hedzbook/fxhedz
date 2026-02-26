import { NextRequest, NextResponse } from "next/server"
import { verifyAccessToken } from "@/lib/jwt"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {

  const jwtUser = verifyAccessToken(req)
  const session = await getServerSession(authOptions)

  let deviceId: string | undefined
  let email: string | undefined

  // Android (JWT)
  if (jwtUser && typeof jwtUser === "object") {
    deviceId = (jwtUser as any).deviceId
    email = (jwtUser as any).email
  }

  // Web (NextAuth)
  if (!email && session?.user?.email) {
    email = session.user.email
  }

  // Device fallback
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
      `${process.env.GAS_AUTH_URL}?secret=${process.env.GAS_SECRET}&email=${encodeURIComponent(email ?? "")}&fingerprint=${encodeURIComponent(fingerprint)}`,
      { cache: "no-store" }
    )

    const data = await res.json()

return NextResponse.json({
  active: data?.plan === "live" || data?.plan === "live+",
  blocked: false,
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