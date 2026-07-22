"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QueryValue = string | number | null | undefined;

function serialize(values: Record<string, QueryValue>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (!text || text === "all") continue;
    params.set(key, text);
  }
  return params;
}

/**
 * Bidirectional URL query sync for admin list filters.
 * Reads initial values once from the URL, then writes on change (replace).
 */
export function useUrlQueryState<T extends Record<string, string>>(
  defaults: T,
  keys: (keyof T & string)[],
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hydrated = React.useRef(false);

  const initial = React.useMemo(() => {
    const next = { ...defaults };
    for (const key of keys) {
      const raw = searchParams.get(key);
      if (raw != null && raw !== "") {
        next[key] = raw as T[typeof key];
      }
    }
    return next;
    // Only hydrate from the first URL snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setState] = React.useState<T>(initial);

  React.useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const params = serialize(state as Record<string, QueryValue>);
    const qs = params.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    router.replace(href, { scroll: false });
  }, [state, pathname, router]);

  const setField = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const patch = React.useCallback((partial: Partial<T>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = React.useCallback(() => {
    setState(defaults);
  }, [defaults]);

  return { state, setState, setField, patch, reset };
}
