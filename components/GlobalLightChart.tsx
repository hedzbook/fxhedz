"use client"

import { useEffect, useRef } from "react"
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries
} from "lightweight-charts"

export default function GlobalLightChart({
  symbol,
  price,
  mountId
}: {
  symbol?: string
  price?: number
  mountId?: string
}) {

  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)

  // ====================================
  // CREATE ONLY ONCE
  // ====================================
  useEffect(() => {

    if (chartRef.current) return

    const container = document.createElement("div")
    container.style.width = "100%"
    container.style.height = "280px"

    const chart = createChart(container, {

      layout: {
        background: { type: ColorType.Solid, color: "#1E1E1E" },
        textColor: "#aaa"
      },

      grid: {
        vertLines: { color: "rgba(255,255,255,0.03)" },
        horzLines: { color: "rgba(255,255,255,0.03)" }
      },

      crosshair: { mode: CrosshairMode.Normal }
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {

      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444"
    })

    chartRef.current = { chart, container }
    seriesRef.current = candleSeries

    const now = Math.floor(Date.now() / 1000)

    candleSeries.setData([
      { time: now as any, open: price || 0, high: price || 0, low: price || 0, close: price || 0 }
    ])

  }, [])

  // ====================================
  // MOVE CHART INTO OPEN CARD
  // ====================================
  useEffect(() => {

    if (!mountId) return
    if (!chartRef.current) return

    const mountEl = document.getElementById(mountId)
    if (!mountEl) return

    mountEl.innerHTML = ""
    mountEl.appendChild(chartRef.current.container)

  }, [mountId])

  // ====================================
  // LIVE PRICE UPDATE
  // ====================================
  useEffect(() => {

    if (!seriesRef.current || !price) return

    const candleTime =
      Math.floor(Date.now() / 60000) * 60

    seriesRef.current.update({
      time: candleTime as any,
      open: price,
      high: price,
      low: price,
      close: price
    })

  }, [price])

  return null
}
