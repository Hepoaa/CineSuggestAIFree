// FIX: Import Dispatch and SetStateAction from 'react' to resolve 'Cannot find namespace React' error.
import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved) as T;
      } catch (e) {
        console.error(`Error parsing JSON from localStorage key "${key}":`, e);
        return defaultValue;
      }
    }
  }
  return defaultValue;
}

// FIX: Use imported Dispatch and SetStateAction types directly without the 'React.' prefix.
export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
}
