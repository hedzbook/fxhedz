import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { email, app_instruments } = body

    if (!email) {
      return NextResponse.json(
        { error: "Missing email" },
        { status: 400 }
      )
    }

    const res = await fetch(process.env.GAS_AUTH_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        app_instruments
      })
    })

    const data = await res.json()

    return NextResponse.json(data)

  } catch (err) {
    return NextResponse.json(
      { error: "Toggle failed" },
      { status: 500 }
    )
  }
}