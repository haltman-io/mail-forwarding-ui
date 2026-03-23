"use client";

import { useEffect, useState } from "react";
import { API_HOST } from "@/lib/api-host";

export type Stats = { domains: number; aliases: number };

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_HOST}/api/stats`)
      .then((r) => {
        if (!r.ok) throw new Error("stats fetch failed");
        return r.json() as Promise<Stats>;
      })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        /* silently fail — cards just won't render */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
