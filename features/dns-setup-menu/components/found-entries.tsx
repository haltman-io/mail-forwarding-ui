import { getFoundEntryToneClass } from "@/features/dns-setup-menu/utils/dns-setup-menu.utils";
import type { FoundEntry, RecordTone } from "@/features/dns-setup-menu/types/dns-setup-menu.types";

type FoundEntriesProps = {
  entries: FoundEntry[];
  foundTruncated: boolean;
  tone: RecordTone;
};

export function FoundEntries({ entries, foundTruncated, tone }: FoundEntriesProps) {
  if (!entries.length) {
    return (
      <p className={`mt-2 text-xs ${tone === "ok" ? "text-emerald-300" : "text-rose-300"}`}>
        Found: -
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <p className="text-xs text-zinc-400">
        Found:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map((entry, index) => (
          <span
            key={`${entry.value}-${index}`}
            className={`inline-flex max-w-full items-center rounded-md border px-2 py-1 text-[11px] font-mono leading-none ${getFoundEntryToneClass(tone)}`}
            title={entry.value}
          >
            <span className="truncate">
              {entry.value}
            </span>
          </span>
        ))}
      </div>
      {foundTruncated ? (
        <p className="text-[11px] text-amber-300">
          Found list truncated by API.
        </p>
      ) : null}
    </div>
  );
}
