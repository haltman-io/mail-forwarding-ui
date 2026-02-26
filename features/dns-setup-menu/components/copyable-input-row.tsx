import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clickableIconClass } from "@/features/dns-setup-menu/utils/dns-setup-menu.utils";
import type { CopyableInputRowProps } from "@/features/dns-setup-menu/types/dns-setup-menu.types";

export function CopyableInputRow({
  id,
  value,
  label,
  inputLabel,
  copyLabel,
  copiedId,
  onCopy,
}: CopyableInputRowProps) {
  const isCopied = copiedId === id;

  return (
    <div className="space-y-1 min-w-0">
      {label ? (
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">
          {label}
        </p>
      ) : null}
      <div className="flex min-w-0 items-center gap-2">
        <Input
          value={value}
          readOnly
          disabled
          title={value}
          aria-label={inputLabel}
          className="min-w-0 flex-1 bg-black/30 text-xs font-mono text-zinc-200/90 disabled:cursor-default disabled:opacity-100 truncate"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="group h-8 w-8 shrink-0 border-white/10 bg-white/5 hover:bg-white/10"
          onClick={() => onCopy(id, value, copyLabel)}
          aria-label={`Copy ${copyLabel}`}
        >
          {isCopied ? (
            <Check className={`h-3.5 w-3.5 text-emerald-300 ${clickableIconClass}`} />
          ) : (
            <Copy className={`h-3.5 w-3.5 ${clickableIconClass}`} />
          )}
        </Button>
      </div>
    </div>
  );
}
