import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const GAS_BASE =
  "https://script.google.com/macros/s/AKfycby55ye_dTtWJ-QILNYJIaXWv74_n7n0muh3U--sBl7yowMlp1FzESOokWqeHI75U5_R/exec"

export async function GET(req: NextRequest) {

  // 1️⃣ LOGIN REQUIRED
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Login required" },
      { status: 401 }
    )
  }

  // 2️⃣ DEVICE REQUIRED
  const deviceId = req.cookies.get("fx_device")?.value
  const fingerprint = req.nextUrl.searchParams.get("fingerprint") || ""

  if (!deviceId || !fingerprint) {
    return NextResponse.json(
      { error: "No device" },
      { status: 401 }
    )
  }

  try {

    const pair = req.nextUrl.searchParams.get("pair")

    const url = pair
      ? `${GAS_BASE}?secret=${process.env.GAS_SECRET}&pair=${pair}&device_id=${deviceId}&fingerprint=${encodeURIComponent(fingerprint)}`
      : `${GAS_BASE}?secret=${process.env.GAS_SECRET}&device_id=${deviceId}&fingerprint=${encodeURIComponent(fingerprint)}`

    const res = await fetch(url, { cache: "no-store" })
    const json = await res.json()

    if (!json?.active) {
      return NextResponse.json(
        { error: "Subscription required" },
        { status: 403 }
      )
    }

    return NextResponse.json(json)

  } catch {
    return NextResponse.json(
      { error: "Signal fetch failed" },
      { status: 500 }
    )
  }
}