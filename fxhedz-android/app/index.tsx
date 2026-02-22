import React, { useEffect, useState, useRef } from "react"
import { View, ActivityIndicator } from "react-native"
import { WebView } from "react-native-webview"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import * as SecureStore from "expo-secure-store"
import * as Crypto from "expo-crypto"
import * as AuthSession from "expo-auth-session"

WebBrowser.maybeCompleteAuthSession()

const API_BASE = "https://fxhedz.vercel.app"

export default function HomeScreen() {

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const webViewRef = useRef<WebView>(null)

  // ===============================
  // GOOGLE AUTH (ANDROID CLIENT)
  // ===============================
const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: "314350994918-8vshj6jmsggen1tdiejho7bp912n83iu.apps.googleusercontent.com",
  // Fixed: simplified redirect calculation for Android
  redirectUri: AuthSession.makeRedirectUri({
    native: "com.googleusercontent.apps.314350994918-8vshj6jmsggen1tdiejho7bp912n83iu:/oauth2redirect",
  }),
});

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    initialize()
  }, [])

  async function initialize() {

    const storedAccess = await SecureStore.getItemAsync("accessToken")
    const storedRefresh = await SecureStore.getItemAsync("refreshToken")
    const storedEmail = await SecureStore.getItemAsync("email")

    if (storedAccess) {
      setAccessToken(storedAccess)
      setLoading(false)
      return
    }

    if (storedRefresh && storedEmail) {
      const refreshed = await tryRefresh()
      if (refreshed) {
        const newAccess = await SecureStore.getItemAsync("accessToken")
        setAccessToken(newAccess ?? null)
      }
    }

    setLoading(false)
  }

  // ===============================
  // HANDLE GOOGLE RESPONSE
  // ===============================
  useEffect(() => {

    if (response?.type === "success") {

      const idToken = response.authentication?.idToken

      if (!idToken) {
        console.log("No idToken returned from Google")
        return
      }

      exchangeTokenWithBackend(idToken)
    }

  }, [response])

  // ===============================
  // DEVICE ID
  // ===============================
  async function getDeviceId(): Promise<string> {

    let deviceId = await SecureStore.getItemAsync("deviceId")

    if (!deviceId) {
      deviceId = Crypto.randomUUID()
      await SecureStore.setItemAsync("deviceId", deviceId)
    }

    return deviceId
  }

  // ===============================
  // EXCHANGE WITH BACKEND
  // ===============================
  async function exchangeTokenWithBackend(idToken: string) {

    const deviceId = await getDeviceId()

    try {

      const res = await fetch(`${API_BASE}/api/native-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          deviceId
        })
      })

      if (!res.ok) {
        console.log("Backend auth failed")
        return
      }

      const data = await res.json()

      await SecureStore.setItemAsync("accessToken", data.accessToken)
      await SecureStore.setItemAsync("refreshToken", data.refreshToken)
      await SecureStore.setItemAsync("email", data.email)

      setAccessToken(data.accessToken)

    } catch (error) {
      console.log("Exchange Error:", error)
    }
  }

  // ===============================
  // SILENT REFRESH
  // ===============================
  async function tryRefresh(): Promise<boolean> {

    const refreshToken = await SecureStore.getItemAsync("refreshToken")
    const email = await SecureStore.getItemAsync("email")
    const deviceId = await SecureStore.getItemAsync("deviceId")

    if (!refreshToken || !email || !deviceId) return false

    try {

      const res = await fetch(`${API_BASE}/api/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken,
          email,
          deviceId
        })
      })

      if (!res.ok) return false

      const data = await res.json()

      await SecureStore.setItemAsync("accessToken", data.accessToken)
      setAccessToken(data.accessToken)

      return true

    } catch {
      return false
    }
  }

  // ===============================
  // LOGOUT
  // ===============================
  async function logout() {

    await SecureStore.deleteItemAsync("accessToken")
    await SecureStore.deleteItemAsync("refreshToken")
    await SecureStore.deleteItemAsync("email")

    setAccessToken(null)
  }

  // ===============================
  // LOADING STATE
  // ===============================
  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000"
      }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  // ===============================
  // MAIN WEBVIEW
  // ===============================
  return (
    <WebView
      ref={webViewRef}
      key={accessToken ?? "guest"}
      source={{
        uri: API_BASE,
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}
      }}
      style={{ flex: 1, backgroundColor: "#000000" }}
      containerStyle={{ backgroundColor: "#000000" }}

      // Prevent Google login inside WebView
      onShouldStartLoadWithRequest={(req) => {
        if (req.url.includes("accounts.google.com")) {
          promptAsync()
          return false
        }
        return true
      }}

      onMessage={async (event) => {

        const message = event.nativeEvent.data

        if (message === "LOGIN_REQUEST") {
          promptAsync()
        }

        if (message === "LOGOUT_REQUEST") {
          await logout()
        }
      }}

      onHttpError={async (event) => {

        const { statusCode } = event.nativeEvent

        if (statusCode === 401) {

          const refreshed = await tryRefresh()

          if (!refreshed) {
            promptAsync()
          }
        }
      }}
    />
  )
}