"use client";

import * as React from "react";
import { toast } from "sonner";

export function useCopyFeedback(duration = 1500) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copyWithFeedback = React.useCallback(
    async (id: string, text: string, context?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast("Copied", { description: context ?? "Copied to clipboard." });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopiedId(null), duration);
      } catch {
        toast.error("Copy failed", { description: "Clipboard access was blocked." });
      }
    },
    [duration]
  );

  return { copiedId, copyWithFeedback };
}
