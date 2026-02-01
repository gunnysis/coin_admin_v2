# PowerShell 실행 정책 오류 해결 방법

## 문제
PowerShell에서 `npx` 명령 실행 시 다음과 같은 오류 발생:
```
npx : 이 시스템에서 스크립트를 실행할 수 없으므로 C:\nvm4w\nodejs\npx.ps1 파일을 로드할 수 없습니다.
```

## 해결 방법

### 방법 1: CMD를 통해 실행 (권장)
PowerShell 대신 CMD를 사용하여 명령 실행:

```powershell
cmd /c "npx expo run:android"
```

또는 직접 CMD 창을 열고:
```cmd
npx expo run:android
```

### 방법 2: npm을 직접 사용
`npx` 대신 `npm`을 직접 사용:

```powershell
npm run android
```

또는:
```powershell
npm exec expo run:android
```

### 방법 3: PowerShell 실행 정책 변경 (관리자 권한 필요)
관리자 권한으로 PowerShell을 실행한 후:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**주의**: 그룹 정책으로 제한된 경우 이 방법이 작동하지 않을 수 있습니다.

### 방법 4: 우회 실행
PowerShell에서 직접 node를 사용:

```powershell
node node_modules\.bin\expo run:android
```

## dev.md 업데이트 권장

다음과 같이 스크립트를 수정하는 것을 권장합니다:

```markdown
# Android 실행
cmd /c "npx expo run:android"

# 또는 npm 사용
npm run android
```

## 영구 해결 방법

### 1. package.json에 스크립트 추가
```json
{
  "scripts": {
    "android": "expo run:android",
    "ios": "expo run:ios",
    "start": "expo start",
    "start:clear": "expo start --clear"
  }
}
```

그러면 다음 명령으로 실행 가능:
```powershell
npm run android
```

### 2. PowerShell 프로필 설정
PowerShell 프로필에 다음을 추가:

```powershell
# PowerShell 프로필 열기
notepad $PROFILE

# 다음 내용 추가
function Run-Expo {
    param([string]$command)
    cmd /c "npx expo $command"
}

Set-Alias -Name expo -Value Run-Expo
```

그러면 다음처럼 사용 가능:
```powershell
expo run:android
```

## 참고
- 그룹 정책으로 실행 정책이 제한된 경우, 시스템 관리자에게 문의해야 합니다.
- 가장 안전한 방법은 CMD를 사용하거나 npm 스크립트를 활용하는 것입니다.
