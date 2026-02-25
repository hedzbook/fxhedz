"use client"

import React, { useEffect, useState, useMemo, useRef } from "react"
import PairCard from "@/components/PairCard"
import AccountStrip from "@/components/AccountStrip"
import VerticalSymbolButton from "@/components/VerticalSymbolButton"
import PairDetail from "@/components/PairDetail"
import AuthButton from "@/components/AuthButton"
import { useSession } from "next-auth/react"
import AccessOverlay from "@/components/AccessOverlay"
import { generateDummySignals } from "@/lib/dummySignals"
import { ensureDeviceIdentity } from "@/lib/device"
import { signOut } from "next-auth/react"
import { generateDummyDetail } from "@/lib/dummyDetail"
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core"

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

const DEFAULT_ORDER = [
  "ETHUSD",
  "USDCHF",
  "USDJPY",
  "XAUUSD",
  "EURUSD",
  "GBPUSD",
  "AUDUSD",
  "USOIL",
  "BTCUSD"
]
type PairKey =
  | "ETHUSD"
  | "USDCHF"
  | "USDJPY"
  | "XAUUSD"
  | "EURUSD"
  | "GBPUSD"
  | "AUDUSD"
  | "USOIL"
  | "BTCUSD"
const SIGNAL_API = "/api/signals"

type ViewMode = "MIN" | "MAX"

export default function Page() {

  const dummySignals = useMemo(() => generateDummySignals(), [])
  const [signals, setSignals] = useState<any>(dummySignals)
  const [pairData, setPairData] = useState<any>({})
  const [openPair, setOpenPair] = useState<string | null>(null)
  const [uiSignals, setUiSignals] = useState<any>({})
  const [netState, setNetState] = useState("FLAT")
  const [menuOpen, setMenuOpen] = useState(false)
  const [subActive, setSubActive] = useState<boolean | null>(null)
  const { data: session, status } = useSession()
  const isAndroid =
    typeof window !== "undefined" &&
    !!(window as any).ReactNativeWebView

  const hasNativeToken =
    isAndroid &&
    typeof window !== "undefined" &&
    (window as any).__HAS_NATIVE_TOKEN__ === true

  const isAuthenticated =
    isAndroid
      ? hasNativeToken
      : status === "authenticated"

  const sessionExists =
    isAndroid
      ? hasNativeToken
      : !!session
  const [fingerprint, setFingerprint] = useState<string>("")
  const [accessMeta, setAccessMeta] = useState<any>(null)
  async function loadPreview(pair: string) {
    try {
      const res = await fetch(`/api/public-preview?pair=${pair}`)
      const json = await res.json()

      setPairData((prev: any) => ({
        ...prev,
        [pair]: json
      }))
    } catch (e) {
      console.error("Preview load failed", e)
    }
  }
  const [instrumentOrder, setInstrumentOrder] =
    useState<PairKey[]>(DEFAULT_ORDER as PairKey[])
  useEffect(() => {
    const saved = localStorage.getItem("fxhedz_order")
    if (saved) {
      setInstrumentOrder(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("fxhedz_order", JSON.stringify(instrumentOrder))
  }, [instrumentOrder])
  const menuRef = useRef<HTMLDivElement | null>(null)
  const hamburgerRef = useRef<HTMLButtonElement | null>(null)
  const daysLeft = useMemo(() => {

    if (!accessMeta?.expiry) return null

    const now = new Date()
    const expiry = new Date(accessMeta.expiry)

    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    return days > 0 ? days : 0
  }, [accessMeta])

  useEffect(() => {

    function handleClickOutside(event: MouseEvent) {

      if (!menuOpen) return

      const target = event.target as Node

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(target)
      ) {
        setMenuOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }

  }, [menuOpen])

  useEffect(() => {
    console.log("SESSION:", session)
    console.log("FINGERPRINT:", fingerprint)
    console.log("SUBACTIVE:", subActive)
  }, [session, fingerprint, subActive])

  useEffect(() => {
    const result = ensureDeviceIdentity()
    if (result?.fingerprint) {
      setFingerprint(result.fingerprint)
    }
  }, [])

  useEffect(() => {

    if (status === "loading") return

    if (!isAuthenticated) {
      setSignals(generateDummySignals())
      return
    }

    if (subActive === false) {
      setSignals(generateDummySignals())
      return
    }

    if (subActive === null) return
    if (!fingerprint) return

    async function loadSignals() {
      try {

        const res = await fetch(
          `${SIGNAL_API}?fingerprint=${encodeURIComponent(fingerprint)}`
        )
        const json = await res.json()
        const incoming = json?.signals ? json.signals : json

        setSignals((prev: any) => {
          if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev
          return incoming
        })
      } catch { }
    }

    loadSignals()
    const interval = setInterval(loadSignals, 2500)
    return () => clearInterval(interval)

  }, [subActive, fingerprint, status])

  // =============================
  // CHECK SUBSCRIPTION STATUS
  // =============================
useEffect(() => {

  if (status === "loading") return

  // 🔥 FIX: Only block unauthenticated for WEB
  if (!isAndroid && status === "unauthenticated") {
    setSubActive(false)
    return
  }

  if (!fingerprint) return

    async function init() {

      // ===============================
      // PLATFORM + DEVICE COOKIES
      // ===============================

      const params = new URLSearchParams(window.location.search)
      const urlPlatform = params.get("platform")
      const urlDeviceId = params.get("device_id")

      let platform = "web"

      if (urlPlatform === "android") {
        platform = "android"
      }

      try {
        const tg = (window as any)?.Telegram?.WebApp
        if (tg?.initDataUnsafe?.user?.id) {
          platform = "telegram"
          const tgUser = tg.initDataUnsafe.user
          document.cookie = `fx_tg_id=${tgUser.id}; path=/; max-age=31536000`
        }
      } catch { }

      let id = urlDeviceId || localStorage.getItem("fxhedz_device_id")

      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem("fxhedz_device_id", id)
      }

      document.cookie = `fx_device=${id}; path=/; max-age=31536000`
      document.cookie = `fx_fp=${fingerprint}; path=/; max-age=31536000`
      document.cookie = `fx_platform=${platform}; path=/; max-age=31536000`

      // ===============================
      // SUBSCRIPTION CHECK
      // ===============================

      try {
        const res = await fetch(
          `/api/subscription?fingerprint=${encodeURIComponent(fingerprint)}`,
          { cache: "no-store" }
        )

const data = await res.json()
alert("SUB DATA: " + JSON.stringify(data))
console.log("SUB DATA:", data)

        if (data?.blocked) {
          setSubActive(false)
          setAccessMeta(data)
          return
        }

        setSubActive(data?.active === true)
        setAccessMeta(data)

      } catch {
        setSubActive(false)
      }
    }

    init()

  }, [status, fingerprint])

  useEffect(() => {
    const timer = setTimeout(() => {
      setUiSignals((prev: any) => {
        if (JSON.stringify(prev) === JSON.stringify(signals)) return prev
        return signals
      })
    }, 90)

    return () => clearTimeout(timer)
  }, [signals])

  useEffect(() => {

    if (!openPair) return

    if (isGuest) {
      loadPreview(openPair)
      return
    }
    if (!fingerprint) return

    const pairKey = openPair
    let cancelled = false

    async function refreshOpenPair() {
      try {

        const res = await fetch(
          `/api/signals?pair=${pairKey}&fingerprint=${encodeURIComponent(fingerprint)}`
        )
        const json = await res.json()
        if (cancelled) return

        setPairData((prev: any) => ({
          ...prev,
          [pairKey]: json
        }))
      } catch { }
    }

    refreshOpenPair()
    const interval = setInterval(refreshOpenPair, 6000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [openPair, subActive, fingerprint, status])

  function togglePair(pair: string) {
    // Toggle between open/close pair expansion
    if (openPair === pair) {
      setOpenPair(null) // Collapse the pair
    } else {
      setOpenPair(pair) // Expand the specific pair
    }
  }
  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = instrumentOrder.indexOf(active.id)
    const newIndex = instrumentOrder.indexOf(over.id)

    setInstrumentOrder(arrayMove(instrumentOrder, oldIndex, newIndex))
  }
  const pairsData = useMemo(() => {
    return instrumentOrder.map((pair) => {
      const signal = uiSignals?.[pair]
      const extra = pairData?.[pair] || {}
      return { pair, signal, orders: extra?.orders || [] }
    })
  }, [uiSignals, pairData])

  const isGuest =
    !isAuthenticated ||
    subActive === false

  const plan = accessMeta?.status

  const isLivePlus = plan === "live+"
  const isLive = plan === "live"

  const detailData = openPair
    ? (
      isGuest
        ? {
          ...pairData?.[openPair],
          ...generateDummyDetail(openPair),
          orders: uiSignals?.[openPair]?.orders || []
        }
        : pairData?.[openPair]
    )
    : undefined

  if (openPair) {
    console.log("DETAIL DATA:", detailData)
  }
  function SortableButton({ id, children }: any) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition
    }

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    )
  }
  function SortableRow({ id, children }: any) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition
    } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      willChange: "transform"
    }

    return (
      <div ref={setNodeRef} style={style}>
        {typeof children === "function"
          ? children({ attributes, listeners })
          : children}
      </div>
    )
  }
  return (
    <div className="relative">

      <main
        className={`h-[100dvh] bg-black text-white flex flex-col ${isAuthenticated && subActive === false ? "pointer-events-none" : ""
          }`}
        style={{ fontSize: "clamp(10px, 0.9vw, 16px)" }}
      >

        {/* TOP BAR */}
        <div
          className="shrink-0 grid border-b border-neutral-800"
          style={{
            gridTemplateColumns: "clamp(30px, 3.5vw, 46px) 1fr",
            height: "clamp(26px,3vh,40px)"
          }}
        >

          {/* TOP LEFT BUTTON */}
          <button
            className="
    border-r border-neutral-800
    bg-neutral-950
    hover:bg-neutral-900
    flex items-center justify-center
  "
          >
            <img
              src="/favicon.png"
              alt="FXHEDZ"
              className="
      w-[90%]
      h-[90%]
      object-contain
      select-none
      pointer-events-none
    "
            />
          </button>

          {/* ACCOUNT STRIP */}
          <AccountStrip
            pairs={pairsData}
            onStateChange={(state: string) => {
              setNetState(state)
            }}
          />

        </div>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-hidden relative">

          {openPair ? (

            <div
              className="absolute inset-0 grid"
              style={{
                gridTemplateColumns: "clamp(30px, 3.5vw, 46px) 1fr",
                gridTemplateRows: "1fr"
              }}
            >

              {/* LEFT RAIL */}
              <div className="grid"
                style={{
                  gridTemplateRows: `repeat(${instrumentOrder.length}, 1fr)`
                }}
              >
                {instrumentOrder.map((pair) => (
                  <VerticalSymbolButton
                    key={pair}
                    pair={pair}
                    active={openPair === pair}
                    onClick={() => setOpenPair(pair)}
                  />
                ))}
              </div>

              {/* RIGHT DETAIL */}
              <PairDetail
                pair={openPair}
                data={detailData}
                signal={uiSignals?.[openPair]}
                onClose={() => setOpenPair(null)}
                isGuest={isGuest}
              />

            </div>

          ) : (

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={instrumentOrder}
                strategy={verticalListSortingStrategy}
              >

                <div
                  className="grid h-full"
                  style={{
                    gridTemplateRows: `repeat(${instrumentOrder.length}, 1fr)`
                  }}
                >
                  {instrumentOrder.map((pair: PairKey) => {

                    const realSignal = uiSignals?.[pair]
                    const dummySignal = dummySignals[pair]

                    const isLivePair =
                      pair === "ETHUSD" || pair === "USDCHF"

                    const canAccess =
                      subActive === true &&
                      (
                        isLivePlus ||
                        (isLive && isLivePair)
                      )

                    const displaySignal =
                      !isAuthenticated
                        ? dummySignal
                        : canAccess
                          ? realSignal
                          : dummySignal

                    const displayDirection =
                      !isAuthenticated
                        ? dummySignal?.direction
                        : canAccess
                          ? realSignal?.direction
                          : "LIVE+"

                    return (
                      <SortableRow key={pair} id={pair}>
                        {({ attributes, listeners }: any) => (
                          <div className="flex h-full">

                            <div
                              className="h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                              style={{ width: "clamp(30px, 3.5vw, 46px)" }}
                              {...attributes}
                              {...listeners}
                            >
                              <VerticalSymbolButton
                                pair={pair}
                                active={false}
                                onClick={() => {
                                  if (!canAccess) return
                                  setOpenPair(prev => prev === pair ? null : pair)
                                }}
                              />
                            </div>

                            <div className="flex-1 h-full">
                              <PairCard
                                pair={pair}
                                open={openPair === pair}
                                direction={displayDirection}
                                signal={displaySignal}
                                onToggle={() => {
                                  if (!canAccess) return
                                  setOpenPair(prev => prev === pair ? null : pair)
                                }}
                                isGuest={!canAccess}
                              />
                            </div>

                          </div>
                        )}
                      </SortableRow>
                    )
                  })}

                </div>

              </SortableContext>
            </DndContext>

          )}

        </div>

        {/* BOTTOM BAR */}
        <div
          className="shrink-0 grid border-t border-neutral-800 relative"
          style={{
            gridTemplateColumns: "clamp(30px, 3.5vw, 46px) 1fr",
            height: "clamp(26px,3vh,40px)"
          }}
        >
          {menuOpen && (
            <div
              ref={menuRef}
              className="
      absolute
      bottom-[clamp(26px,3vh,40px)]
      left-0
      w-[260px]
      bg-neutral-900
      border border-neutral-800
      p-4
      z-50
      shadow-lg
      space-y-4
      text-[12px]
    "
            >

              {/* SUBSCRIPTION STATUS */}
              {session && (
                <div className="space-y-2 text-neutral-400">

                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className={subActive ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                      {subActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {daysLeft !== null && (
                    <div className="flex justify-between">
                      <span>Days Left</span>
                      <span className={daysLeft > 3 ? "text-sky-400 font-semibold" : "text-orange-400 font-semibold"}>
                        {daysLeft}
                      </span>
                    </div>
                  )}

                </div>
              )}

              <div className="border-t border-neutral-800 pt-3 space-y-3">

                {/* VERSION */}
                <div className="flex justify-between text-neutral-500">
                  <span>Version</span>
                  <span className="font-mono text-neutral-400">v0.1.0</span>
                </div>

                {/* UPGRADE */}
                {accessMeta?.status !== "live+" ? (
                  <a
                    href="https://t.me/fxhedzbot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
      block w-full text-center
      py-2 rounded-md
      bg-sky-600 hover:bg-sky-500
      text-white font-semibold
      transition-colors
    "
                  >
                    GO LIVE+
                  </a>
                ) : (
                  <div
                    className="
      block w-full text-center
      py-2 rounded-md
      bg-emerald-600
      text-white font-semibold
      opacity-90
      cursor-default
    "
                  >
                    LIVE+ ACTIVE
                  </div>
                )}

                {/* SUPPORT */}
                <a
                  href="https://t.me/fxhedzbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
          block w-full text-center
          py-2 rounded-md
          bg-neutral-800 hover:bg-neutral-700
          text-white font-semibold
          transition-colors
        "
                >
                  HELP
                </a>

                {/* AUTH BUTTON */}
                <div className="border-t border-neutral-800 pt-3">
                  <AuthButton />
                </div>

              </div>

            </div>
          )}

          {/* BOTTOM LEFT BUTTON (HAMBURGER HERE) */}
          <button
            ref={hamburgerRef}
            onClick={() => setMenuOpen(prev => !prev)}
            className="border-r border-neutral-800 bg-neutral-950 hover:bg-neutral-900 flex items-center justify-center"
          >
            <div className="w-[60%] flex flex-col gap-[2px]">
              <div className="h-[2px] w-full bg-neutral-400" />
              <div className="h-[2px] w-full bg-neutral-400" />
              <div className="h-[2px] w-full bg-neutral-400" />
            </div>
          </button>

          {/* RIGHT SIDE CONTENT */}
          <div className="bg-neutral-900 flex items-center px-2">
            <div className="text-[clamp(10px,1.8vh,22px)] font-semibold leading-none">
              FXHEDZ
            </div>

            <div className="ml-auto text-right flex flex-col items-end">
              <div className="text-[clamp(7px,0.9vh,12px)] leading-[11px]">
                ZEROLOSS COMPOUNDED
              </div>
              <div className="text-[clamp(8px,1vh,14px)] text-neutral-500 leading-[10px] tracking-[0.14em]">
                HEDGING SYSTEM
              </div>
            </div>
          </div>

        </div>

      </main>
      {status !== "loading" && (
        <AccessOverlay
          active={subActive}
          sessionExists={sessionExists}
          status={accessMeta?.status}
          expiry={accessMeta?.expiry}
          blocked={accessMeta?.blocked}
        />
      )}
    </div>
  )
}

