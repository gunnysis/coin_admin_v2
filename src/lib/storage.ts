/**
 * 스토리지 유틸리티
 * AsyncStorage 래퍼 (향후 확장 가능)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export class Storage {
  /**
   * 값 저장
   */
  static async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await AsyncStorage.setItem(key, serialized);
    } catch (error) {
      throw new Error(`Failed to save ${key}: ${error}`);
    }
  }

  /**
   * 값 가져오기
   */
  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      throw new Error(`Failed to read ${key}: ${error}`);
    }
  }

  /**
   * 값 삭제
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new Error(`Failed to remove ${key}: ${error}`);
    }
  }

  /**
   * 모든 키 가져오기
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      return [...(await AsyncStorage.getAllKeys())];
    } catch (error) {
      throw new Error(`Failed to get all keys: ${error}`);
    }
  }

  /**
   * 모든 데이터 삭제
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error}`);
    }
  }
}

