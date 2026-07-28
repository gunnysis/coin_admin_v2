import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { FixedMonthCost, VariableMonthExpense } from '../types';

// 공통 DB 인스턴스
let db: SQLite.SQLiteDatabase | null = null;
let retryCount = 0;
const MAX_RETRIES = 2;

// 데이터베이스 작업 큐 (동시 접근 방지)
let dbQueue: Promise<number> = Promise.resolve(0);
let isInitializing = false;

// 데이터베이스 인스턴스 유효성 검증
const validateDatabase = async (dbInstance: SQLite.SQLiteDatabase): Promise<boolean> => {
  try {
    // 간단한 쿼리로 데이터베이스가 유효한지 확인
    await dbInstance.getFirstAsync('SELECT 1');
    return true;
  } catch (error) {
    if (__DEV__) {
      console.log('데이터베이스 유효성 검증 실패:', error);
    }
    return false;
  }
};

// 데이터베이스 초기화 및 인스턴스 반환
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  // 초기화 중이면 대기
  if (isInitializing) {
    // 초기화가 완료될 때까지 대기
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (db && typeof db.runAsync === 'function') {
      const isValid = await validateDatabase(db);
      if (isValid) {
        return db;
      }
    }
  }

  // 기존 인스턴스가 있고 유효한지 확인
  if (db && typeof db.runAsync === 'function') {
    const isValid = await validateDatabase(db);
    if (isValid) {
      return db;
    } else {
      if (__DEV__) {
        console.log('기존 데이터베이스 인스턴스가 유효하지 않음, 재초기화 필요');
      }
      db = null;
    }
  }
  
  // 기존 인스턴스가 있지만 유효하지 않은 경우 초기화
  if (db) {
    if (__DEV__) {
      console.log('기존 데이터베이스 인스턴스가 유효하지 않음, 재초기화 중...');
    }
    try {
      await db.closeAsync().catch(() => {});
    } catch (e) {
      // 무시
    }
    db = null;
  }

  // 초기화 시작
  isInitializing = true;

  try {
    const newDb = await SQLite.openDatabaseAsync('coin_admin.db');
    
    if (!newDb) {
      throw new Error('openDatabaseAsync returned null');
    }
    
    // 데이터베이스가 제대로 열렸는지 테스트
    try {
      await newDb.getFirstAsync('SELECT 1');
    } catch (testError) {
      console.error('데이터베이스 테스트 쿼리 실패:', testError);
      throw new Error('Database test query failed');
    }
    
    // fixed_month_costs 테이블 생성
    await newDb.execAsync(`
      CREATE TABLE IF NOT EXISTS fixed_month_costs (
        id INTEGER PRIMARY KEY,
        created_at TIMESTAMP DEFAULT (datetime('now', '+9 hours')),
        amount INTEGER NOT NULL,
        name TEXT NOT NULL,
        start_date DATE NOT NULL
      );
    `);

    // variable_month_expenses 테이블 생성 (유동비)
    await newDb.execAsync(`
      CREATE TABLE IF NOT EXISTS variable_month_expenses (
        id INTEGER PRIMARY KEY,
        created_at TIMESTAMP DEFAULT (datetime('now', '+9 hours')),
        amount INTEGER NOT NULL,
        name TEXT NOT NULL,
        spent_date DATE NOT NULL,
        category TEXT,
        memo TEXT
      );
    `);

    // 인덱스 생성 (성능 최적화)
    await newDb.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_variable_expenses_spent_date 
      ON variable_month_expenses(spent_date);
    `);
    
    await newDb.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_variable_expenses_category 
      ON variable_month_expenses(category);
    `);

    db = newDb;
    if (__DEV__) {
      console.log('Database initialized successfully');
    }
    retryCount = 0; // 성공 시 재시도 카운터 리셋
    isInitializing = false;
    return db;
  } catch (error: unknown) {
    isInitializing = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error('Error initializing database:', error);
    
    // "Path already points to a non-normal file" 오류 처리
    const isPathError = errorMessage.includes('non-normal file') || 
                       errorMessage.includes('Could not open database') ||
                       errorMessage.includes('Couldn\'t create directory');

    if (isPathError && retryCount < MAX_RETRIES) {
      retryCount++;
      db = null; // 인스턴스 초기화
      
      // 잠시 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return await getDatabase();
    }
    
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
    if (__DEV__) {
      console.log('Database closed');
    }
  }
};

// 데이터베이스 재초기화
export const resetDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    try {
      await db.closeAsync().catch(() => {});
    } catch (e) {
      // 무시
    }
    db = null;
  }
  // 잠시 대기하여 완전히 정리
  await new Promise(resolve => setTimeout(resolve, 200));
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
    if (__DEV__) {
      console.log('모든 데이터가 삭제되었습니다.');
    }
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
    if (__DEV__) {
      console.log(`항목 ${id}가 삭제되었습니다.`);
    }
  } catch (error) {
    console.error('데이터 삭제 중 오류:', error);
    throw error;
  }
};

// 항목 추가 (작업 큐를 통한 순차 처리)
export const addFixedMonthCost = async (
  name: string,
  amount: number,
  start_date: string
): Promise<number> => {
  // 작업을 큐에 추가하여 순차 처리
  const result = await (dbQueue = dbQueue.then(async () => {
    try {
      // 데이터베이스 인스턴스 가져오기
      let dbInstance = await getDatabase();
      
      // 데이터베이스 인스턴스가 null이거나 유효하지 않으면 재초기화 시도
      if (!dbInstance || typeof dbInstance.runAsync !== 'function') {
        // 전역 db 변수 초기화 후 재시도
        db = null;
        dbInstance = await resetDatabase();
        
        if (!dbInstance || typeof dbInstance.runAsync !== 'function') {
          throw new Error('Database instance is invalid after reset');
        }
      }

      // 데이터베이스 유효성 재검증
      const isValid = await validateDatabase(dbInstance);
      if (!isValid) {
        if (__DEV__) {
          console.log('데이터베이스 유효성 검증 실패, 재초기화...');
        }
        db = null;
        dbInstance = await resetDatabase();
        const retryIsValid = await validateDatabase(dbInstance);
        if (!retryIsValid) {
          throw new Error('Database validation failed after reset');
        }
      }

      const insertResult = await dbInstance.runAsync(
        'INSERT INTO fixed_month_costs (name, amount, start_date) VALUES (?, ?, ?)',
        [name, amount, start_date]
      );

      return insertResult.lastInsertRowId;
    } catch (error: unknown) {
      console.error('데이터 추가 중 오류:', error);
      
      // NullPointerException 오류인 경우 데이터베이스 재초기화 시도
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('NullPointerException') || errorMessage.includes('prepareAsync')) {
        if (__DEV__) {
          console.log('NullPointerException 감지, 데이터베이스 재초기화 시도...');
        }
        
        // 전역 변수 완전히 초기화
        if (db) {
          try {
            await db.closeAsync().catch(() => {});
          } catch (e) {
            // 무시
          }
        }
        db = null;
        isInitializing = false;
        
        // 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 재시도 (최대 1회)
        try {
          const dbInstance = await resetDatabase();
          const isValid = await validateDatabase(dbInstance);
          if (isValid && typeof dbInstance.runAsync === 'function') {
            const retryResult = await dbInstance.runAsync(
              'INSERT INTO fixed_month_costs (name, amount, start_date) VALUES (?, ?, ?)',
              [name, amount, start_date]
            );
            if (__DEV__) {
              console.log('재시도 성공');
            }
            return retryResult.lastInsertRowId;
          }
        } catch (retryError) {
          console.error('재시도 실패:', retryError);
        }
      }
      
      throw error;
    }
  }));

  return result;
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
    if (__DEV__) {
      console.log(`항목 ${id}가 수정되었습니다.`);
    }
  } catch (error) {
    console.error('데이터 수정 중 오류:', error);
    throw error;
  }
};

// ============================================================================
// 유동비 관련 함수
// ============================================================================

// 유동비 조회 (페이지네이션)
export const getVariableMonthExpenses = async (
  limit: number = 10,
  offset: number = 0,
  month?: string // YYYY-MM 형식, 선택적 필터
): Promise<VariableMonthExpense[]> => {
  try {
    const db = await getDatabase();
    let query = 'SELECT * FROM variable_month_expenses';
    const params: (string | number)[] = [];
    
    if (month) {
      query += " WHERE strftime('%Y-%m', spent_date) = ?";
      params.push(month);
    }
    
    query += ' ORDER BY spent_date DESC, id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const result = await db.getAllAsync(query, params);
    return result as VariableMonthExpense[];
  } catch (error) {
    console.error('유동비 조회 중 오류:', error);
    throw error;
  }
};

// 유동비 전체 개수 조회
export const getVariableMonthExpensesCount = async (month?: string): Promise<number> => {
  try {
    const db = await getDatabase();
    let query = 'SELECT COUNT(*) as count FROM variable_month_expenses';
    const params: string[] = [];
    
    if (month) {
      query += " WHERE strftime('%Y-%m', spent_date) = ?";
      params.push(month);
    }
    
    const result = await db.getFirstAsync<{ count: number }>(query, params);
    return result?.count || 0;
  } catch (error) {
    console.error('유동비 개수 조회 중 오류:', error);
    throw error;
  }
};

// 유동비 총액 계산
export const getVariableMonthExpensesTotal = async (month?: string): Promise<number> => {
  try {
    const db = await getDatabase();
    let query = 'SELECT SUM(amount) as total FROM variable_month_expenses';
    const params: string[] = [];
    
    if (month) {
      query += " WHERE strftime('%Y-%m', spent_date) = ?";
      params.push(month);
    }
    
    const result = await db.getFirstAsync<{ total: number | null }>(query, params);
    return result?.total || 0;
  } catch (error) {
    console.error('유동비 총액 조회 중 오류:', error);
    throw error;
  }
};

// 유동비 추가
export const addVariableMonthExpense = async (
  name: string,
  amount: number,
  spent_date: string,
  category?: string,
  memo?: string
): Promise<number> => {
  const result = await (dbQueue = dbQueue.then(async () => {
    try {
      let dbInstance = await getDatabase();
      
      if (!dbInstance || typeof dbInstance.runAsync !== 'function') {
        db = null;
        dbInstance = await resetDatabase();
        
        if (!dbInstance || typeof dbInstance.runAsync !== 'function') {
          throw new Error('Database instance is invalid after reset');
        }
      }

      const isValid = await validateDatabase(dbInstance);
      if (!isValid) {
        if (__DEV__) {
          console.log('데이터베이스 유효성 검증 실패, 재초기화...');
        }
        db = null;
        dbInstance = await resetDatabase();
        const retryIsValid = await validateDatabase(dbInstance);
        if (!retryIsValid) {
          throw new Error('Database validation failed after reset');
        }
      }

      const insertResult = await dbInstance.runAsync(
        'INSERT INTO variable_month_expenses (name, amount, spent_date, category, memo) VALUES (?, ?, ?, ?, ?)',
        [name, amount, spent_date, category || null, memo || null]
      );

      return insertResult.lastInsertRowId;
    } catch (error: unknown) {
      console.error('유동비 추가 중 오류:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('NullPointerException') || errorMessage.includes('prepareAsync')) {
        if (__DEV__) {
          console.log('NullPointerException 감지, 데이터베이스 재초기화 시도...');
        }
        
        if (db) {
          try {
            await db.closeAsync().catch(() => {});
          } catch (e) {
            // 무시
          }
        }
        db = null;
        isInitializing = false;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const dbInstance = await resetDatabase();
          const isValid = await validateDatabase(dbInstance);
          if (isValid && typeof dbInstance.runAsync === 'function') {
            const retryResult = await dbInstance.runAsync(
              'INSERT INTO variable_month_expenses (name, amount, spent_date, category, memo) VALUES (?, ?, ?, ?, ?)',
              [name, amount, spent_date, category || null, memo || null]
            );
            if (__DEV__) {
              console.log('재시도 성공');
            }
            return retryResult.lastInsertRowId;
          }
        } catch (retryError) {
          console.error('재시도 실패:', retryError);
        }
      }
      
      throw error;
    }
  }));

  return result;
};

// 유동비 수정
export const updateVariableMonthExpense = async (
  id: number,
  name: string,
  amount: number,
  spent_date: string,
  category?: string,
  memo?: string
): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE variable_month_expenses SET name = ?, amount = ?, spent_date = ?, category = ?, memo = ? WHERE id = ?',
      [name, amount, spent_date, category || null, memo || null, id]
    );
    if (__DEV__) {
      console.log(`유동비 항목 ${id}가 수정되었습니다.`);
    }
  } catch (error) {
    console.error('유동비 수정 중 오류:', error);
    throw error;
  }
};

// 유동비 삭제
export const deleteVariableMonthExpense = async (id: number): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM variable_month_expenses WHERE id = ?', [id]);
    if (__DEV__) {
      console.log(`유동비 항목 ${id}가 삭제되었습니다.`);
    }
  } catch (error) {
    console.error('유동비 삭제 중 오류:', error);
    throw error;
  }
};

// 월별 유동비 통계 조회
export const getVariableExpensesMonthlyStats = async (year: string, month: string): Promise<{
  total: number;
  count: number;
  byCategory: Array<{ category: string | null; total: number; count: number }>;
}> => {
  try {
    const db = await getDatabase();
    const monthStr = `${year}-${month.padStart(2, '0')}`;
    
    // 총액 및 개수
    const totalResult = await db.getFirstAsync<{ total: number | null; count: number }>(
      `SELECT SUM(amount) as total, COUNT(*) as count
       FROM variable_month_expenses
       WHERE strftime('%Y-%m', spent_date) = ?`,
      [monthStr]
    );
    
    // 카테고리별 통계
    const categoryResult = await db.getAllAsync<{ category: string | null; total: number; count: number }>(
      `SELECT 
        COALESCE(category, '미분류') as category,
        SUM(amount) as total,
        COUNT(*) as count
       FROM variable_month_expenses
       WHERE strftime('%Y-%m', spent_date) = ?
       GROUP BY category
       ORDER BY total DESC`,
      [monthStr]
    );
    
    return {
      total: totalResult?.total || 0,
      count: totalResult?.count || 0,
      byCategory: categoryResult || [],
    };
  } catch (error) {
    console.error('월별 유동비 통계 조회 중 오류:', error);
    throw error;
  }
};
