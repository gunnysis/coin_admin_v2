// =========================================================================
// !! 중요: 새 배포 빌드 전 반드시 이 마케팅 버전을 업데이트하세요 !!
const MARKETING_VERSION = "2.6.2"; // 현재 앱의 마케팅 버전을 여기에 정의합니다.
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
    // OTA 업데이트 대상 구분용. MARKETING_VERSION과 맞춰 두면 같은 앱 버전 빌드에만 OTA가 적용됨
    // (sync 스크립트가 이 연결을 검사하므로 리터럴로 바꾸지 말 것 — docs/development/config-sync.md)
    runtimeVersion: MARKETING_VERSION,
    orientation: "default", // 가로/세로 모두 지원
    icon: envConfig.icon,
    scheme: APP_CONSTANTS.APP_SCHEME,
    userInterfaceStyle: "automatic",
    // newArchEnabled 키는 SDK 55에서 제거됨 — New Architecture 상시 활성
    // EAS Update 설정
    updates: {
      url: `https://u.expo.dev/${APP_CONSTANTS.EAS_PROJECT_ID}`,
      enabled: true,
      // 앱 실행 시마다 서버에서 업데이트 확인
      checkAutomatically: "ON_LOAD",
      // 새 번들이 준비되면 바로 적용 (다음 앱 재시작 시 적용)
      fallbackToCacheTimeout: 0,
    },
    // 언어 설정
    locales: {
      ko: ASSET_PATHS.LOCALE_KO,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: envConfig.bundleIdentifier,
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
      softwareKeyboardLayoutMode: "pan",
      // statusBar 설정은 SDK 55+에서 제거됨 — edge-to-edge 상시 활성(상태바 투명), 스타일은 런타임 expo-status-bar가 제어
      // 태블릿 최적화 설정
      supportsTablet: true,
      // SDK 버전: 명시하지 않음 — CNG(prebuild)에서 RN 버전 카탈로그(react-native/gradle/libs.versions.toml)가
      // 공급하는 기본값 사용 (SDK 57 기준 min 24 / target·compile 36). 고정하면 SDK 업그레이드 시 낡은 값 회귀 위험.
    },
    web: {
      bundler: "metro",
      // 'static'은 expo-router 필수. 라우터 없는 단일 화면 앱이므로 SPA 출력 사용 (expo-router 제거에 따른 정합)
      output: "single",
      favicon: ASSET_PATHS.FAVICON,
    },
    plugins: [
      "expo-sqlite",
      "expo-font",
      "expo-sharing",
      // 릴리스 빌드 시 소스맵을 Sentry에 업로드(난독 해제). 빌드 환경에 SENTRY_AUTH_TOKEN
      // (EAS secret) 필수 — 없으면 업로드 단계가 빌드를 실패시킬 수 있음. 로컬 릴리스 스모크는
      // .env.sentry-build-plugin에 토큰을 두거나 SENTRY_DISABLE_AUTO_UPLOAD=true로 우회
      // (docs/planning/security-and-hardening-review.md 3-2-2)
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          organization: "gunnys",
          project: "coin-admin",
        },
      ],
    ],
    extra: {
      appEnv,
      eas: {
        projectId: APP_CONSTANTS.EAS_PROJECT_ID,
      },
    },
    owner: APP_CONSTANTS.OWNER,
  };
};
