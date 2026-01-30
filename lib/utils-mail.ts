export function isProbablyEmail(v: string) {
  const s = v.trim();
  return s.length <= 254 && s.includes("@") && !s.startsWith("@") && !s.endsWith("@");
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
  if (kind === "ok") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  if (kind === "bad") return "border-rose-500/30 bg-rose-500/10 text-rose-200";
  return "border-white/10 bg-white/5 text-zinc-200";
}
