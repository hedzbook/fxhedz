"use client"

import AuthButton from "./AuthButton"

type Props = {
  active: boolean | null
  sessionExists: boolean
  status?: string | null
  expiry?: string | null
  blocked?: boolean
}

export default function AccessOverlay({
  active,
  sessionExists,
  status,
  expiry,
  blocked
}: Props) {

  // =============================
  // 1️⃣ LOADING
  // =============================
  if (active === null) {
    return (
      <OverlayContainer>
        <div className="text-neutral-400 text-sm">
          Verifying access...
        </div>
      </OverlayContainer>
    )
  }

  // =============================
  // 2️⃣ ACCESS GRANTED
  // =============================
  if (active === true) {
    return null
  }

  // =============================
  // 3️⃣ DEVICE BLOCKED
  // =============================
  if (blocked) {
    return (
      <OverlayContainer>
        <div className="space-y-4 text-center max-w-sm">

          <div className="text-[10px] uppercase tracking-widest text-neutral-500">
            FXHEDZ LIVE ENGINE
          </div>

          <div className="text-xl font-semibold">
            Device Not Authorized
          </div>

          <div className="text-neutral-400 text-sm">
            This device has already consumed a trial or is not permitted.
          </div>

          <a
            href="https://t.me/fxhedzbot"
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm rounded-md"
          >
            Contact Support
          </a>

        </div>
      </OverlayContainer>
    )
  }

  // =============================
  // 4️⃣ TRIAL EXPIRED (NOT LOGGED IN)
  // =============================
  if (!sessionExists) {
    return (
      <OverlayContainer>
        <div className="space-y-4 text-center max-w-sm">

          <div className="text-[10px] uppercase tracking-widest text-neutral-500">
            FXHEDZ LIVE ENGINE
          </div>

          <div className="text-xl font-semibold">
            Trial Expired
          </div>

          <div className="text-neutral-400 text-sm">
            Login with Google to continue your access.
          </div>

          <AuthButton />

          <div className="text-xs text-neutral-500">
            Continue trial for 7 days after login
          </div>

        </div>
      </OverlayContainer>
    )
  }

  // =============================
  // 5️⃣ FREE EXPIRED (LOGGED IN)
  // =============================
  if (sessionExists && status === "free") {

    const formattedExpiry = expiry
      ? new Date(expiry).toLocaleDateString()
      : null

    return (
      <OverlayContainer>
        <div className="space-y-4 text-center max-w-sm">

          <div className="text-[10px] uppercase tracking-widest text-neutral-500">
            FXHEDZ LIVE ENGINE
          </div>

          <div className="text-xl font-semibold">
            Free Access Ended
          </div>

          <div className="text-neutral-400 text-sm">
            {formattedExpiry
              ? `Your free access expired on ${formattedExpiry}.`
              : "Your free access has expired."}
          </div>

          <a
            href="https://t.me/fxhedzbot"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-sm rounded-md"
          >
            Upgrade Subscription
          </a>

        </div>
      </OverlayContainer>
    )
  }

  // =============================
  // 6️⃣ FALLBACK (SAFETY NET)
  // =============================
  return (
    <OverlayContainer>
      <div className="text-neutral-400 text-sm">
        Access restricted.
      </div>
    </OverlayContainer>
  )
}

/* -------------------------- */

function OverlayContainer({ children }: any) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900/95 border border-neutral-800 shadow-2xl p-8 rounded-xl">
        {children}
      </div>
    </div>
  )
}