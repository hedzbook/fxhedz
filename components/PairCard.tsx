"use client"

type Props = {
  pair: string
  open?: boolean
  direction?: "BUY" | "SELL"
  signal?: any
  onToggle: () => void
}

export default function PairCard({
  pair,
  open,
  onToggle,
  direction,
  signal
}: Props) {

  const dir = direction || "--"

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900 transition-all active:scale-[0.99]">

      {/* HEADER */}
      <div
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="p-4 cursor-pointer"
      >
        <div className="w-full">

          {/* TOP ROW */}
          <div className="flex justify-between items-center">
            <div className="font-semibold">{pair}</div>

            <div
              className={`font-bold ${
                dir === "BUY"
                  ? "text-green-400"
                  : dir === "SELL"
                  ? "text-red-400"
                  : "text-neutral-500"
              }`}
            >
              {dir}
            </div>
          </div>

          {/* LIVE TRADE BAR */}
          {signal?.entry && signal?.sl && signal?.tp && (
            <TradeBar signal={signal} direction={dir} />
          )}

        </div>
      </div>

      {/* DROPDOWN AREA */}
      {open && (
        <div className="border-t border-neutral-800 max-h-[60vh] overflow-y-auto overscroll-contain touch-pan-y p-4 space-y-4">

          <div className="w-full h-48 bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-500">
            Chart will render here
          </div>

          <div>
            <div className="text-sm text-neutral-400">Latest Signal</div>
            <div className="font-bold text-lg">
              {signal?.direction || "--"} {signal?.entry || ""}
            </div>
            <div className="text-sm text-neutral-400">
              SL {signal?.sl || "--"} · TP {signal?.tp || "--"}
            </div>
          </div>

          <div>
            <div className="text-sm text-neutral-400">Market Sentiment</div>
            <div className="bg-neutral-800 rounded-lg h-3 mt-2"></div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>RSI Buy</div>
            <div>MACD Sell</div>
            <div>CCI Buy</div>
            <div>ADX Buy</div>
          </div>

          <div>
            <div className="text-sm text-neutral-400">Market Notes</div>
            <ul className="text-sm space-y-2 mt-2 leading-relaxed">
              <li>• Structure remains bullish above H1 support</li>
              <li>• Momentum expanding with volume</li>
              <li>• Liquidity sweep detected on M15</li>
              <li>• Panel scrolls without moving other cards</li>
            </ul>
          </div>

        </div>
      )}
    </div>
  )
}

function TradeBar({
  signal,
  direction
}: {
  signal: any
  direction?: string
}) {

  const sl = Number(signal?.sl)
  const tp = Number(signal?.tp)
  const entry = Number(signal?.entry)

  const price = Number(signal?.price || entry)

  const range = tp - sl
  if (!range) return null

  const entryPercent = ((entry - sl) / range) * 100
  const pricePercent = ((price - sl) / range) * 100

  // 🔥 Direction-based glow color
  const glow =
    direction === "BUY"
      ? "bg-green-400 shadow-[0_0_14px_rgba(34,197,94,0.9)]"
      : direction === "SELL"
      ? "bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.9)]"
      : "bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.9)]"

  return (
    <div className="mt-3">

      <div className="relative h-6 flex items-center">

        {/* BASE LINE */}
        <div className="absolute w-full h-[2px] bg-neutral-700 rounded"></div>

        {/* SL DOT */}
        <div className="absolute left-0 w-3 h-3 rounded-full border border-neutral-400 bg-transparent"></div>

        {/* ENTRY DOT */}
        <div
          className="absolute w-3 h-3 rounded-full border border-neutral-400 bg-transparent"
          style={{
            left: `${entryPercent}%`,
            transform: "translateX(-50%)"
          }}
        />

        {/* TP DOT */}
        <div className="absolute right-0 w-3 h-3 rounded-full border border-neutral-400 bg-transparent"></div>

        {/* 🔥 HYPER SMOOTH PULSE DOT */}
        <div
          className={`absolute w-3 h-3 rounded-full ${glow} animate-pulse`}
          style={{
            left: `${pricePercent}%`,
            transform: "translateX(-50%)",
            transition: "left 0.6s cubic-bezier(0.22,1,0.36,1)"
          }}
        />

      </div>

      {/* PRICE LABELS */}
      <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
        <span>{signal?.sl}</span>
        <span>{signal?.entry}</span>
        <span>{signal?.tp}</span>
      </div>

    </div>
  )
}
