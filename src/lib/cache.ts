interface CacheData<T> {
  data: T;
  timestamp: number;
}

const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

export function getCachedData<T>(key: string): T | null {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    const { data, timestamp }: CacheData<T> = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
} 