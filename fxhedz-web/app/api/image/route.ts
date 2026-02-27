import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id")
  if (!id) {
    return new Response("Missing image id", { status: 400 })
  }

  const GAS_URL =
    "https://script.google.com/macros/s/AKfycby55ye_dTtWJ-QILNYJIaXWv74_n7n0muh3U--sBl7yowMlp1FzESOokWqeHI75U5_R/exec"

  const res = await fetch(`${GAS_URL}?image=${id}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    return new Response("Image not found", { status: 404 })
  }

  const buffer = await res.arrayBuffer()

  return new Response(buffer, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=300",
    },
  })
}