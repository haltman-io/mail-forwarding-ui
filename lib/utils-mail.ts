import { RE_DOMAIN } from "@/lib/domains";

const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;
const RE_RFC_DOT_ATOM_LOCAL =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const RE_ALIAS_LOCAL = /^[a-z0-9_-]+(?:\.[a-z0-9_-]+)*$/;

type ValidationResult = { ok: true; value: string } | { ok: false; error: string };

function splitMailbox(raw: string): { local: string; domain: string } | null {
  const firstAt = raw.indexOf("@");
  if (firstAt <= 0) return null;
  if (firstAt !== raw.lastIndexOf("@")) return null;
  if (firstAt >= raw.length - 1) return null;
  return { local: raw.slice(0, firstAt), domain: raw.slice(firstAt + 1) };
}

function validateLocalPart(local: string, pattern: RegExp): ValidationResult {
  if (local.length < 1 || local.length > MAX_LOCAL_LENGTH) {
    return { ok: false, error: "Local-part must be 1-64 characters." };
  }
  if (!pattern.test(local)) {
    return { ok: false, error: "Invalid local-part format." };
  }
  return { ok: true, value: local };
}

function validateDomainPart(domain: string): ValidationResult {
  const normalized = domain.toLowerCase();
  if (!RE_DOMAIN.test(normalized)) {
    return { ok: false, error: "Domain must follow strict DNS rules." };
  }
  return { ok: true, value: normalized };
}

export function validateAliasHandle(value: string): ValidationResult {
  const normalized = clampLower(value);
  return validateLocalPart(normalized, RE_ALIAS_LOCAL);
}

export function validateAliasEmail(value: string): ValidationResult {
  const normalized = clampLower(value);
  if (normalized.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: "Email address must be at most 254 characters." };
  }

  const parts = splitMailbox(normalized);
  if (!parts) {
    return { ok: false, error: "Address must be in local@domain format." };
  }

  const local = validateLocalPart(parts.local, RE_ALIAS_LOCAL);
  if (!local.ok) return local;

  const domain = validateDomainPart(parts.domain);
  if (!domain.ok) return domain;

  return { ok: true, value: `${local.value}@${domain.value}` };
}

export function validateMailboxEmail(value: string): ValidationResult {
  const normalized = value.trim();
  if (normalized.length > MAX_EMAIL_LENGTH) {
    return { ok: false, error: "Email address must be at most 254 characters." };
  }

  const parts = splitMailbox(normalized);
  if (!parts) {
    return { ok: false, error: "Address must be in local@domain format." };
  }

  const local = validateLocalPart(parts.local, RE_RFC_DOT_ATOM_LOCAL);
  if (!local.ok) return local;

  const domain = validateDomainPart(parts.domain);
  if (!domain.ok) return domain;

  return { ok: true, value: `${parts.local}@${domain.value}` };
}

export function isProbablyEmail(v: string) {
  return validateMailboxEmail(v).ok;
}

export function clampLower(s: string) {
  return s.trim().toLowerCase();
}

export function safeJson(data: unknown) {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export function badgeClasses(kind: "ok" | "bad" | "idle") {
  if (kind === "ok") {
    return "border-emerald-400/30 bg-emerald-400/12 text-emerald-200 shadow-[0_2px_6px_rgba(4,6,12,0.4),inset_0_1px_0_rgba(255,255,255,0.12)]";
  }
  if (kind === "bad") {
    return "border-rose-400/34 bg-rose-400/14 text-rose-200 shadow-[0_2px_6px_rgba(4,6,12,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]";
  }
  return "border-[color:var(--hairline-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] text-[color:var(--text-secondary)] shadow-[0_2px_6px_rgba(4,6,12,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]";
}
