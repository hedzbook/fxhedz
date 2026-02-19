import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

  const deviceId = req.cookies.get("fx_device")?.value
  const fingerprint = req.nextUrl.searchParams.get("fingerprint") || ""

  if (!deviceId) {
    return NextResponse.json({ active: false })
  }

  try {

    const res = await fetch(
      `${process.env.GAS_AUTH_URL}?secret=${process.env.GAS_SECRET}&device_id=${deviceId}&fingerprint=${encodeURIComponent(fingerprint)}`,
      { cache: "no-store" }
    )

    const data = await res.json()

    return NextResponse.json(data)

  } catch {

    return NextResponse.json({ active: false })
  }
}
