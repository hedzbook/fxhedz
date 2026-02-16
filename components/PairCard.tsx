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

  useEffect(() => {
    if (!signal) return
    if (dir === "HEDGED") return

    const price = Number(signal?.price)
    const tp = Number(signal?.tp)
    const sl = Number(signal?.sl)

    if (!price || !tp || !sl) return

    if (liveDir === "BUY") {
      if (price >= tp || price <= sl) setLiveDir("EXIT")
    }

    if (liveDir === "SELL") {
      if (price <= tp || price >= sl) setLiveDir("EXIT")
    }

  }, [signal?.price, dir, liveDir])

  useEffect(() => {
    if (liveDir === "EXIT") setLiveOrders([])
  }, [liveDir])

  return (
    <div
      className={`border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300
      ${liveDir === "EXIT"
          ? "bg-gradient-to-b from-neutral-900 to-neutral-950 opacity-100 border-neutral-800/60"
          : "bg-[linear-gradient(180deg,rgba(20,20,20,0.9),rgba(0,0,0,0.95))]"
        }`}
    >

      {/* HEADER */}
      <div
        className={`${isMin ? "p-[clamp(6px,1.5vw,12px)]" : "p-[clamp(12px,2vw,20px)]"} cursor-pointer`}
        onClick={(e) => {
          e.stopPropagation()
          if (!isMax) onToggle()
        }}
      >

        {isMin && signal ? (
          <div className="flex items-center justify-between">

            <div className="flex flex-col">
              <div className="font-semibold text-[clamp(12px,1.8vw,18px)]">{pair}</div>
              <div className="text-neutral-400 text-[clamp(10px,1.5vw,14px)]">
                {signal?.lots ?? "-"} LOTS
              </div>
            </div>

            <div className="flex-1 flex justify-center px-[clamp(8px,2vw,16px)]">
              <div className="w-full max-w-[420px]">
                <InlineTradeStrip
                  signal={signal}
                  direction={liveDir}
                />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className={`font-bold text-[clamp(12px,1.8vw,18px)] ${liveDir === "BUY"
                  ? "text-green-400"
                  : liveDir === "SELL"
                    ? "text-red-400"
                    : liveDir === "HEDGED"
                      ? "text-sky-400"
                      : "text-neutral-500"
                }`}>
                {liveDir}
              </div>

              <div className="text-[clamp(10px,1.5vw,14px)] font-semibold">
                <span className="text-green-400">{signal?.buys ?? 0}B</span>
                <span className="text-neutral-500 px-1">/</span>
                <span className="text-red-400">{signal?.sells ?? 0}S</span>
              </div>
            </div>

          </div>
        ) : (

          <div className="w-full">

            <div className="flex justify-between items-center">
              <div className="font-semibold text-[clamp(14px,2vw,20px)]">{pair}</div>

              <div className={`font-bold text-[clamp(14px,2vw,20px)] ${liveDir === "BUY"
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
              <div className="flex justify-between items-center text-[clamp(11px,1.5vw,16px)] mt-1">
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

      {!isMin && expanded && (
        <div className="border-t border-neutral-800">

          <div className="flex w-full border-b border-neutral-800 text-[clamp(12px,1.8vw,16px)]">
            <TabBtn label="Market" active={tab === "market"} onClick={() => setTab("market")} />
            <TabBtn label="News" active={tab === "news"} onClick={() => setTab("news")} />
            <TabBtn label="History" active={tab === "history"} onClick={() => setTab("history")} />
            <TabBtn label="Performance" active={tab === "performance"} onClick={() => setTab("performance")} />
          </div>

          <div className="h-[70dvh] overflow-y-auto overscroll-contain p-[clamp(12px,2vw,20px)] space-y-4">

            {tab === "market" && (
              <>
                <div
                  id={`chart_mount_${pair}`}
                  className="w-full h-[clamp(220px,40vh,360px)] rounded-lg bg-neutral-900"
                />
                <GlobalLightChart
                  mountId={`chart_mount_${pair}`}
                  signal={signal}
                />

                <div>
                  <div className="text-[clamp(12px,1.6vw,16px)] text-neutral-400">Latest Signal</div>
                  <div className="font-bold text-[clamp(16px,2.5vw,24px)]">
                    {signal?.direction || "--"} {signal?.entry || ""}
                  </div>
                  <div className="text-[clamp(12px,1.6vw,16px)] text-neutral-400">
                    SL {signal?.sl || "--"} · TP {signal?.tp || "--"}
                  </div>
                </div>

                <div className="bg-neutral-800 rounded-lg p-[clamp(8px,1.5vw,14px)] text-[clamp(12px,1.6vw,16px)] text-neutral-300">
                  <div className="text-neutral-400 mb-2">Active Orders</div>

                  <div className="max-h-[220px] overflow-y-auto space-y-2">
                    {liveOrders?.length ? liveOrders.map((o, i) => {

                      const key = o.id || `${o.direction}_${o.entry}_${o.time}`
                      const pnl = Number(o.profit ?? 0)
                      const prev = pnlCache[key] ?? pnl

                      const pnlColor =
                        pnl > 0
                          ? "text-green-400"
                          : pnl < 0
                            ? "text-red-400"
                            : "text-neutral-400"

                      let pulseClass = ""
                      if (pnl > prev) pulseClass = "ring-1 ring-green-400/40"
                      if (pnl < prev) pulseClass = "ring-1 ring-red-400/40"

                      return (
                        <div
                          key={key}
                          className={`bg-neutral-900 p-[clamp(8px,1.5vw,14px)] rounded-md flex justify-between transition-all duration-300 ${pulseClass}`}
                        >
                          <div>
                            <div className={`font-semibold ${o.direction === "BUY"
                                ? "text-green-400"
                                : "text-red-400"
                              }`}>
                              {o.direction}
                            </div>
                            <div className="text-neutral-400">
                              ENTRY {o.entry}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-neutral-400">
                              {o.lots}
                            </div>
                            <div className={pnlColor}>
                              {pnl.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )

                    }) : (
                      <div className="text-neutral-500">
                        No open orders
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === "news" && (
              <div className="space-y-3">
                <div className="text-neutral-400 text-[clamp(12px,1.6vw,16px)]">
                  Market Commentary
                </div>
                <div className="bg-neutral-800 rounded-lg p-[clamp(12px,2vw,20px)] text-[clamp(12px,1.6vw,16px)] text-neutral-300">
                  {notes || "Coming Soon"}
                </div>
              </div>
            )}

            {tab === "history" && (
              <div className="space-y-3">
                {history?.length ? history.map((h, i) => (
                  <div key={i} className="bg-neutral-800 p-[clamp(10px,1.8vw,16px)] rounded-lg flex justify-between text-[clamp(12px,1.6vw,16px)]">
                    <div>
                      <div className={`font-semibold ${h.direction === "BUY" ? "text-green-400" : "text-red-400"}`}>
                        {h.direction}
                      </div>
                      <div className="text-neutral-400">
                        {h.entry} → {h.exit}
                      </div>
                    </div>
                    <div className={h.pnl >= 0 ? "text-green-400" : "text-red-400"}>
                      {h.pnl}
                    </div>
                  </div>
                )) : (
                  <div className="text-neutral-500 text-[clamp(12px,1.6vw,16px)]">
                    No history yet
                  </div>
                )}
              </div>
            )}

            {tab === "performance" && (
              <div className="space-y-4">

                <div className="grid grid-cols-2 gap-4 text-[clamp(12px,1.6vw,16px)]">
                  <Metric label="Win Rate"
                    value={performance?.winRate !== undefined ? performance.winRate + "%" : "--"} />
                  <Metric label="Profit Factor"
                    value={performance?.profitFactor ?? "--"} />
                </div>

                <div className="space-y-3 text-[clamp(12px,1.6vw,16px)]">
                  <Stat label="Total Trades" value={performance?.trades} />
                  <Stat label="Wins" value={performance?.wins} />
                  <Stat label="Losses" value={performance?.losses} />
                  <Stat label="Total PnL" value={performance?.pnlTotal} />
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}

/* helpers unchanged */

function TabBtn({ label, active, onClick }: any) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={`flex-1 py-[clamp(10px,1.8vw,16px)] text-center transition-all duration-200 ${active
          ? "text-white border-b-2 border-white bg-neutral-900"
          : "text-neutral-500 hover:text-neutral-300"
        }`}
    >
      {label}
    </button>
  )
}

function Stat({ label, value }: any) {
  return (
    <div className="flex justify-between bg-neutral-800 rounded-lg p-[clamp(10px,1.8vw,16px)]">
      <span className="text-neutral-400">{label}</span>
      <span className="font-semibold">{value ?? "--"}</span>
    </div>
  )
}

function Metric({ label, value }: any) {
  return (
    <div className="bg-neutral-800 rounded-lg p-[clamp(12px,2vw,20px)] text-center">
      <div className="text-neutral-400 text-[clamp(11px,1.5vw,14px)]">{label}</div>
      <div className="text-[clamp(18px,3vw,26px)] font-bold">{value ?? "--"}</div>
    </div>
  )
}

export default React.memo(PairCard)
