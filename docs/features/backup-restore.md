# 로컬 백업/복구

코인관리자에서 앱 전체 데이터를 로컬 파일로 백업하고, 선택한 백업 파일로 복구하는 기능 정리.

---

## 1. 목표와 범위

- **목표**
  - 단일 사용자의 전체 데이터를 안전하게 백업/복구.
  - 백업은 JSON 파일로 생성 후 공유 시트를 통해 사용자가 저장 위치(기기, 클라우드 등)를 선택.
  - 복구는 사용자가 선택한 백업 JSON 파일을 불러와 DB를 덮어쓰기.
- **범위**
  - 플랫폼: Android / iOS (expo-file-system, expo-sharing, expo-document-picker 사용). **웹도 지원** — 백업은 Blob + 다운로드 앵커로 즉시 다운로드, 복구는 blob/http URI 읽기(LocalBackupAdapter 내 웹 분기).
  - 데이터:
    - SQLite DB: 고정비(`fixed_month_costs`), 유동비(`variable_month_expenses`).
    - 앱 설정: 기본 통화 등 (필요 시 확장).
  - 스토리지: 로컬 파일만. 암호화는 사용하지 않음.

---

## 2. 백업 스냅샷 도메인 모델

### 2.1 메타 정보 (`BackupMeta`)

- `schemaVersion: number` — `src/lib/backup/constants.ts`의 `BACKUP_SCHEMA_VERSION` (현재 1).
- `appVersion: string` — 앱 버전, 표시용.
- `createdAt: string` — ISO 문자열.
- `platform: 'android' | 'ios' | 'web'`

### 2.2 데이터 섹션

- `database`: 고정비/유동비 배열.
- `settings`: `defaultCurrency` 등.

### 2.3 JSON 포맷 및 파일명

- 스냅샷 전체를 하나의 JSON 객체로 직렬화.
- 파일명: `coin-admin-backup-YYYYMMDD-HHmmss-v{schemaVersion}.json`

---

## 3. Storage Adapter 추상화

- 위치: `src/lib/backup/storageAdapter.ts`
- `IBackupStorageAdapter`: `source`, `save(snapshot)`, `load(location)`, `listRecent?` (선택).
- `BackupLocation`: `id`, `name`, `createdAt`, `source`.

### 3.1 LocalBackupAdapter

- 위치: `src/lib/backup/localBackupAdapter.ts`
- **save**: **문서(document) 디렉터리**에 JSON 저장 후 `expo-sharing`으로 공유 시트 표시(캐시 디렉터리는 일부 Android 기기에서 공유 실패해 document 사용 — 코드 주석 참고). 사용자가 저장 위치 선택. 웹은 Blob 다운로드.
- **load**: `location.id`(파일 URI)를 `expo-file-system`으로 읽어 JSON 파싱 후 검증.
- **listRecent**: 미구현. 복구는 항상 파일 선택(expo-document-picker)으로만 수행.

---

## 4. backupService

- 위치: `src/lib/backup/backupService.ts`
- **exportBackup(adapter)**: `createCurrentSnapshot()` 후 `adapter.save(snapshot)`.
- **restoreBackup(adapter, location)**: `adapter.load(location)` → `schemaVersion` 검증 → SQLite 트랜잭션으로 DELETE + INSERT.

---

## 5. UI (설정 화면)

- **백업하기**: `exportBackup(localAdapter)` → 공유 시트에서 사용자가 저장.
- **복구하기**: `expo-document-picker`로 JSON 파일 선택 → 확인 모달 → `restoreBackup(localAdapter, location)`.
- 테스트 ID: `backup-button`, `restore-button`, `backup-restore-confirm-button`, `backup-error-message`.

---

## 6. 에러·데이터 정책

- 데이터 오류: JSON 파싱 실패, `schemaVersion` 불일치, 필수 필드 누락 시 복구 차단.
- DB 오류: 트랜잭션 실패 시 롤백.
- 백업 파일은 평문 JSON이므로 사용자가 저장한 위치의 보안에 의존.

---

## 7. 향후 확장

- 자동 백업(앱 시작/업데이트 시 로컬에 백업 생성).
- 부분 복구(특정 월만, 고정비/유동비 일부만).
