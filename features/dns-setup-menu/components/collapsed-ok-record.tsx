import { Check } from "lucide-react";

type CollapsedOkRecordProps = {
  recordKey: string;
  name: string;
};

export function CollapsedOkRecord({ recordKey, name }: CollapsedOkRecordProps) {
  return (
    <div className="col-span-full flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
      <span className="text-xs">
        <span className="font-medium uppercase tracking-wide text-zinc-400">{recordKey}</span>{" "}
        <span className="font-mono text-zinc-500">{name}</span>{" "}
        <span className="text-emerald-400">OK!</span>
      </span>
    </div>
  );
}
