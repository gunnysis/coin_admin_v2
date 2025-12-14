// =========================================================================
// !! 중요: 새 배포 빌드 전 반드시 이 마케팅 버전을 업데이트하세요 !!
const MARKETING_VERSION = "2.0.0"; // 현재 앱의 마케팅 버전을 여기에 정의합니다.
// =========================================================================

export default ({ config }) => {
  // EAS Build에서 설정한 환경 변수를 읽어옵니다.
  // 기본값은 'production'으로 설정하여, 환경 변수가 없을 경우 배포용으로 간주합니다.
  const appEnv = process.env.APP_ENV || "production";

  // --- 환경별 동적 설정 값들 ---
  // 기본 번들 ID 및 패키지 이름의 기초가 되는 문자열입니다.
  const baseBundleId = "com.gunny.coinadmin";
  const baseIosBundleId = `${baseBundleId}.ios`; // 앱스토어 용 iOS 번들 ID
  const baseAndroidPackageName = `${baseBundleId}.android`; // Android용 ID

  const appSpecificConfig = {
    development: {
      appName: `코인관리자 (Dev)`,
      bundleIdentifier: `${baseIosBundleId}.dev`,
      packageName: `${baseAndroidPackageName}.dev`,
      icon: "./src/assets/images/icon_app.png",
    },
    preview: {
      appName: `코인관리자 (Prev)`,
      bundleIdentifier: `${baseIosBundleId}.preview`,
      packageName: `${baseAndroidPackageName}.preview`,
      icon: "./src/assets/images/icon_app.png",
    },
    production: {
      appName: `코인관리자`,
      bundleIdentifier: baseIosBundleId,
      packageName: baseAndroidPackageName,
      icon: "./src/assets/images/icon_app.png", // 기본 아이콘
    },
  };

  const currentEnvConfig = appSpecificConfig[appEnv];

  return {
    // Expo 프로젝트의 기본 설정들
    name: currentEnvConfig.appName,
    slug: "coin-admin",
    version: MARKETING_VERSION, // 마케팅 버전을 명시적으로 설정합니다.
    orientation: "portrait",
    icon: currentEnvConfig.icon || "./src/assets/images/icon_app.png", // 환경별 아이콘 또는 기본 아이콘
    scheme: "coinadmin",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    // 언어 설정
    locales: {
      ko: "./src/locales/ko.json",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: currentEnvConfig.bundleIdentifier,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      icon: currentEnvConfig.icon || "./src/assets/images/icon_app.png", // 환경별 아이콘 또는 기본 아이콘
      adaptiveIcon: {
        foregroundImage:
          currentEnvConfig.icon || "./src/assets/images/icon_app.png", // 환경별 아이콘 또는 기본 아이콘
        backgroundColor: "#ffffff",
      },
      package: currentEnvConfig.packageName,
      softwareKeyboardLayoutMode: "pan",
      statusBar: {
        backgroundColor: "#ffffff",
        barStyle: "dark-content",
        translucent: false,
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/favicon.png",
    },
    plugins: [
      "expo-sqlite",
    ],
    extra: {
      eas: {
        projectId: "c645ec24-aecb-460a-b87b-0b7651e1f18d",
      },
    },
    owner: "parkgunny",
  };
};
