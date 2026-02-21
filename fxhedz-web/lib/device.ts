export function ensureDeviceIdentity() {
  if (typeof window === "undefined") return null

  let deviceId = localStorage.getItem("fxhedz_device_id")
  let fingerprint = localStorage.getItem("fxhedz_fp")

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem("fxhedz_device_id", deviceId)
  }

  if (!fingerprint) {
    const raw =
      navigator.userAgent +
      navigator.platform +
      screen.width +
      screen.height

    fingerprint =
      crypto.randomUUID() + "-" + btoa(raw).slice(0, 12)

    localStorage.setItem("fxhedz_fp", fingerprint)
  }

  document.cookie = `fx_device=${deviceId}; path=/; max-age=31536000`
  document.cookie = `fx_fp=${fingerprint}; path=/; max-age=31536000`

  return { deviceId, fingerprint }
}