import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return new Response("Missing id", { status: 400 })

  const res = await fetch(
    `${process.env.GAS_URL}?secret=${process.env.GAS_SECRET}&image=${id}`
  )

  const buffer = await res.arrayBuffer()

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400"
    }
  })
}