import type {
  CheckDnsResponse,
  DnsOverallStatus,
  DnsRequestResponse,
  DnsStatus,
  EmailMissing,
} from "@/lib/dns-validation";
import type {
  FoundEntry,
  RecordTone,
  StatusKind,
} from "@/features/dns-setup-menu/types/dns-setup-menu.types";

export const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

export function getStatusKind(status: DnsOverallStatus | DnsStatus | null): StatusKind {
  if (status === "ACTIVE") return "ok";
  if (status === "FAILED" || status === "EXPIRED") return "bad";
  return "idle";
}

export function formatTimeLabel(value?: string | null) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp).toLocaleString();
}

export function formatCopyValue(value?: string | null, fallback = "-") {
  const normalized = value?.trim();
  if (normalized) return normalized;
  return fallback;
}

function normalizeDnsName(value: string) {
  return value.trim().toLowerCase().replace(/\.+$/, "");
}

function normalizeTxtValue(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function getEmailFoundEntries(item: EmailMissing): FoundEntry[] {
  if (item.key === "MX") {
    const expectedHost = normalizeDnsName(item.expected.host);
    const expectedPriority = item.expected.priority;
    return item.found.map((entry) => ({
      value: `${entry.exchange} (priority ${entry.priority})`,
      isCorrect:
        normalizeDnsName(entry.exchange) === expectedHost &&
        entry.priority === expectedPriority,
    }));
  }

  const expected = normalizeTxtValue(item.expected);
  return item.found.map((value) => ({
    value,
    isCorrect: normalizeTxtValue(value) === expected,
  }));
}

export function getRecordTone(recordOk: boolean | undefined, foundEntries: FoundEntry[]): RecordTone {
  if (typeof recordOk === "boolean") {
    return recordOk ? "ok" : "bad";
  }

  if (!foundEntries.length) {
    return "bad";
  }

  return foundEntries.every((entry) => entry.isCorrect)
    ? "ok"
    : "bad";
}

export function getRecordCardToneClass(recordTone: RecordTone) {
  return recordTone === "ok"
    ? "border-emerald-500/45 bg-emerald-500/5"
    : "border-rose-500/45 bg-rose-500/5";
}

export function prioritizePendingRecords<T extends { ok?: boolean }>(records: T[]) {
  if (records.length <= 1) return records;
  const pending: T[] = [];
  const ok: T[] = [];

  for (const record of records) {
    if (record.ok === true) {
      ok.push(record);
      continue;
    }
    pending.push(record);
  }

  return [...pending, ...ok];
}

export function getFoundEntryToneClass(recordTone: RecordTone) {
  return recordTone === "ok"
    ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-200"
    : "border-rose-500/45 bg-rose-500/10 text-rose-200";
}

export function getOverallStatus(
  data: CheckDnsResponse | null,
  request: DnsRequestResponse | null,
) {
  const typeStatus = data?.email?.status;
  return typeStatus ?? request?.status ?? data?.summary?.overall_status ?? null;
}

export function getNextCheckAt(data: CheckDnsResponse | null) {
  if (!data) return null;
  const typeNext = data.email?.next_check_at;
  return typeNext ?? data.summary?.next_check_at_min ?? null;
}

export function shouldStopPolling(data: CheckDnsResponse | null) {
  if (!data) return false;
  const overall = data.summary?.overall_status ?? null;
  if (overall === "ACTIVE" || overall === "EXPIRED" || overall === "FAILED") return true;
  const typeStatus = data.email?.status;
  return typeStatus === "ACTIVE" || typeStatus === "EXPIRED";
}
