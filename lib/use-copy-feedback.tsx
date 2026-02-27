"use client";

import * as React from "react";
import { ClipboardIcon } from "lucide-react";
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
    async (id: string, text: string, context?: string, durationOverride?: number) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast("Copied to clipboard", {
          icon: <ClipboardIcon className="h-4 w-4 text-[var(--alias-accent)]" />,
        });
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopiedId(null), durationOverride ?? duration);
      } catch {
        toast.error("Copy failed", { description: "Clipboard access was blocked." });
      }
    },
    [duration]
  );

  return { copiedId, copyWithFeedback };
}
