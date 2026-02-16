"use client"

import React, { useState, useEffect } from "react"
import GlobalLightChart from "./GlobalLightChart"

type TradeDirection = "BUY" | "SELL" | "HEDGED" | "EXIT" | "--"
type ViewMode = "MIN" | "MID" | "MAX"

type Props = {
  pair: string
  open?: boolean
  viewMode?: ViewMode
  direction?: TradeDirection
  signal?: any
  history?: any[]
  orders?: any[]
  performance?: any
  notes?: string
  onToggle: () => void
}

function PairCard({
  pair,
  open,
  viewMode = "MID",
  onToggle,
  direction,
  signal,
  history,
  orders,
  performance,
  notes
}: Props) {

  const dir: TradeDirection = direction ?? "--"
  const [liveDir, setLiveDir] = useState<TradeDirection>(dir)
  const [tab, setTab] = useState<"market" | "news" | "history" | "performance">("market")
  const [liveOrders, setLiveOrders] = useState<any[]>(orders ?? [])
  const [pnlCache, setPnlCache] = useState<Record<string, number>>({})

  const isMin = viewMode === "MIN"
  const isMax = viewMode === "MAX"
  const expanded = isMax ? true : open

  useEffect(() => setLiveDir(dir), [dir])
  useEffect(() => setLiveOrders(orders ?? []), [orders])
  useEffect(() => { if (expanded) setTab("market") }, [expanded])

  // =========================================================
  // ======================= RENDER ===========================
  // =========================================================

  return (
    <div
      className={`border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300
      ${liveDir === "EXIT"
        ? "bg-gradient-to-b from-neutral-900 to-neutral-950"
        : "bg-[linear-gradient(180deg,rgba(20,20,20,0.9),rgba(0,0,0,0.95))]"
      }`}
    >

      {/* ================= HEADER ================= */}
      <div
        className="p-4 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation()
          if (!isMin && !isMax) onToggle()
        }}
      >

        {/* ================= MIN MODE ================= */}
        {isMin && signal ? (
          <div className="flex items-center justify-between">

            <div className="flex flex-col">
              <div className="font-semibold text-sm">{pair}</div>
              <div className="text-neutral-400 text-[11px]">
                {signal?.lots ?? "-"} LOTS
              </div>
            </div>

            <div className="flex-1 flex justify-center px-4">
              <div className="w-full max-w-[320px]">
                <InlineTradeStrip
                  signal={signal}
                  direction={liveDir}
                />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className={`font-bold text-sm ${
                liveDir === "BUY"
                  ? "text-green-400"
                  : liveDir === "SELL"
                    ? "text-red-400"
                    : liveDir === "HEDGED"
                      ? "text-sky-400"
                      : "text-neutral-500"
              }`}>
                {liveDir}
              </div>

              <div className="text-[11px] font-semibold">
                <span className="text-green-400">{signal?.buys ?? 0}B</span>
                <span className="text-neutral-500 px-1">/</span>
                <span className="text-red-400">{signal?.sells ?? 0}S</span>
              </div>
            </div>

          </div>
        ) : (
          /* ================= MID / MAX HEADER ================= */
          <div className="w-full">

            <div className="flex justify-between items-center">
              <div className="font-semibold">{pair}</div>

              <div className={`font-bold ${
                liveDir === "BUY"
                  ? "text-green-400"
                  : liveDir === "SELL"
                    ? "text-red-400"
                    : liveDir === "HEDGED"
                      ? "text-sky-400"
                      : "text-neutral-500"
              }`}>
                {liveDir}
              </div>
            </div>

            {signal && (
              <div className="flex justify-between items-center text-[11px] mt-1">
                <div className="text-neutral-400 font-semibold tracking-widest">
                  {(signal?.lots ?? "--")} LOTS
                </div>

                <div className="font-semibold tracking-wide">
                  <span className="text-green-400">{signal?.buys ?? 0}B</span>
                  <span className="text-neutral-500 px-1">/</span>
                  <span className="text-red-400">{signal?.sells ?? 0}S</span>
                </div>
              </div>
            )}

            {liveDir !== "EXIT" &&
              (liveDir === "HEDGED" || (signal?.entry && signal?.sl && signal?.tp)) && (
                <TradeBar signal={signal} direction={liveDir} />
              )}

          </div>
        )}

      </div>

      {/* ================= MAX EXPANDED CONTENT ================= */}
      {!isMin && expanded && (
        <div className="border-t border-neutral-800">

          <div className="flex w-full border-b border-neutral-800 text-sm">
            <TabBtn label="Market" active={tab === "market"} onClick={() => setTab("market")} />
            <TabBtn label="News" active={tab === "news"} onClick={() => setTab("news")} />
            <TabBtn label="History" active={tab === "history"} onClick={() => setTab("history")} />
            <TabBtn label="Performance" active={tab === "performance"} onClick={() => setTab("performance")} />
          </div>

          <div className="h-[70dvh] overflow-y-auto p-4 space-y-4">

            <div
              id={`chart_mount_${pair}`}
              className={`w-full h-[280px] rounded-lg bg-neutral-900 ${
                tab === "market" ? "block" : "hidden"
              }`}
            />

            {tab === "market" && (
              <GlobalLightChart
                mountId={`chart_mount_${pair}`}
                signal={signal}
              />
            )}

          </div>

        </div>
      )}

    </div>
  )
}

/* =======================================================
   INLINE STRIP (MIN MODE)
======================================================= */

function InlineTradeStrip({ signal, direction }: any) {
  if (!signal?.entry || direction === "EXIT") return null

  const sl = Number(signal?.sl)
  const tp = Number(signal?.tp)
  const entry = Number(signal?.entry)
  const price = Number(signal?.price || entry)

  if (!sl || !tp) return null

  const entryPercent = 50
  let pricePercent = 50

  if (direction === "BUY") {
    const leftRange = Math.abs(entry - sl)
    const rightRange = Math.abs(tp - entry)
    if (price < entry && leftRange > 0)
      pricePercent = 50 - ((entry - price) / leftRange) * 50
    if (price > entry && rightRange > 0)
      pricePercent = 50 + ((price - entry) / rightRange) * 50
  }

  if (direction === "SELL") {
    const leftRange = Math.abs(tp - entry)
    const rightRange = Math.abs(entry - sl)
    if (price > entry && rightRange > 0)
      pricePercent = 50 - ((price - entry) / rightRange) * 50
    if (price < entry && leftRange > 0)
      pricePercent = 50 + ((entry - price) / leftRange) * 50
  }

  pricePercent = Math.max(0, Math.min(100, pricePercent))

  const isTPside =
    direction === "BUY"
      ? price >= entry
      : price <= entry

  return (
    <div className="flex flex-col items-center">

      <div className="relative w-full h-[10px] text-[8px] text-neutral-400 mb-1">
        <span className="absolute left-0">SL/HEDZ</span>
        <span className="absolute left-1/2 -translate-x-1/2">ENTRY</span>
        <span className="absolute right-0">TP</span>
      </div>

      <div className="relative w-full h-[2px]">

        <div className="absolute inset-0 bg-neutral-800 rounded-full" />

        <div className="absolute left-0 h-[2px] w-1/2 bg-red-500/70" />
        <div className="absolute right-0 h-[2px] w-1/2 bg-green-500/70" />

        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-neutral-500 bg-black" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-neutral-500 bg-black" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-neutral-500 bg-black" />

        <div
          className="absolute top-1/2"
          style={{
            left: `${pricePercent}%`,
            transform: "translate(-50%, -50%)",
            transition: "left 300ms ease"
          }}
        >
          <div className={`absolute -inset-2 rounded-full blur-md ${
            isTPside ? "bg-green-500/30" : "bg-red-500/30"
          }`} />
          <div className={`w-2 h-2 rounded-full ${
            isTPside ? "bg-green-400" : "bg-red-400"
          }`} />
        </div>

      </div>

      <div className="w-full flex justify-between text-[8px] text-neutral-400 mt-1">
        <span>{sl}</span>
        <span>{entry}</span>
        <span>{tp}</span>
      </div>

    </div>
  )
}

/* ======================================================
   TRADE BAR (MID / MAX MODE)
====================================================== */

function TradeBar({
  signal,
  direction
}: {
  signal: any
  direction?: "BUY" | "SELL" | "HEDGED" | "EXIT" | "--"
}) {

  const sl = Number(signal?.sl)
  const tp = Number(signal?.tp)
  const entry = Number(signal?.entry)
  const price = Number(signal?.price || entry)

  if (direction === "EXIT") return null
  if (!sl || !tp || !entry) return null

  const entryPercent = 50
  let pricePercent = 50

  if (direction === "BUY") {
    const leftRange = Math.abs(entry - sl)
    const rightRange = Math.abs(tp - entry)

    if (price < entry && leftRange > 0)
      pricePercent = 50 - ((entry - price) / leftRange) * 50

    if (price > entry && rightRange > 0)
      pricePercent = 50 + ((price - entry) / rightRange) * 50
  }

  if (direction === "SELL") {
    const leftRange = Math.abs(tp - entry)
    const rightRange = Math.abs(entry - sl)

    if (price > entry && rightRange > 0)
      pricePercent = 50 - ((price - entry) / rightRange) * 50

    if (price < entry && leftRange > 0)
      pricePercent = 50 + ((entry - price) / leftRange) * 50
  }

  pricePercent = Math.max(0, Math.min(100, pricePercent))

  const isTPside =
    direction === "BUY"
      ? price >= entry
      : price <= entry

  return (
    <div className="mt-3 select-none">

      <div className="relative h-3 text-[10px] text-neutral-400 mb-1">
        <span className="absolute left-0">SL / HEDZ</span>
        <span
          className="absolute"
          style={{
            left: `${entryPercent}%`,
            transform: "translateX(-50%)"
          }}
        >
          ENTRY
        </span>
        <span className="absolute right-0">TP</span>
      </div>

      <div className="relative h-6 flex items-center overflow-visible">

        <div
          className="absolute h-[2px]"
          style={{
            width: `${entryPercent}%`,
            background:
              "linear-gradient(90deg, rgba(248,113,113,0.8), rgba(239,68,68,0.05))"
          }}
        />

        <div
          className="absolute h-[2px]"
          style={{
            left: `${entryPercent}%`,
            width: `${100 - entryPercent}%`,
            background:
              "linear-gradient(90deg, rgba(34,197,94,0.05), rgba(74,222,128,0.8))"
          }}
        />

        <div className="absolute left-0 w-3 h-3 rounded-full border border-neutral-400" />
        <div
          className="absolute w-3 h-3 rounded-full border border-neutral-400"
          style={{
            left: `${entryPercent}%`,
            transform: "translateX(-50%)"
          }}
        />
        <div className="absolute right-0 w-3 h-3 rounded-full border border-neutral-400" />

        <div
          className="absolute"
          style={{
            left: `${pricePercent}%`,
            transform: "translateX(-50%)",
            transition: "left 380ms cubic-bezier(0.22,1,0.36,1)"
          }}
        >
          <div
            className={`absolute -inset-2 rounded-full blur-md ${
              isTPside ? "bg-green-500/30" : "bg-red-500/30"
            }`}
          />
          <div
            className={`w-3 h-3 rounded-full ${
              isTPside ? "bg-green-400" : "bg-red-400"
            }`}
          />
        </div>

      </div>

      <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
        <span>{sl}</span>
        <span>{entry}</span>
        <span>{tp}</span>
      </div>

    </div>
  )
}

function TabBtn({ label, active, onClick }: any) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`flex-1 py-3 text-center transition-all duration-200 ${
        active
          ? "text-white border-b-2 border-white bg-neutral-900"
          : "text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {label}
    </button>
  )
}

export default React.memo(PairCard)
