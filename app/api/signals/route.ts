import { NextResponse } from "next/server"

const SIGNAL_API =
  "https://script.google.com/macros/s/AKfycby55ye_dTtWJ-QILNYJIaXWv74_n7n0muh3U--sBl7yowMlp1FzESOokWqeHI75U5_R/exec?key=HEDZ2026"

export async function GET() {

  try {

    const res = await fetch(SIGNAL_API, {
      cache: "no-store"
    })

    const data = await res.json()

    return NextResponse.json(data)

  } catch (e) {

    return NextResponse.json(
      { error: "Signal fetch failed" },
      { status: 500 }
    )

  }

}
