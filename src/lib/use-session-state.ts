"use client";

import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

const sessionState = new Map<string, unknown>();

export function useSessionState<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return sessionState.has(key) ? (sessionState.get(key) as T) : initialValue;
  });
  const valueRef = useRef(value);

  const setSessionValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previousValue: T) => T)(valueRef.current)
          : nextValue;

      valueRef.current = resolvedValue;
      sessionState.set(key, resolvedValue);
      setValue(resolvedValue);
    },
    [key]
  );

  return [value, setSessionValue];
}
