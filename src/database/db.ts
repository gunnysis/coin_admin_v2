import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { FixedMonthCost } from '../types';

// 공통 DB 인스턴스
let db: SQLite.SQLiteDatabase | null = null;

// 데이터베이스 초기화 및 인스턴스 반환
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync('coin_admin.db');
    
    // fixed_month_costs 테이블 생성
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fixed_month_costs (
        id INTEGER PRIMARY KEY,
        created_at TIMESTAMP DEFAULT (datetime('now', '+9 hours')),
        amount INTEGER NOT NULL,
        name TEXT NOT NULL,
        start_date DATE NOT NULL
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// 데이터베이스 인스턴스 가져오기 (이미 초기화된 경우)
export const getDbInstance = (): SQLite.SQLiteDatabase | null => {
  return db;
};

// 데이터베이스 닫기
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log('Database closed');
  }
};

// 데이터베이스 재초기화
export const resetDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    await closeDatabase();
  }
  return await getDatabase();
};

// 데이터베이스 파일 경로 정보 반환
export const getDatabasePathInfo = (): string => {
  const dbName = 'coin_admin.db';
  
  if (Platform.OS === 'web') {
    return '웹: IndexedDB 사용 (실제 파일이 아님)';
  }
  
  if (Platform.OS === 'android') {
    // Android: 앱의 내부 저장소 (루팅 필요)
    return `/data/data/com.gunny.coinadmin.android/databases/${dbName}`;
  }
  
  if (Platform.OS === 'ios') {
    // iOS: 앱의 Documents 디렉토리
    return `앱 Documents 디렉토리/${dbName}`;
  }
  
  return '알 수 없는 플랫폼';
};

// 모든 데이터 삭제 (테스트용)
export const clearAllData = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM fixed_month_costs');
    console.log('모든 데이터가 삭제되었습니다.');
  } catch (error) {
    console.error('데이터 삭제 중 오류:', error);
    throw error;
  }
};

// 데이터 조회 (페이지네이션)
export const getFixedMonthCosts = async (
  limit: number = 10,
  offset: number = 0
): Promise<FixedMonthCost[]> => {
  try {
    const db = await getDatabase();
    const result = await db.getAllAsync(
      'SELECT * FROM fixed_month_costs ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return result as FixedMonthCost[];
  } catch (error) {
    console.error('데이터 조회 중 오류:', error);
    throw error;
  }
};

// 전체 데이터 개수 조회
export const getFixedMonthCostsCount = async (): Promise<number> => {
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM fixed_month_costs'
    );
    return result?.count || 0;
  } catch (error) {
    console.error('데이터 개수 조회 중 오류:', error);
    throw error;
  }
};

// 단일 항목 삭제
export const deleteFixedMonthCost = async (id: number): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM fixed_month_costs WHERE id = ?', [id]);
    console.log(`항목 ${id}가 삭제되었습니다.`);
  } catch (error) {
    console.error('데이터 삭제 중 오류:', error);
    throw error;
  }
};

// 항목 추가
export const addFixedMonthCost = async (
  name: string,
  amount: number,
  start_date: string
): Promise<number> => {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO fixed_month_costs (name, amount, start_date) VALUES (?, ?, ?)',
      [name, amount, start_date]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('데이터 추가 중 오류:', error);
    throw error;
  }
};

// 항목 수정
export const updateFixedMonthCost = async (
  id: number,
  name: string,
  amount: number,
  start_date: string
): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE fixed_month_costs SET name = ?, amount = ?, start_date = ? WHERE id = ?',
      [name, amount, start_date, id]
    );
    console.log(`항목 ${id}가 수정되었습니다.`);
  } catch (error) {
    console.error('데이터 수정 중 오류:', error);
    throw error;
  }
};
