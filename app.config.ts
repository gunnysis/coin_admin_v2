// =========================================================================
// !! 중요: 새 배포 빌드 전 반드시 이 마케팅 버전을 업데이트하세요 !!
const MARKETING_VERSION = "2.1.1"; // 현재 앱의 마케팅 버전을 여기에 정의합니다.
// =========================================================================

// 상수 정의
const APP_CONSTANTS = {
  BASE_BUNDLE_ID: "com.gunny.coinadmin",
  APP_SLUG: "coin-admin",
  APP_SCHEME: "coinadmin",
  APP_NAME_BASE: "코인관리자",
  OWNER: "parkgunny",
  EAS_PROJECT_ID: "c645ec24-aecb-460a-b87b-0b7651e1f18d",
} as const;

const ASSET_PATHS = {
  ICON_APP: "./src/assets/images/icon_app.png",
  FAVICON: "./src/assets/images/favicon.png",
  LOCALE_KO: "./src/locales/ko.json",
} as const;

const UI_CONSTANTS = {
  STATUS_BAR_BACKGROUND: "#ffffff",
  ADAPTIVE_ICON_BACKGROUND: "#ffffff",
} as const;

// 환경 타입 정의
type AppEnvironment = "development" | "preview" | "production";

// 환경별 설정 타입
interface EnvironmentConfig {
  appName: string;
  bundleIdentifier: string;
  packageName: string;
  icon: string;
}

// 환경별 설정 생성 함수
const createEnvironmentConfig = (env: AppEnvironment): EnvironmentConfig => {
  const baseIosBundleId = `${APP_CONSTANTS.BASE_BUNDLE_ID}.ios`;
  const baseAndroidPackageName = `${APP_CONSTANTS.BASE_BUNDLE_ID}.android`;

  const configs: Record<AppEnvironment, Omit<EnvironmentConfig, "icon">> = {
    development: {
      appName: `${APP_CONSTANTS.APP_NAME_BASE} (Dev)`,
      bundleIdentifier: `${baseIosBundleId}.dev`,
      packageName: `${baseAndroidPackageName}.dev`,
    },
    preview: {
      appName: `${APP_CONSTANTS.APP_NAME_BASE} (Prev)`,
      bundleIdentifier: `${baseIosBundleId}.preview`,
      packageName: `${baseAndroidPackageName}.preview`,
    },
    production: {
      appName: APP_CONSTANTS.APP_NAME_BASE,
      bundleIdentifier: baseIosBundleId,
      packageName: baseAndroidPackageName,
    },
  };

  return {
    ...configs[env],
    icon: ASSET_PATHS.ICON_APP,
  };
};

// 안전한 환경 변수 파싱
const getAppEnvironment = (): AppEnvironment => {
  const env = process.env.APP_ENV || "production";
  const validEnvs: AppEnvironment[] = ["development", "preview", "production"];
  return validEnvs.includes(env as AppEnvironment)
    ? (env as AppEnvironment)
    : "production";
};

export default () => {
  const appEnv = getAppEnvironment();
  const envConfig = createEnvironmentConfig(appEnv);

  return {
    // Expo 프로젝트의 기본 설정들
    name: envConfig.appName,
    slug: APP_CONSTANTS.APP_SLUG,
    version: MARKETING_VERSION,
    orientation: "default", // 가로/세로 모두 지원
    icon: envConfig.icon,
    scheme: APP_CONSTANTS.APP_SCHEME,
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    // EAS Update 설정
    updates: {
      url: `https://u.expo.dev/${APP_CONSTANTS.EAS_PROJECT_ID}`,
    },
    // 언어 설정
    locales: {
      ko: ASSET_PATHS.LOCALE_KO,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: envConfig.bundleIdentifier,
      runtimeVersion: {
        policy: "appVersion",
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      icon: envConfig.icon,
      adaptiveIcon: {
        foregroundImage: envConfig.icon,
        backgroundColor: UI_CONSTANTS.ADAPTIVE_ICON_BACKGROUND,
      },
      package: envConfig.packageName,
      runtimeVersion: "1.0.0",
      softwareKeyboardLayoutMode: "pan",
      statusBar: {
        backgroundColor: UI_CONSTANTS.STATUS_BAR_BACKGROUND,
        barStyle: "dark-content",
        translucent: false,
      },
      // 태블릿 최적화 설정
      supportsTablet: true,
      // 갤럭시탭 S11 및 최신 태블릿 지원
      minSdkVersion: 24, // Android 7.0 (Nougat)
      targetSdkVersion: 34, // Android 14
      compileSdkVersion: 34,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: ASSET_PATHS.FAVICON,
    },
    plugins: ["expo-sqlite"],
    extra: {
      eas: {
        projectId: APP_CONSTANTS.EAS_PROJECT_ID,
      },
    },
    owner: APP_CONSTANTS.OWNER,
  };
};
