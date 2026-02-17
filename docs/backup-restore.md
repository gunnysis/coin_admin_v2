# Android 백업/복구 + Google Drive 연동

코인관리자(Android)에서 앱 전체 데이터를 Google Drive에 백업하고, 원하는 시점으로 복구하는 기능 설계·구현 정리.

---

## 1. 목표와 범위

- **목표**
  - 단일 사용자의 전체 데이터를 안전하게 백업/복구.
  - Google Drive에 JSON 스냅샷을 저장하고, 최근 백업들 중 하나를 골라 복구.
- **범위**
  - 플랫폼: Android 우선 구현 (iOS는 이후 확장 전제로 설계만 반영).
  - 데이터:
    - SQLite DB: 고정비(`fixed_month_costs`), 유동비(`variable_month_expenses`).
    - 앱 설정: 기본 통화 등 (필요 시 확장).
  - 스토리지:
    - 로컬 백업은 유지하되, Google Drive는 선택적인 추가 옵션.
  - 보안:
    - 패스워드 기반 암호화는 사용하지 않음.
    - 평문 JSON이 사용자의 Google Drive 계정에 저장되며, 계정/Drive 보안에 의존.

---

## 2. 백업 스냅샷 도메인 모델

### 2.1 메타 정보 (`BackupMeta`)

- `schemaVersion: number`
  - 백업/DB 데이터 포맷의 버전.
  - `src/lib/backup/constants.ts`의 `BACKUP_SCHEMA_VERSION`으로 중앙 관리 (현재 1).
  - 포맷이 깨질 정도로 변경될 때만 증가.
- `appVersion: string`
  - 실행 중인 앱 버전 (`expo-constants`의 `expoConfig.version`).
  - 표시/안내용 – 값이 다르다는 이유만으로 복구를 막지 않는다.
- `createdAt: string`
  - ISO 문자열 (`2026-02-17T12:34:56.789Z`).
- `platform: 'android' | 'ios' | 'web'`
  - 현재는 `"android"`.

### 2.2 데이터 섹션 (`BackupDatabaseSection`, `BackupSettingsSection`)

- `database: BackupDatabaseSection`
  - SQLite 각 테이블의 row 배열.
  - 예:
    - `fixedExpenses: FixedMonthCost[]` (`fixed_month_costs` 테이블)
    - `variableExpenses: VariableMonthExpense[]` (`variable_month_expenses` 테이블)
- `settings: BackupSettingsSection`
  - 앱 설정 값:
    - `defaultCurrency: 'KRW' | 'USD'`
  - 추후 UI/필터/디스플레이 옵션 등 확장 가능.

### 2.3 JSON 포맷 및 파일명 규칙

- 스냅샷 전체를 하나의 JSON 객체로 직렬화:
  - `BackupSnapshot` → `string` → 파일.
- 파일명:
  - `coin-admin-backup-YYYYMMDD-HHmmss-v{schemaVersion}.json`
  - 예: `coin-admin-backup-20260217-213045-v1.json`

---

## 3. Storage Adapter 추상화

백업/복구 로직은 “어디에 저장/불러오느냐”를 모르고, 어댑터에 위임한다.

### 3.1 공통 인터페이스 (`IBackupStorageAdapter`)

- 위치: `src/lib/backup/storageAdapter.ts`
- 인터페이스:
  - `source: 'local' | 'googleDrive'`
  - `save(snapshot: BackupSnapshot): Promise<BackupLocation>`
    - 스냅샷을 저장하고, 해당 위치를 표현하는 `BackupLocation`을 반환.
  - `load(location: BackupLocation): Promise<BackupSnapshot>`
    - 특정 위치에서 스냅샷을 불러옴.
  - `listRecent?(limit: number): Promise<BackupLocation[]>`
    - (선택) 최근 `limit`개 백업 목록 조회.
- `BackupLocation`
  - `id: string` – Drive `fileId` 또는 로컬 파일 경로 등.
  - `name: string` – 사용자에게 보여줄 이름 (백업 파일명).
  - `createdAt: string` – ISO, 목록 정렬/표시용.
  - `source: 'local' | 'googleDrive'`.

### 3.2 GoogleDriveStorageAdapter (Android 전용)

- 위치: `src/lib/backup/googleDriveAdapter.android.ts`
- 생성자 옵션:
  - `authProvider: GoogleAuthProvider`
    - `getAccessToken(): Promise<string>` – Android에서 OAuth 로그인 후 Access Token 제공.
  - `appFolderName?: string`
    - 기본값: `"coin-admin-backups"` – Drive 내 전용 폴더 이름.
- 책임:
  - **저장(save)**:
    - `BackupSnapshot` → JSON string → `files.create` (Drive API, multipart).
    - 전용 폴더(`appFolderName`) 하위에만 파일 생성.
    - 응답에서 `fileId`, `name`, `createdTime` → `BackupLocation`.
  - **로드(load)**:
    - `location.id`를 `fileId`로 사용하여 `files.get(fileId, alt=media)` 호출.
    - 응답 JSON → `BackupSnapshot` 파싱 및 최소 검증.
  - **목록(listRecent)**:
    - 전용 폴더 내에서 `coin-admin-backup-*.json`만 검색.
    - `createdTime desc`로 정렬 후 상위 `limit`개 (정책상 기본 3개) 반환.
  - **전용 폴더 관리(getOrCreateAppFolderId)**:
    - 최초 호출 시:
      - 해당 이름의 폴더가 없으면 생성.
      - 존재하면 해당 ID 사용.
    - ID는 메모리/간단 캐시로 재사용.
  - **권한(Scope)**:
    - `https://www.googleapis.com/auth/drive.file`
    - 앱이 만든 파일만 읽고 쓸 수 있는 최소 권한.

---

## 4. backupService 설계

위 어댑터를 사용해 실제 백업/복구 흐름을 구현하는 서비스 레이어.

- 위치: `src/lib/backup/backupService.ts`

### 4.1 exportBackup(adapter)

- 역할: 현재 앱 상태를 읽어 스냅샷을 만들고, 저장 어댑터에 위임.
- 단계:
  1. `createCurrentSnapshot()` 호출:
     - SQLite DB에서 고정비/유동비 등 데이터를 읽어 배열로 구성.
     - 현재 앱 설정(`defaultCurrency` 등)을 읽음.
     - `BackupMeta` 채우기 (`schemaVersion = BACKUP_SCHEMA_VERSION`, `appVersion`, `createdAt`, `platform = 'android'`).
  2. `adapter.save(snapshot)` 호출:
     - Drive 어댑터인 경우 → Google Drive 전용 폴더에 JSON 파일 업로드.
  3. 성공 시 `BackupLocation` 반환.
  4. 실패 시:
     - 내부 로그에 상세 사유 기록 (`logger.error` 활용 가능).
     - 호출자(UI)에게는 정리된 에러 타입/메시지 전달.

### 4.2 restoreBackup(adapter, location)

- 역할: 선택한 백업으로 현재 데이터를 완전히 되돌리기.
- 정책:
  - 전체 덮어쓰기(Overwrite) 기준.
  - `schemaVersion`이 현재 앱이 지원하는 값이 아니면 복구 차단(strict_block).
- 단계:
  1. `adapter.load(location)`으로 스냅샷 로드.
  2. 버전 검증:
     - `snapshot.meta.schemaVersion`이 `BACKUP_SCHEMA_VERSION`인지 체크.
     - 아니면: 복구 중단 + “호환되지 않는 백업입니다” 에러.
     - `snapshot.meta.appVersion`은 **표시용**:
       - 다르더라도 `schemaVersion`만 맞으면 복구 허용.
  3. (선택) 현재 상태를 자동 백업:
     - 예: `exportBackup(localAdapter)` 등으로 사전 백업을 남겨두고 진행 (되돌리기용).
  4. SQLite 배치 실행:
     - 관련 테이블 데이터 삭제 + 스냅샷의 데이터 `INSERT`를 하나의 배치로 실행.
     - 실패 시 전체 롤백되어 중간 상태가 남지 않도록 보장.
  5. 결과를 UI에 반환:
     - 성공 / 실패(에러 타입) 구분.

---

## 5. Android UI/UX 설계

### 5.1 진입점

- 위치: 설정 화면 (`SettingsScreen` → `src/features/settings/components/SettingsScreen.tsx`) 내 “백업/복구” 카드.
- Android 전용으로 우선 노출 (필요 시 `Platform.OS === 'android'` 체크).
- 요소:
  - 버튼 1 – “Google Drive로 백업”
    - 동작: `exportBackup(googleDriveAdapter)` 실행.
  - 버튼 2 – “Google Drive에서 복구”
    - 동작:
      1. `googleDriveAdapter.listRecent(3)` 호출.
      2. 모달/리스트로 최근 3개 백업 표시.
      3. 사용자가 항목을 선택하면 상세 요약 + 복구 확인 모달 표시.
      4. 확인 → `restoreBackup(googleDriveAdapter, 선택한 location)` 호출.

### 5.2 복구 UX 디테일

- 백업 항목 표시:
  - 이름(파일명) + 생성일시(`BackupLocation.createdAt`)를 함께 표시.
- 복구 확인 모달:
  - 메시지:
    - “기존 데이터를 모두 삭제하고, 선택한 백업 시점으로 되돌립니다.”
    - “이 작업은 되돌릴 수 없습니다.” (사전 자동 백업을 해도 사용자 관점에선 위험도 높게 인지)
  - 버튼:
    - 취소 / 복구.
- 진행 중 상태:
  - 버튼 비활성화, 로딩 인디케이터 표기.
- 완료 후:
  - 성공: Snackbar/Toast – “복구가 완료되었습니다.”
  - 실패: 에러 유형에 따라 적절한 메시지.

### 5.3 접근성·테스트 포인트

- `getTestProps` + `accessibilityLabel` 활용:
  - 예:
    - `backup-drive-button`
    - `restore-drive-button`
    - `backup-item-0`, `backup-item-1`, …
    - `backup-restore-confirm-button`
- 향후:
  - Android E2E 또는 웹 mock을 이용한 UI 플로우 테스트에서 위 ID 기반으로 검증.

---

## 6. 에러·보안·폴더 정책

### 6.1 Drive 전용 폴더

- 정책:
  - 모든 백업 파일은 전용 폴더 `coin-admin-backups` 안에만 저장.
  - 목록 조회도 이 폴더 한정.
- 이점:
  - 사용자 Drive를 더럽히지 않고, 앱이 만든 파일만 관리.
  - `drive.file` scope와도 잘 맞음.

### 6.2 에러 분류

- 네트워크 오류:
  - 인터넷 연결 없음, 타임아웃 등.
- 인증/권한 오류:
  - 액세스 토큰 만료, scope 부족, 사용자 권한 거부.
- Drive 오류:
  - 용량 부족, 파일/폴더 없음, API 제한 등.
- 데이터 오류:
  - JSON 파싱 실패, `schemaVersion` 불일치, 필수 필드 누락.
- DB 오류:
  - SQLite 배치 실행 실패 등.

각 에러 타입에 대해:

- 내부 로그용 코드/메시지 (예: `DriveError:UPLOAD_FAILED ...`)
- 사용자용 간단 메시지 (한국어)

를 매핑해두고, UI에서는 사용자 메시지만 노출.

### 6.3 프라이버시 안내

- 백업에는 다음이 포함됨:
  - 지출 내역, 금액, 메모 등 재무 데이터.
- 백업 파일은:
  - 평문 JSON, 사용자의 Google Drive 계정에 `drive.file` 권한으로 저장.
  - 앱 외에는 Google 계정/Drive 보안에 의존.
- (선택) 설정 화면 또는 첫 백업 시 간단 안내 문장:
  - “Google Drive 백업에는 재무 데이터가 포함되며, 암호화되지 않은 JSON 형태로 저장됩니다.”

---

## 7. 향후 확장 포인트

- **iOS 연동**
  - 동일한 인터페이스(`IBackupStorageAdapter`, `BackupSnapshot`, `backupService`) 재사용.
  - `googleDriveAdapter.ios.ts` 및 iOS 전용 Auth Provider 구현만 추가.
- **자동 백업**
  - `runAutoBackupIfNeeded({ adapter: googleDriveAdapter, trigger: 'monthly' | 'beforeUpdate', maxKeep: 3 })`
  - 앱 시작 시/업데이트 시점에 호출하여 Drive에 자동 백업 생성 + 오래된 항목 정리.
- **부분 복구/범위 제한**
  - 전체 덮어쓰기 외에:
    - 특정 월만 복구
    - 고정비/유동비 중 일부만 복구
  - 를 지원하는 API와 UI를 추가 가능.

