"use client"

type Props = {
  pair: string
  open: boolean
  onToggle: () => void
  direction?: "BUY" | "SELL"
  signal?: any
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
        className="p-4 flex justify-between items-center cursor-pointer"
      >
        <div>
          <div className="font-semibold">{pair}</div>
          <div className="text-sm text-neutral-400">
            H1 Trend Strong
          </div>
        </div>

        <div className={`font-bold ${
          dir === "BUY"
            ? "text-green-400"
            : dir === "SELL"
            ? "text-red-400"
            : "text-neutral-500"
        }`}>
          {dir}
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      {open && (
        <div className="p-4 border-t border-neutral-800 space-y-4">

          {/* Latest Signal */}
          <div>
            <div className="text-sm text-neutral-400">Latest Signal</div>
            <div className="font-bold text-lg">
              {signal?.direction || "--"} {signal?.entry || ""}
            </div>
            <div className="text-sm text-neutral-400">
              SL {signal?.sl || "--"} · TP {signal?.tp || "--"}
            </div>
          </div>

          {/* Sentiment */}
          <div>
            <div className="text-sm text-neutral-400">
              Market Sentiment
            </div>
            <div className="bg-neutral-800 rounded-lg h-3 mt-2"></div>
          </div>

          {/* Indicators */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>RSI Buy</div>
            <div>MACD Sell</div>
            <div>CCI Buy</div>
            <div>ADX Buy</div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-sm text-neutral-400">Market Notes</div>
            <ul className="text-sm space-y-1 mt-1">
              <li>• Structure remains bullish above H1 support</li>
              <li>• Momentum expanding with volume</li>
            </ul>
          </div>

        </div>
      )}
    </div>
  )
}
