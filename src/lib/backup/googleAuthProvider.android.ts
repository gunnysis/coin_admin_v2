import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getGoogleAndroidClientId } from '../../config/googleDrive';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export class AndroidGoogleAuthProvider {
  private accessToken: string | null = null;

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const clientId = getGoogleAndroidClientId();
    if (!clientId) {
      throw new Error(
        'Google Client ID가 설정되지 않았습니다. app.config.ts의 extra.googleAndroidClientId를 확인하세요.',
      );
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'coinadmin',
    });

    const request = new AuthSession.AuthRequest({
      clientId,
      redirectUri,
      scopes: ['openid', 'profile', GOOGLE_DRIVE_SCOPE],
      responseType: AuthSession.ResponseType.Token,
      usePKCE: false,
    });

    const result = await request.promptAsync(discovery);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new Error('Google 로그인이 취소되었습니다.');
    }

    if (result.type !== 'success') {
      throw new Error(`Google 인증에 실패했습니다: ${result.type}`);
    }

    const token = result.authentication?.accessToken ?? result.params?.access_token;

    if (!token) {
      throw new Error('액세스 토큰을 받지 못했습니다.');
    }

    this.accessToken = token;
    return token;
  }
}
