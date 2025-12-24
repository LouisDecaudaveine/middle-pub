"use client";

import { useState, useEffect } from "react";

/**
 * A hook that debounces a value by the specified delay.
 * Returns the debounced value that only updates after the delay has passed
 * without the input value changing.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 400);
 *
 * useEffect(() => {
 *   // This effect runs only after the user stops typing for 400ms
 *   if (debouncedQuery) {
 *     searchAPI(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
