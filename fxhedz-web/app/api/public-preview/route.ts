import { NextRequest, NextResponse } from "next/server"

const GAS_BASE =
  "https://script.google.com/macros/s/AKfycby55ye_dTtWJ-QILNYJIaXWv74_n7n0muh3U--sBl7yowMlp1FzESOokWqeHI75U5_R/exec"

function generateFallbackCandles(basePrice: number = 2000) {
  const candles = []
  let price = basePrice || 2000

  const now = Math.floor(Date.now() / 1000)

  for (let i = 40; i > 0; i--) {
    const open = price
    const volatility = basePrice * 0.002

    const close =
      open + (Math.random() - 0.5) * volatility

    const high =
      Math.max(open, close) + Math.random() * volatility * 0.5

    const low =
      Math.min(open, close) - Math.random() * volatility * 0.5

    candles.push({
      time: now - i * 900,
      open,
      high,
      low,
      close
    })

    price = close
  }

  return candles
}

export async function GET(req: NextRequest) {
  try {
    const pair = req.nextUrl.searchParams.get("pair") || "XAUUSD"

    const res = await fetch(
      `${GAS_BASE}?secret=${process.env.GAS_SECRET}&pair=${pair}`,
      { next: { revalidate: 10 } }
    )

    const json = await res.json()

    const basePrice =
      Number(json?.price) ||
      Number(json?.entry) ||
      2000

    const candles =
      json?.candles?.length
        ? json.candles.slice(-40)
        : generateFallbackCandles(basePrice)

    return NextResponse.json({
      direction: json?.direction,
      price: json?.price,
      entry: json?.entry,
      sl: json?.sl,
      tp: json?.tp,
      candles
    })

  } catch {
    return NextResponse.json(
      { error: "Preview unavailable" },
      { status: 500 }
    )
  }
}