"use client"

import { useEffect, useState, useMemo } from "react"
import PairCard from "@/components/PairCard"
import AccountStrip from "@/components/AccountStrip"

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

const SIGNAL_API = "/api/signals"

export default function Page() {

  const [signals, setSignals] = useState<any>({})
  const [pairData, setPairData] = useState<any>({})
  const [openPair, setOpenPair] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [uiSignals, setUiSignals] = useState<any>({})
  const [netState, setNetState] = useState("FLAT")

  // ======================================================
  // TELEGRAM MINIAPP GUARD
  // ======================================================
  useEffect(() => {

    const tg = (window as any)?.Telegram?.WebApp

    if (tg && tg.initDataUnsafe?.user?.id) {

      tg.ready()
      tg.expand()
      tg.disableVerticalSwipes()
      tg.setBackgroundColor("#000000")
      tg.setHeaderColor("#000000")

      document.documentElement.style.height = "100%"
      document.body.style.minHeight = "100vh"
      document.body.style.overscrollBehavior = "none"
      document.body.style.touchAction = "pan-y"
      setAuthorized(true)

    } else {
      console.log("Blocked: Not opened via Telegram")
      setAuthorized(false)
    }

  }, [])

  // ======================================================
  // GLOBAL LIVE SIGNALS LOOP (LIGHTWEIGHT)
  // ======================================================
  useEffect(() => {

    if (!authorized) return

    async function loadSignals() {

      try {

        const res = await fetch(SIGNAL_API)
        const json = await res.json()

        const incoming = json?.signals ? json.signals : json

        setSignals((prev: any) => {

          if (JSON.stringify(prev) === JSON.stringify(incoming)) {
            return prev
          }

          return incoming
        })

      } catch (err) {
        console.log("Signal fetch error", err)
      }
    }

    loadSignals()

    const interval = setInterval(loadSignals, 2500)

    return () => clearInterval(interval)

  }, [authorized])

  // ======================================================
  // 🔥 TICK STABILIZER (UI SMOOTHING)
  // ======================================================
  useEffect(() => {

    const timer = setTimeout(() => {
      setUiSignals(signals)
    }, 120) // institutional sweet spot

    return () => clearTimeout(timer)

  }, [signals])

  // ======================================================
  // 🔥 OPEN PAIR REFRESH LOOP
  // ======================================================
  useEffect(() => {

    if (!authorized || !openPair) return

    const pairKey = openPair

    let cancelled = false

    async function refreshOpenPair() {

      try {

        const res = await fetch(`/api/signals?pair=${pairKey}`)
        const json = await res.json()

        if (cancelled) return

        setPairData((prev: any) => ({
          ...prev,
          [pairKey]: json
        }))

      } catch (err) {
        console.log("Refresh pair error", err)
      }
    }

    refreshOpenPair()

    const interval = setInterval(refreshOpenPair, 6000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }

  }, [authorized, openPair])

  // ======================================================
  // LAZY LOAD PAIR DATA
  // ======================================================
  async function loadPair(pair: string) {

    if (pairData[pair]) return

    try {

      const res = await fetch(`/api/signals?pair=${pair}`)
      const json = await res.json()

      setPairData((prev: any) => ({
        ...prev,
        [pair]: json
      }))

    } catch (err) {
      console.log("Pair load error", err)
    }
  }

  // ======================================================
  // TOGGLE HANDLER
  // ======================================================
  function togglePair(pair: string) {
    setOpenPair(prev => {

      const next = prev === pair ? null : pair

      if (next) {
        if ("requestIdleCallback" in window) {
          (window as any).requestIdleCallback(() => loadPair(next))
        } else {
          setTimeout(() => loadPair(next), 0)
        }
      }

      return next
    })
  }

  // ======================================================
  // ACCESS BLOCK SCREEN
  // ======================================================
  if (!authorized) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-xl font-bold">FXHEDZ</div>
          <div className="text-neutral-400 text-sm">
            Open via Telegram Bot to access signals
          </div>
        </div>
      </main>
    )
  }

  // ======================================================
  // 🔥 BUILD GLOBAL PAIRS DATA (FOR ACCOUNT STRIP)
  // ======================================================
const pairsData = useMemo(() => {

  return PAIRS.map((pair) => {

    const signal = uiSignals?.[pair]
    const extra = pairData?.[pair] || {}

    return {
      pair,
      signal,
      orders: extra?.orders || []
    }
  })

}, [uiSignals, pairData])

  // ======================================================
  // MAIN UI
  // ======================================================
  return (
    <main
      className={`min-h-screen text-white p-4 space-y-3 transition-colors duration-500
    ${netState === "NET BUY" ? "bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),#000000)]" : ""}
    ${netState === "NET SELL" ? "bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.08),#000000)]" : ""}
    ${netState === "HEDGED" ? "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.06),#000000)]" : ""}
    ${netState === "FLAT" ? "bg-black" : ""}
  `}
    >

      {/* 🔥 GLOBAL ACCOUNT RISK STRIP */}
      <AccountStrip
        pairs={pairsData}
        onStateChange={setNetState}
      />

      {PAIRS.map((pair) => {

        const signal = uiSignals?.[pair]
        const extra = pairData?.[pair] || {}

        return (
          <PairCard
            key={pair}
            pair={pair}
            open={openPair === pair}
            direction={signal?.direction}
            signal={signal}
            history={extra?.history}
            orders={extra?.orders}   // ✅ ADDED
            performance={extra?.performance}
            notes={extra?.notes}
            onToggle={() => togglePair(pair)}
          />
        )
      })}

    </main>
  )
}
