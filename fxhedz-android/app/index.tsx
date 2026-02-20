import React, { useEffect, useState } from "react"
import { View, ActivityIndicator, StatusBar } from "react-native"
import { WebView } from "react-native-webview"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Device from "expo-device"
import * as SecureStore from "expo-secure-store"

export default function HomeScreen() {

  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    initDevice()
  }, [])

  async function initDevice() {
    let id = await SecureStore.getItemAsync("fx_device_id")

    if (!id) {
      id = Device.osInternalBuildId + "-" + Date.now()
      await SecureStore.setItemAsync("fx_device_id", id)
    }

    setDeviceId(id)
  }

  if (!deviceId) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  const url =
    `https://fxhedz.vercel.app/?platform=android&device_id=${deviceId}`

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top", "bottom"]}>
      <StatusBar translucent={false} backgroundColor="#000" barStyle="light-content" />
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
      />
    </SafeAreaView>
  )
}