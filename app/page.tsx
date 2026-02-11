"use client"

import { useEffect, useState } from "react"
import PairCard from "@/components/PairCard"

const PAIRS = [
  "XAUUSD",
  "BTCUSD",
  "ETHUSD",
  "EURUSD",
  "AUDUSD",
  "GBPUSD",
  "USDJPY",
  "GBPJPY",
  "USDCHF",
  "USDCAD"
]

// 🔑 IMPORTANT
// Use the script.google.com URL — NOT googleusercontent
const API_URL =
  "https://script.google.com/macros/s/AKfycbyY5Ku5nk6gZRMxffgfseVnYCUywlQYQM8qEfFzZjLLYEpV-g7cdCjrH6a3sK8IGnGt/exec?key=HEDZ2026"

export default function Page() {
  const [openPair, setOpenPair] = useState<string | null>(null)
  const [signals, setSignals] = useState<any>({})

  // ✅ Telegram Mini App setup
  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      tg.disableVerticalSwipes()
      document.body.style.backgroundColor =
        tg.themeParams?.bg_color || "#000"
    }
  }, [])

  // ✅ Load signals from Apps Script
  useEffect(() => {
    async function loadSignals() {
      try {
        const res = await fetch(API_URL)
        const json = await res.json()
        setSignals(json)
      } catch (err) {
        console.log("Signal fetch error", err)
      }
    }

    loadSignals()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white p-4 space-y-3">
      <h1 className="text-xl font-bold">FxTrilogy Signals</h1>

      {PAIRS.map(pair => (
        <PairCard
          key={pair}
          pair={pair}
          direction={signals[pair]?.direction}
          open={openPair === pair}
          onToggle={() =>
            setOpenPair(openPair === pair ? null : pair)
          }
        />
      ))}
    </main>
  )
}
