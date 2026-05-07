import type {
  CheckDnsResponse,
  DnsMissingRecord,
  DnsOverallStatus,
  DnsRequestType,
  DnsRequestResponse,
  DnsStatus,
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

export function getDnsFoundEntries(item: DnsMissingRecord): FoundEntry[] {
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
  type: DnsRequestType,
) {
  const typeStatus = getDnsTypeCheck(data, type)?.status;
  return typeStatus ?? request?.status ?? data?.summary?.overall_status ?? null;
}

type DnsTypeCheckView = {
  status: DnsStatus;
  next_check_at?: string;
  missing?: DnsMissingRecord[];
};

export function getDnsTypeCheck(
  data: CheckDnsResponse | null,
  type: DnsRequestType
): DnsTypeCheckView | null {
  if (!data) return null;
  const check = type === "UI" ? data.ui ?? null : data.email ?? null;
  return check as DnsTypeCheckView | null;
}

export function getDnsMissingRecords(
  data: CheckDnsResponse | null,
  type: DnsRequestType
): DnsMissingRecord[] {
  return getDnsTypeCheck(data, type)?.missing ?? [];
}

export function getNextCheckAt(data: CheckDnsResponse | null, type: DnsRequestType) {
  if (!data) return null;
  const typeNext = getDnsTypeCheck(data, type)?.next_check_at;
  return typeNext ?? data.summary?.next_check_at_min ?? null;
}

export function shouldStopPolling(data: CheckDnsResponse | null, type: DnsRequestType) {
  if (!data) return false;
  const typeStatus = getDnsTypeCheck(data, type)?.status;
  if (typeStatus === "ACTIVE" || typeStatus === "EXPIRED" || typeStatus === "FAILED") {
    return true;
  }

  const overall = data.summary?.overall_status ?? null;
  if (overall === "ACTIVE" || overall === "EXPIRED" || overall === "FAILED") return true;
  return false;
}
