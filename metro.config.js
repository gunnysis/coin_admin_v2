// Sentry 소스맵 업로드용 Debug ID를 번들·소스맵에 부여하는 확장판 —
// expo/metro-config의 getDefaultConfig를 대체 (docs.sentry.io/platforms/react-native/manual-setup/expo)
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withNativeWind } = require("nativewind/metro");

const config = getSentryExpoConfig(__dirname);

// expo-sqlite 웹: WASM 파일을 에셋으로 처리 (docs.expo.dev/versions/latest/sdk/sqlite#web-setup)
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

module.exports = withNativeWind(config, { input: "./global.css" });
