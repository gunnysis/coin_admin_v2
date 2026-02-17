const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite 웹: WASM 파일을 에셋으로 처리 (docs.expo.dev/versions/latest/sdk/sqlite#web-setup)
if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

module.exports = withNativeWind(config, { input: "./global.css" });
