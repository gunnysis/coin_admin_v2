/**
 * 데이터베이스 유틸리티 함수
 */

import { SQLiteDatabase } from 'expo-sqlite';

/**
 * 트랜잭션 실행 헬퍼
 */
export const executeTransaction = async <T>(
  db: SQLiteDatabase,
  operations: (tx: SQLiteDatabase) => Promise<T>
): Promise<T> => {
  try {
    return await operations(db);
  } catch (error) {
    throw error;
  }
};

/**
 * 배치 실행 헬퍼
 */
export const executeBatch = async (
  db: SQLiteDatabase,
  queries: Array<{ sql: string; args?: unknown[] }>
): Promise<void> => {
  for (const query of queries) {
    await db.runAsync(query.sql, query.args || []);
  }
};

/**
 * 안전한 쿼리 실행
 */
export const safeQuery = async <T>(
  db: SQLiteDatabase,
  sql: string,
  args?: unknown[]
): Promise<T[]> => {
  try {
    const result = await db.getAllAsync<T>(sql, args);
    return result;
  } catch (error) {
    throw new Error(`Query failed: ${sql} - ${error}`);
  }
};

