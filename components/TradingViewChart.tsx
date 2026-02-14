"use client"

import { useEffect, useRef } from "react"

export default function TradingViewChart({ symbol }: { symbol: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    container.current.innerHTML = ""

    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true

    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "OANDA:" + symbol,
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      hide_legend: true,
      allow_symbol_change: false,
      save_image: false,
      backgroundColor: "#1E1E1E",
      
      // 1. REMOVE the studies array to stop the volume indicator from loading
      // 2. Add show_volume: false as a backup
      show_volume: false,

      overrides: {
        "paneProperties.background": "#1E1E1E",
        "scalesProperties.textColor": "#DCDCDC",
        
        // Match MT5 CHART_SHOW_GRID: false
        "paneProperties.vertGridProperties.color": "rgba(0,0,0,0)",
        "paneProperties.horzGridProperties.color": "rgba(0,0,0,0)",

        // Match MT5 clrGainsboro Candles
        "mainSeriesProperties.candleStyle.upColor": "#DCDCDC",
        "mainSeriesProperties.candleStyle.downColor": "#DCDCDC",
        "mainSeriesProperties.candleStyle.borderUpColor": "#DCDCDC",
        "mainSeriesProperties.candleStyle.borderDownColor": "#DCDCDC",
        "mainSeriesProperties.candleStyle.wickUpColor": "#DCDCDC",
        "mainSeriesProperties.candleStyle.wickDownColor": "#DCDCDC",
      }
    })

    container.current.appendChild(script)
  }, [symbol])

  return (
    // Set height here to match your layout (e.g., h-[500px] or h-screen)
    <div className="w-full h-[500px] rounded-lg overflow-hidden border border-neutral-800">
      <div ref={container} className="tradingview-widget-container w-full h-full" />
    </div>
  )
}