import Constants from 'expo-constants';

type ExtraConfig = {
  appEnv?: string;
  googleAndroidClientId?: string;
  googleAndroidDriveApiKey?: string;
};

const getExtra = (): ExtraConfig => {
  // expo-constants는 네이티브/웹 모두에서 동작하며, extra는 optional이다.
  const expoConfig = Constants.expoConfig as unknown as {
    extra?: ExtraConfig;
  } | null;

  return expoConfig?.extra ?? {};
};

export const getGoogleAndroidClientId = (): string | undefined => {
  const { googleAndroidClientId } = getExtra();
  return googleAndroidClientId;
};

export const getGoogleAndroidDriveApiKey = (): string | undefined => {
  const { googleAndroidDriveApiKey } = getExtra();
  return googleAndroidDriveApiKey;
};

