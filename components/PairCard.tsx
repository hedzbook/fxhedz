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

  const isMin = viewMode === "MIN"
  const isMax = viewMode === "MAX"
  const expanded = isMax ? true : open

  useEffect(() => {
    if (expanded) setTab("market")
  }, [expanded])

  useEffect(() => {
    setLiveDir(dir)
  }, [dir])

  useEffect(() => {
    setLiveOrders(orders ?? [])
  }, [orders])

  return (
    <div
      className={`border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300
        ${liveDir === "EXIT"
          ? "bg-neutral-900"
          : "bg-[#1A1A1A]"
        }`}
    >
      {/* ================= HEADER ================= */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          if (!isMax && !isMin) onToggle()
        }}
        className="p-4 cursor-pointer"
      >
        {/* Top Label Row (Lots and B/S) */}
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider">
            {signal?.lots ?? "0.00"} LOTS
          </div>
          <div className="text-[10px] font-bold">
            <span className="text-green-400">{signal?.buys ?? 0}B</span>
            <span className="text-neutral-600 px-1">/</span>
            <span className="text-red-400">{signal?.sells ?? 0}S</span>
          </div>
        </div>

        {/* Pair and Direction Row */}
        <div className="flex justify-between items-end mb-4">
          <div className="text-xl font-bold text-white tracking-tight">{pair}</div>
          <div
            className={`text-xl font-bold leading-none ${
              liveDir === "BUY" ? "text-green-500" : 
              liveDir === "SELL" ? "text-red-500" : 
              liveDir === "HEDGED" ? "text-sky-400" : "text-neutral-500"
            }`}
          >
            {liveDir}
          </div>
        </div>

        {/* Trade Visual (The Strip) */}
        {liveDir !== "EXIT" && (signal?.entry && signal?.sl && signal?.tp) && (
          <div className="px-1">
             <InlineTradeStrip signal={signal} direction={liveDir} />
          </div>
        )}
      </div>

      {/* ================= EXPANDED AREA ================= */}
      {!isMin && expanded && (
        <div className="border-t border-neutral-800 bg-black/20">
          <div className="flex w-full border-b border-neutral-800 text-xs font-bold uppercase tracking-widest">
            <TabBtn label="Market" active={tab === "market"} onClick={() => setTab("market")} />
            <TabBtn label="Orders" active={tab === "news"} onClick={() => setTab("news")} />
            <TabBtn label="History" active={tab === "history"} onClick={() => setTab("history")} />
            <TabBtn label="Performance" active={tab === "performance"} onClick={() => setTab("performance")} />
          </div>

          <div className="p-4 space-y-4">
            <div id={`chart_mount_${pair}`} className={`w-full h-[250px] rounded-lg bg-black ${tab === "market" ? "block" : "hidden"}`} />
            
            {tab === "market" && (
              <>
                <GlobalLightChart mountId={`chart_mount_${pair}`} signal={signal} />
                <div className="space-y-1">
                  <div className="text-[11px] text-neutral-500 uppercase font-bold">Latest Signal</div>
                  <div className="text-lg font-bold text-white">
                    {signal?.direction} {signal?.entry}
                  </div>
                  <div className="text-xs text-neutral-400">
                    SL {signal?.sl} · TP {signal?.tp}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InlineTradeStrip({ signal, direction }: { signal: any, direction?: TradeDirection }) {
  const sl = Number(signal?.sl);
  const tp = Number(signal?.tp);
  const entry = Number(signal?.entry);
  const price = Number(signal?.price || entry);

  // Logic for the price dot position
  let pricePercent = 50;
  if (direction === "BUY") {
    const totalDist = tp - sl;
    pricePercent = ((price - sl) / totalDist) * 100;
  } else {
    const totalDist = sl - tp;
    pricePercent = ((sl - price) / totalDist) * 100;
  }
  pricePercent = Math.max(0, Math.min(100, pricePercent));
  const isTPside = direction === "BUY" ? price >= entry : price <= entry;

  return (
    <div className="relative py-6">
      {/* Labels */}
      <div className="absolute top-0 w-full flex justify-between text-[9px] font-bold text-neutral-500 tracking-tighter">
        <span>SL / HEDZ</span>
        <span className="translate-x-[-50%]">ENTRY</span>
        <span>TP</span>
      </div>

      {/* The Track */}
      <div className="relative h-[2px] w-full bg-neutral-800 rounded-full flex items-center">
        {/* Red side */}
        <div className="absolute left-0 w-1/2 h-full bg-gradient-to-r from-red-500/50 to-transparent" />
        {/* Green side */}
        <div className="absolute right-0 w-1/2 h-full bg-gradient-to-l from-green-500/50 to-transparent" />
        
        {/* Static Markers */}
        <div className="absolute left-0 w-1.5 h-1.5 rounded-full border border-neutral-600 bg-neutral-900" />
        <div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-neutral-600 bg-neutral-900" />
        <div className="absolute right-0 w-1.5 h-1.5 rounded-full border border-neutral-600 bg-neutral-900" />

        {/* Dynamic Price Dot */}
        <div 
          className="absolute transition-all duration-500 ease-out"
          style={{ left: `${pricePercent}%` }}
        >
          <div className={`w-3 h-3 -ml-1.5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center ${isTPside ? 'bg-green-500' : 'bg-red-500'}`}>
             <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      {/* Price Values */}
      <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-medium text-neutral-400 tabular-nums">
        <span>{sl}</span>
        <span className="translate-x-[-50%]">{entry}</span>
        <span>{tp}</span>
      </div>
    </div>
  )
}

function TabBtn({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex-1 py-3 text-center transition-all ${active ? "text-white border-b-2 border-white bg-white/5" : "text-neutral-500 hover:text-neutral-300"}`}
    >
      {label}
    </button>
  )
}

export default React.memo(PairCard)