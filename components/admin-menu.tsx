"use client";

import * as React from "react";
import {
  AtSign,
  AlertTriangle,
  Ban,
  ChevronRight,
  ChevronsUpDown,
  Check,
  CheckCircle2,
  Copy,
  Globe2,
  KeyRound,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  Pencil,
  RefreshCw,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { API_HOST } from "@/lib/api-host";
import { fetchDomains, normalizeDomains, RE_DOMAIN } from "@/lib/domains";
import { validateAliasHandle, validateMailboxEmail } from "@/lib/utils-mail";
import { useCopyFeedback } from "@/lib/use-copy-feedback";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthStatus = "checking" | "unauthenticated" | "authenticated";
type AdminSection = "domains" | "aliases" | "handles" | "bans" | "api_tokens" | "users" | "my_password";
type BoolFilter = "all" | "1" | "0";
type BanType = "email" | "domain" | "ip" | "name";
type TokenStatusFilter = "all" | "active" | "revoked" | "expired";

type AdminSession = {
  token: string;
  tokenType: string;
  expiresAt: string | null;
  email: string | null;
  savedAt: string;
};

type AdminMe = {
  id: number;
  email: string;
  is_active: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

type AdminMeResponse = {
  ok?: boolean;
  authenticated?: boolean;
  admin?: AdminMe;
  auth?: {
    token_type?: string;
    expires_at?: string;
    session_id?: number;
  };
  error?: string;
};

type AdminDomain = {
  id: number;
  name: string;
  active: number | boolean;
};

type AdminAlias = {
  id: number;
  address: string;
  goto: string;
  active: number | boolean;
  domain_id?: number | null;
  created?: string | null;
  modified?: string | null;
};

type AdminHandle = {
  id: number;
  handle: string;
  address: string;
  active: number | boolean;
};

type AdminBan = {
  id: number;
  ban_type: string;
  ban_value: string;
  reason?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  active?: boolean | number;
};

type AdminApiToken = {
  id: number;
  owner_email: string;
  token_hash?: string;
  status?: string;
  created_at?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  created_ip?: string | null;
  user_agent?: string | null;
  last_used_at?: string | null;
  active?: boolean | number;
};

type AdminUser = {
  id: number;
  email: string;
  is_active: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

type Pagination = {
  total: number;
  limit: number;
  offset: number;
};

type ListResponse<T> = {
  items?: T[];
  pagination?: Partial<Pagination>;
  error?: string;
};

type CreateUpdateResponse<T> = {
  ok?: boolean;
  created?: boolean;
  updated?: boolean;
  deleted?: boolean;
  item?: T;
  token?: string;
  token_type?: string;
  error?: string;
  reason?: string;
};

type RequestResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  errorCode: string | null;
  errorReason: string | null;
  errorWhere: string | null;
  errorHint: string | null;
  errorField: string | null;
  retryAfterSeconds: number | null;
};

type ListState<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  loading: boolean;
  loadedAt: number | null;
  error: string | null;
};

type RequestErrorDescription = {
  isRateLimited: boolean;
  isLockoutGuard: boolean;
  message: string;
};

const ADMIN_STORAGE_KEY = "haltman.admin.session.v1";
const DEFAULT_LIMIT = 10;
const EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
const DOMAINS_URL = `${API_HOST}/domains`;
let adminDomainsCache: string[] | null = null;
let adminDomainsPromise: Promise<string[]> | null = null;

const clickableIconClass =
  "opacity-[0.85] transition-[opacity,transform,filter] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:opacity-100 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] group-active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none";

async function getAdminDomainsCached() {
  if (adminDomainsCache) return adminDomainsCache;
  if (adminDomainsPromise) return adminDomainsPromise;

  adminDomainsPromise = (async () => {
    try {
      const list = await fetchDomains(DOMAINS_URL);
      const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
      const fallback = normalizeDomains(fallbackRaw.split(","));
      const finalList = list.length ? list : fallback;
      adminDomainsCache = finalList;
      return finalList;
    } catch {
      const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
      const fallback = normalizeDomains(fallbackRaw.split(","));
      adminDomainsCache = fallback;
      return fallback;
    } finally {
      adminDomainsPromise = null;
    }
  })();

  return adminDomainsPromise;
}

function createListState<T>(): ListState<T> {
  return {
    items: [],
    total: 0,
    limit: DEFAULT_LIMIT,
    offset: 0,
    loading: false,
    loadedAt: null,
    error: null,
  };
}

function isTrueValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }
  return false;
}

function boolToApi(value: boolean) {
  return value ? 1 : 0;
}

function normalizeEmailInput(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function splitAliasAddress(value: string) {
  const normalized = value.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalized.length - 1) return null;
  return {
    handle: normalized.slice(0, atIndex),
    domain: normalized.slice(atIndex + 1),
  };
}

function safeDateLabel(value?: string | null) {
  if (!value) return "-";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString();
}

function dateTimeLocalToIso(value: string) {
  if (!value) return null;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString();
}

function isoToDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "";
  const date = new Date(parsed);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function readStoredSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (typeof parsed.token !== "string" || !parsed.token) return null;

    return {
      token: parsed.token,
      tokenType: typeof parsed.tokenType === "string" && parsed.tokenType ? parsed.tokenType : "bearer",
      expiresAt: typeof parsed.expiresAt === "string" ? parsed.expiresAt : null,
      email: typeof parsed.email === "string" ? parsed.email : null,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function saveSession(session: AdminSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
}

function clearSessionStorage() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ADMIN_STORAGE_KEY);
}

function clearDebounceTimer(timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current === null) return;
  clearTimeout(timerRef.current);
  timerRef.current = null;
}

function scheduleDebouncedSearch(
  timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
  callback: () => void,
  delayMs = 320
) {
  clearDebounceTimer(timerRef);
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    callback();
  }, delayMs);
}

function triggerSearchOnEnter(event: React.KeyboardEvent<HTMLInputElement>, callback: () => void) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  callback();
}

function useToastFeedback() {
  const toastSuccess = React.useCallback((title: string, description?: string) => {
    toast.success(title, { description, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> });
  }, []);

  const toastError = React.useCallback((title: string, description?: string) => {
    toast.error(title, { description, icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> });
  }, []);

  return { toastSuccess, toastError };
}

async function parseResponseBody<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function readStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRetryAfterBodyValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return null;
}

function parseRetryAfterHeader(value: string | null): number | null {
  if (!value) return null;

  const seconds = Number.parseInt(value.trim(), 10);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds;
  }

  const when = Date.parse(value);
  if (!Number.isNaN(when)) {
    return Math.max(0, Math.ceil((when - Date.now()) / 1000));
  }

  return null;
}

function extractApiErrorDetails(data: unknown) {
  if (!data || typeof data !== "object") {
    return {
      errorCode: null,
      errorReason: null,
      errorWhere: null,
      errorHint: null,
      errorField: null,
      retryAfterSeconds: null,
    };
  }

  const record = data as Record<string, unknown>;
  const bodyRetryAfter =
    readRetryAfterBodyValue(record.retry_after_seconds) ??
    readRetryAfterBodyValue(record.retry_after) ??
    readRetryAfterBodyValue(record.retry_after_sec) ??
    readRetryAfterBodyValue(record.retry_in_seconds);

  return {
    errorCode: readStringValue(record.error),
    errorReason: readStringValue(record.reason),
    errorWhere: readStringValue(record.where),
    errorHint: readStringValue(record.hint),
    errorField: readStringValue(record.field),
    retryAfterSeconds: bodyRetryAfter,
  };
}

function humanizeErrorToken(value: string | null) {
  if (!value) return null;
  return value.replace(/_/g, " ").trim();
}

function formatRetryAfterHint(seconds: number | null) {
  if (seconds === null) return "Try again in a moment.";
  if (seconds <= 1) return "Try again in 1 second.";
  if (seconds < 60) return `Try again in ${seconds} seconds.`;
  if (seconds < 3600) return `Try again in ${Math.ceil(seconds / 60)} minutes.`;
  return `Try again in ${Math.ceil(seconds / 3600)} hours.`;
}

function describeLoginRateLimitReason(reason: string | null) {
  switch (reason) {
    case "too_many_failed_attempts_email_ip":
      return "Too many failed login attempts for this email + IP.";
    case "too_many_failed_attempts_email_ip_heavy":
      return "Too many failed login attempts for this email + IP (heavy lock).";
    case "too_many_failed_attempts_email":
      return "Too many failed login attempts for this email.";
    case "too_many_failed_attempts_ip":
      return "Too many failed login attempts for this IP.";
    default: {
      const readable = humanizeErrorToken(reason);
      return readable ? `Rate limit triggered (${readable}).` : "Rate limit triggered.";
    }
  }
}

function describeRequestError(
  result: Pick<RequestResult<unknown>, "status" | "errorCode" | "errorReason" | "errorWhere" | "errorHint" | "errorField" | "retryAfterSeconds">,
  fallbackMessage: string,
  mode: "login" | "admin" = "admin"
): RequestErrorDescription {
  const code = result.errorCode;
  const reason = result.errorReason;
  const where = result.errorWhere;
  const hint = result.errorHint;
  const field = result.errorField;
  const isRateLimited = result.status === 429 || code === "rate_limited";

  if (isRateLimited) {
    const scope = where ? ` Scope: ${where}.` : "";
    if (mode === "login") {
      return {
        isRateLimited: true,
        isLockoutGuard: false,
        message: `${describeLoginRateLimitReason(reason)}${scope} ${formatRetryAfterHint(result.retryAfterSeconds)}`.trim(),
      };
    }

    const reasonText = humanizeErrorToken(reason);
    const reasonLine = reasonText ? ` Reason: ${reasonText}.` : "";
    return {
      isRateLimited: true,
      isLockoutGuard: false,
      message: `Admin rate limit reached.${scope}${reasonLine} ${formatRetryAfterHint(result.retryAfterSeconds)}`.trim(),
    };
  }

  if (code === "cannot_disable_last_admin") {
    return {
      isRateLimited: false,
      isLockoutGuard: true,
      message: "Lockout protection is active. You cannot disable or remove the last active admin user.",
    };
  }

  if (code === "invalid_params") {
    const parts = ["Invalid parameters."];
    if (field) parts.push(`Field: ${field}.`);
    if (reason) parts.push(`Reason: ${humanizeErrorToken(reason) ?? reason}.`);
    if (hint) parts.push(`Hint: ${hint}.`);
    return { isRateLimited: false, isLockoutGuard: false, message: parts.join(" ") };
  }

  if (code) {
    const parts = [`${fallbackMessage} (${code}).`];
    if (reason) parts.push(`Reason: ${humanizeErrorToken(reason) ?? reason}.`);
    if (hint) parts.push(`Hint: ${hint}.`);
    if (field) parts.push(`Field: ${field}.`);
    return { isRateLimited: false, isLockoutGuard: false, message: parts.join(" ") };
  }

  if (reason) {
    return {
      isRateLimited: false,
      isLockoutGuard: false,
      message: `${fallbackMessage} (${humanizeErrorToken(reason) ?? reason}).`,
    };
  }

  return { isRateLimited: false, isLockoutGuard: false, message: fallbackMessage };
}

async function adminRequest<T>({
  token,
  path,
  method = "GET",
  body,
}: {
  token: string;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}): Promise<RequestResult<T>> {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_HOST}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseResponseBody<T>(response);
  const errorDetails = extractApiErrorDetails(data);
  const headerRetryAfter = parseRetryAfterHeader(response.headers.get("retry-after"));
  const retryAfterSeconds = errorDetails.retryAfterSeconds ?? headerRetryAfter;

  return {
    ok: response.ok,
    status: response.status,
    data,
    errorCode: errorDetails.errorCode,
    errorReason: errorDetails.errorReason,
    errorWhere: errorDetails.errorWhere,
    errorHint: errorDetails.errorHint,
    errorField: errorDetails.errorField,
    retryAfterSeconds,
  };
}

function isUnauthorized(result: RequestResult<unknown>) {
  if (result.status === 401) return true;
  return result.errorCode === "missing_admin_token" || result.errorCode === "invalid_or_expired_admin_token";
}

function PaginationActions({
  state,
  onPrevious,
  onNext,
  busy,
}: {
  state: ListState<unknown>;
  onPrevious: () => void;
  onNext: () => void;
  busy: boolean;
}) {
  const from = state.total === 0 ? 0 : state.offset + 1;
  const to = Math.min(state.offset + state.limit, state.total);
  const canPrev = state.offset > 0;
  const canNext = state.offset + state.limit < state.total;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
      <span>
        {from}-{to} of {state.total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPrev || busy}
          className="h-7 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          onClick={onPrevious}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNext || busy}
          className="h-7 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

function SectionContainer({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-400">{description}</p>
      </div>
      <Separator className="bg-white/10" />
      {children}
    </section>
  );
}

export function AdminMenu() {
  const sectionLoaderRef = React.useRef<(section: AdminSection) => void>(() => {});

  const [authStatus, setAuthStatus] = React.useState<AuthStatus>("checking");
  const [session, setSession] = React.useState<AdminSession | null>(null);
  const [me, setMe] = React.useState<AdminMe | null>(null);

  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = React.useState(false);
  const [manageMenuOpen, setManageMenuOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<AdminSection>("domains");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginBusy, setLoginBusy] = React.useState(false);
  const [authFeedback, setAuthFeedback] = React.useState<string | null>(null);

  const [meBusy, setMeBusy] = React.useState(false);

  const [domains, setDomains] = React.useState<ListState<AdminDomain>>(createListState);
  const [aliases, setAliases] = React.useState<ListState<AdminAlias>>(createListState);
  const [handles, setHandles] = React.useState<ListState<AdminHandle>>(createListState);
  const [bans, setBans] = React.useState<ListState<AdminBan>>(createListState);
  const [apiTokens, setApiTokens] = React.useState<ListState<AdminApiToken>>(createListState);
  const [users, setUsers] = React.useState<ListState<AdminUser>>(createListState);

  const [domainsActiveFilter, setDomainsActiveFilter] = React.useState<BoolFilter>("all");
  const [aliasesActiveFilter, setAliasesActiveFilter] = React.useState<BoolFilter>("all");
  const [aliasesSearch, setAliasesSearch] = React.useState("");
  const [aliasesGotoSearch, setAliasesGotoSearch] = React.useState("");
  const [handlesActiveFilter, setHandlesActiveFilter] = React.useState<BoolFilter>("all");
  const [handlesHandleSearch, setHandlesHandleSearch] = React.useState("");
  const [handlesAddressSearch, setHandlesAddressSearch] = React.useState("");
  const [bansActiveFilter, setBansActiveFilter] = React.useState<BoolFilter>("all");
  const [bansTypeFilter, setBansTypeFilter] = React.useState<"all" | BanType>("all");
  const [bansSearch, setBansSearch] = React.useState("");
  const [tokenStatusFilter, setTokenStatusFilter] = React.useState<TokenStatusFilter>("all");
  const [tokenOwnerFilter, setTokenOwnerFilter] = React.useState("");
  const [usersActiveFilter, setUsersActiveFilter] = React.useState<BoolFilter>("all");
  const [usersSearch, setUsersSearch] = React.useState("");
  const aliasesSearchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlesSearchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const bansSearchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiTokensSearchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const usersSearchDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [domainEditorOpen, setDomainEditorOpen] = React.useState(false);
  const [domainEditorBusy, setDomainEditorBusy] = React.useState(false);
  const [domainFormId, setDomainFormId] = React.useState<number | null>(null);
  const [domainFormName, setDomainFormName] = React.useState("");
  const [domainFormActive, setDomainFormActive] = React.useState(true);

  const [aliasEditorOpen, setAliasEditorOpen] = React.useState(false);
  const [aliasEditorBusy, setAliasEditorBusy] = React.useState(false);
  const [aliasFormId, setAliasFormId] = React.useState<number | null>(null);
  const [aliasFormHandle, setAliasFormHandle] = React.useState("");
  const [aliasFormDomain, setAliasFormDomain] = React.useState("");
  const [aliasFormDestination, setAliasFormDestination] = React.useState("");
  const [aliasFormActive, setAliasFormActive] = React.useState(true);
  const [aliasDomains, setAliasDomains] = React.useState<string[]>(() => adminDomainsCache ?? []);
  const [aliasDomainsLoading, setAliasDomainsLoading] = React.useState(false);
  const [aliasDomainComboboxOpen, setAliasDomainComboboxOpen] = React.useState(false);

  const [handleEditorOpen, setHandleEditorOpen] = React.useState(false);
  const [handleEditorBusy, setHandleEditorBusy] = React.useState(false);
  const [handleFormId, setHandleFormId] = React.useState<number | null>(null);
  const [handleFormHandle, setHandleFormHandle] = React.useState("");
  const [handleFormAddress, setHandleFormAddress] = React.useState("");
  const [handleFormActive, setHandleFormActive] = React.useState(true);

  const [banEditorOpen, setBanEditorOpen] = React.useState(false);
  const [banEditorBusy, setBanEditorBusy] = React.useState(false);
  const [banFormId, setBanFormId] = React.useState<number | null>(null);
  const [banFormType, setBanFormType] = React.useState<BanType>("email");
  const [banFormValue, setBanFormValue] = React.useState("");
  const [banFormReason, setBanFormReason] = React.useState("");
  const [banFormExpiresAt, setBanFormExpiresAt] = React.useState("");
  const [banFormRevoked, setBanFormRevoked] = React.useState(false);
  const [banFormRevokedReason, setBanFormRevokedReason] = React.useState("");

  const [tokenEditorOpen, setTokenEditorOpen] = React.useState(false);
  const [tokenEditorBusy, setTokenEditorBusy] = React.useState(false);
  const [tokenFormId, setTokenFormId] = React.useState<number | null>(null);
  const [tokenFormOwnerEmail, setTokenFormOwnerEmail] = React.useState("");
  const [tokenFormDays, setTokenFormDays] = React.useState("30");
  const [tokenFormStatus, setTokenFormStatus] = React.useState("");
  const [tokenFormExpiresAt, setTokenFormExpiresAt] = React.useState("");
  const [tokenFormRevoked, setTokenFormRevoked] = React.useState(false);
  const [tokenFormRevokedReason, setTokenFormRevokedReason] = React.useState("");
  const [createdTokenPlaintext, setCreatedTokenPlaintext] = React.useState<string | null>(null);

  const [userEditorOpen, setUserEditorOpen] = React.useState(false);
  const [userEditorBusy, setUserEditorBusy] = React.useState(false);
  const [userFormId, setUserFormId] = React.useState<number | null>(null);
  const [userFormEmail, setUserFormEmail] = React.useState("");
  const [userFormPassword, setUserFormPassword] = React.useState("");
  const [userFormActive, setUserFormActive] = React.useState(true);

  const [passwordBusy, setPasswordBusy] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const [deleteSection, setDeleteSection] = React.useState<AdminSection | null>(null);
  const [deleteTargetId, setDeleteTargetId] = React.useState<number | null>(null);
  const [deleteLabel, setDeleteLabel] = React.useState("");

  const { copiedId, copyWithFeedback } = useCopyFeedback();
  const { toastSuccess, toastError } = useToastFeedback();

  const isAuthed = authStatus === "authenticated" && session !== null;
  const hasCompleteUsersSnapshot =
    usersActiveFilter === "all" &&
    users.offset === 0 &&
    users.total <= users.limit;
  const activeAdminUsersCount = React.useMemo(
    () => users.items.reduce((acc, item) => (isTrueValue(item.is_active) ? acc + 1 : acc), 0),
    [users.items]
  );
  const isKnownSingleActiveAdmin = hasCompleteUsersSnapshot && activeAdminUsersCount === 1;
  const isSoleActiveAdminById = React.useCallback((userId: number) => {
    if (!isKnownSingleActiveAdmin) return false;
    const target = users.items.find((item) => item.id === userId);
    return Boolean(target && isTrueValue(target.is_active));
  }, [isKnownSingleActiveAdmin, users.items]);
  const editingTargetIsSoleActiveAdmin =
    userFormId !== null &&
    isSoleActiveAdminById(userFormId);

  const resetDeleteState = React.useCallback(() => {
    setDeleteDialogOpen(false);
    setDeleteBusy(false);
    setDeleteSection(null);
    setDeleteTargetId(null);
    setDeleteLabel("");
  }, []);

  const forceLogout = React.useCallback((reason?: string, tone: "error" | "success" = "error") => {
    clearSessionStorage();
    setSession(null);
    setMe(null);
    setAuthStatus("unauthenticated");
    setAdminDialogOpen(false);
    setManageMenuOpen(false);
    resetDeleteState();

    if (reason) {
      if (tone === "success") {
        toastSuccess("Admin session ended", reason);
      } else {
        toastError("Admin session ended", reason);
      }
    }
  }, [resetDeleteState, toastError, toastSuccess]);

  const requireSessionToken = React.useCallback(() => {
    if (!session?.token) {
      forceLogout("Please authenticate again.");
      return null;
    }
    return session.token;
  }, [forceLogout, session?.token]);

  const handleUnauthorized = React.useCallback(() => {
    forceLogout("Token invalid or expired.");
  }, [forceLogout]);

  const updateListState = React.useCallback(<T,>(
    setter: React.Dispatch<React.SetStateAction<ListState<T>>>,
    updater: (current: ListState<T>) => ListState<T>
  ) => {
    setter((current) => updater(current));
  }, []);

  const ensureAliasDomainsLoaded = React.useCallback(async () => {
    if (aliasDomainsLoading) return;
    if (aliasDomains.length > 0) return;

    setAliasDomainsLoading(true);
    try {
      const list = await getAdminDomainsCached();
      setAliasDomains(list);
      setAliasFormDomain((current) => current || list[0] || "");
    } catch {
      setAliasDomains([]);
    } finally {
      setAliasDomainsLoading(false);
    }
  }, [aliasDomains.length, aliasDomainsLoading]);

  React.useEffect(() => {
    if (!aliasEditorOpen) return;
    void ensureAliasDomainsLoaded();
  }, [aliasEditorOpen, ensureAliasDomainsLoaded]);

  const verifySession = React.useCallback(async (tokenInput: string) => {
    setMeBusy(true);
    try {
      const result = await adminRequest<AdminMeResponse>({ token: tokenInput, path: "/admin/me" });

      if (isUnauthorized(result)) {
        return { ok: false as const, reason: "invalid_or_expired_admin_token" };
      }

      const valid =
        result.ok &&
        result.data?.ok === true &&
        result.data?.authenticated === true &&
        typeof result.data?.admin?.email === "string";

      if (!valid) {
        return {
          ok: false as const,
          reason: result.errorCode ?? result.errorReason ?? "invalid_admin_session",
        };
      }

      const adminData = result.data?.admin as AdminMe;
      setMe(adminData);
      setAuthStatus("authenticated");

      const nextSession: AdminSession = {
        token: tokenInput,
        tokenType:
          typeof result.data?.auth?.token_type === "string" && result.data.auth.token_type
            ? result.data.auth.token_type
            : "bearer",
        expiresAt: typeof result.data?.auth?.expires_at === "string" ? result.data.auth.expires_at : null,
        email: adminData.email,
        savedAt: new Date().toISOString(),
      };

      setSession(nextSession);
      saveSession(nextSession);

      return { ok: true as const };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      return { ok: false as const, reason: message };
    } finally {
      setMeBusy(false);
    }
  }, []);

  React.useEffect(() => {
    const stored = readStoredSession();
    if (!stored?.token) {
      setAuthStatus("unauthenticated");
      return;
    }

    void (async () => {
      const validation = await verifySession(stored.token);
      if (!validation.ok) {
        clearSessionStorage();
        setSession(null);
        setMe(null);
        setAuthStatus("unauthenticated");
      }
    })();
  }, [verifySession]);

  const loadDomains = React.useCallback(async (offset = domains.offset) => {
    const token = requireSessionToken();
    if (!token) return;

    updateListState(setDomains, (current) => ({ ...current, loading: true, error: null }));

    const params = new URLSearchParams({
      limit: String(domains.limit),
      offset: String(offset),
    });
    if (domainsActiveFilter !== "all") params.set("active", domainsActiveFilter);

    try {
      const result = await adminRequest<ListResponse<AdminDomain>>({
        token,
        path: `/admin/domains?${params.toString()}`,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Failed to load domains.");
        updateListState(setDomains, (current) => ({ ...current, loading: false, error: failure.message }));
        toastError(failure.isRateLimited ? "Rate limited" : "Domains request failed", failure.message);
        return;
      }

      const items = Array.isArray(result.data?.items) ? result.data.items : [];
      const pagination = result.data?.pagination;

      updateListState(setDomains, () => ({
        items,
        total: typeof pagination?.total === "number" ? pagination.total : items.length,
        limit: typeof pagination?.limit === "number" ? pagination.limit : domains.limit,
        offset: typeof pagination?.offset === "number" ? pagination.offset : offset,
        loading: false,
        loadedAt: Date.now(),
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      updateListState(setDomains, (current) => ({ ...current, loading: false, error: msg }));
      toastError("Network error", msg);
    }
  }, [domains.limit, domains.offset, domainsActiveFilter, handleUnauthorized, requireSessionToken, toastError, updateListState]);

  const loadAliases = React.useCallback(async (offset = aliases.offset) => {
    const token = requireSessionToken();
    if (!token) return;

    updateListState(setAliases, (current) => ({ ...current, loading: true, error: null }));

    const params = new URLSearchParams({
      limit: String(aliases.limit),
      offset: String(offset),
    });

    if (aliasesActiveFilter !== "all") params.set("active", aliasesActiveFilter);
    const addressSearch = aliasesSearch.trim();
    const gotoSearch = aliasesGotoSearch.trim();
    if (addressSearch) params.set("address", addressSearch.toLowerCase());
    if (gotoSearch) params.set("goto", normalizeEmailInput(gotoSearch));

    try {
      const result = await adminRequest<ListResponse<AdminAlias>>({
        token,
        path: `/admin/aliases?${params.toString()}`,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Failed to load aliases.");
        updateListState(setAliases, (current) => ({ ...current, loading: false, error: failure.message }));
        toastError(failure.isRateLimited ? "Rate limited" : "Aliases request failed", failure.message);
        return;
      }

      const items = Array.isArray(result.data?.items) ? result.data.items : [];
      const pagination = result.data?.pagination;

      updateListState(setAliases, () => ({
        items,
        total: typeof pagination?.total === "number" ? pagination.total : items.length,
        limit: typeof pagination?.limit === "number" ? pagination.limit : aliases.limit,
        offset: typeof pagination?.offset === "number" ? pagination.offset : offset,
        loading: false,
        loadedAt: Date.now(),
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      updateListState(setAliases, (current) => ({ ...current, loading: false, error: msg }));
      toastError("Network error", msg);
    }
  }, [aliases.limit, aliases.offset, aliasesActiveFilter, aliasesGotoSearch, aliasesSearch, handleUnauthorized, requireSessionToken, toastError, updateListState]);

  const loadHandles = React.useCallback(async (offset = handles.offset) => {
    const token = requireSessionToken();
    if (!token) return;

    updateListState(setHandles, (current) => ({ ...current, loading: true, error: null }));

    const params = new URLSearchParams({
      limit: String(handles.limit),
      offset: String(offset),
    });

    if (handlesActiveFilter !== "all") params.set("active", handlesActiveFilter);
    const handleValue = handlesHandleSearch.trim();
    const addressValue = handlesAddressSearch.trim();
    if (handleValue) params.set("handle", handleValue.toLowerCase());
    if (addressValue) params.set("address", addressValue.toLowerCase());

    try {
      const result = await adminRequest<ListResponse<AdminHandle>>({
        token,
        path: `/admin/handles?${params.toString()}`,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Failed to load handles.");
        updateListState(setHandles, (current) => ({ ...current, loading: false, error: failure.message }));
        toastError(failure.isRateLimited ? "Rate limited" : "Handles request failed", failure.message);
        return;
      }

      const items = Array.isArray(result.data?.items) ? result.data.items : [];
      const pagination = result.data?.pagination;

      updateListState(setHandles, () => ({
        items,
        total: typeof pagination?.total === "number" ? pagination.total : items.length,
        limit: typeof pagination?.limit === "number" ? pagination.limit : handles.limit,
        offset: typeof pagination?.offset === "number" ? pagination.offset : offset,
        loading: false,
        loadedAt: Date.now(),
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      updateListState(setHandles, (current) => ({ ...current, loading: false, error: msg }));
      toastError("Network error", msg);
    }
  }, [
    handleUnauthorized,
    handles.limit,
    handles.offset,
    handlesActiveFilter,
    handlesAddressSearch,
    handlesHandleSearch,
    requireSessionToken,
    toastError,
    updateListState,
  ]);

  const loadBans = React.useCallback(async (offset = bans.offset) => {
    const token = requireSessionToken();
    if (!token) return;

    updateListState(setBans, (current) => ({ ...current, loading: true, error: null }));

    const params = new URLSearchParams({
      limit: String(bans.limit),
      offset: String(offset),
    });

    if (bansActiveFilter !== "all") params.set("active", bansActiveFilter);
    if (bansTypeFilter !== "all") params.set("ban_type", bansTypeFilter);
    const q = bansSearch.trim();
    if (q) params.set("ban_value", q);

    try {
      const result = await adminRequest<ListResponse<AdminBan>>({
        token,
        path: `/admin/bans?${params.toString()}`,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Failed to load bans.");
        updateListState(setBans, (current) => ({ ...current, loading: false, error: failure.message }));
        toastError(failure.isRateLimited ? "Rate limited" : "Bans request failed", failure.message);
        return;
      }

      const items = Array.isArray(result.data?.items) ? result.data.items : [];
      const pagination = result.data?.pagination;

      updateListState(setBans, () => ({
        items,
        total: typeof pagination?.total === "number" ? pagination.total : items.length,
        limit: typeof pagination?.limit === "number" ? pagination.limit : bans.limit,
        offset: typeof pagination?.offset === "number" ? pagination.offset : offset,
        loading: false,
        loadedAt: Date.now(),
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      updateListState(setBans, (current) => ({ ...current, loading: false, error: msg }));
      toastError("Network error", msg);
    }
  }, [bans.limit, bans.offset, bansActiveFilter, bansTypeFilter, bansSearch, handleUnauthorized, requireSessionToken, toastError, updateListState]);

  const loadApiTokens = React.useCallback(async (offset = apiTokens.offset) => {
    const token = requireSessionToken();
    if (!token) return;

    updateListState(setApiTokens, (current) => ({ ...current, loading: true, error: null }));

    const params = new URLSearchParams({
      limit: String(apiTokens.limit),
      offset: String(offset),
    });

    if (tokenStatusFilter !== "all") params.set("status", tokenStatusFilter);
    const owner = tokenOwnerFilter.trim();
    if (owner) params.set("owner_email", owner.toLowerCase());

    try {
      const result = await adminRequest<ListResponse<AdminApiToken>>({
        token,
        path: `/admin/api-tokens?${params.toString()}`,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Failed to load API tokens.");
        updateListState(setApiTokens, (current) => ({ ...current, loading: false, error: failure.message }));
        toastError(failure.isRateLimited ? "Rate limited" : "API tokens request failed", failure.message);
        return;
      }

      const items = Array.isArray(result.data?.items) ? result.data.items : [];
      const pagination = result.data?.pagination;

      updateListState(setApiTokens, () => ({
        items,
        total: typeof pagination?.total === "number" ? pagination.total : items.length,
        limit: typeof pagination?.limit === "number" ? pagination.limit : apiTokens.limit,
        offset: typeof pagination?.offset === "number" ? pagination.offset : offset,
        loading: false,
        loadedAt: Date.now(),
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      updateListState(setApiTokens, (current) => ({ ...current, loading: false, error: msg }));
      toastError("Network error", msg);
    }
  }, [apiTokens.limit, apiTokens.offset, handleUnauthorized, requireSessionToken, toastError, tokenOwnerFilter, tokenStatusFilter, updateListState]);

  const loadUsers = React.useCallback(async (offset = users.offset) => {
    const token = requireSessionToken();
    if (!token) return;

    updateListState(setUsers, (current) => ({ ...current, loading: true, error: null }));

    const params = new URLSearchParams({
      limit: String(users.limit),
      offset: String(offset),
    });

    if (usersActiveFilter !== "all") params.set("active", usersActiveFilter);
    const q = usersSearch.trim();
    if (q) params.set("email", q.toLowerCase());

    try {
      const result = await adminRequest<ListResponse<AdminUser>>({
        token,
        path: `/admin/users?${params.toString()}`,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Failed to load users.");
        updateListState(setUsers, (current) => ({ ...current, loading: false, error: failure.message }));
        toastError(failure.isRateLimited ? "Rate limited" : "Users request failed", failure.message);
        return;
      }

      const items = Array.isArray(result.data?.items) ? result.data.items : [];
      const pagination = result.data?.pagination;

      updateListState(setUsers, () => ({
        items,
        total: typeof pagination?.total === "number" ? pagination.total : items.length,
        limit: typeof pagination?.limit === "number" ? pagination.limit : users.limit,
        offset: typeof pagination?.offset === "number" ? pagination.offset : offset,
        loading: false,
        loadedAt: Date.now(),
        error: null,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      updateListState(setUsers, (current) => ({ ...current, loading: false, error: msg }));
      toastError("Network error", msg);
    }
  }, [handleUnauthorized, requireSessionToken, toastError, updateListState, users.limit, users.offset, usersActiveFilter, usersSearch]);

  const runAliasesSearch = React.useCallback(() => {
    void loadAliases(0);
  }, [loadAliases]);

  const runHandlesSearch = React.useCallback(() => {
    void loadHandles(0);
  }, [loadHandles]);

  const runBansSearch = React.useCallback(() => {
    void loadBans(0);
  }, [loadBans]);

  const runApiTokensSearch = React.useCallback(() => {
    void loadApiTokens(0);
  }, [loadApiTokens]);

  const runUsersSearch = React.useCallback(() => {
    void loadUsers(0);
  }, [loadUsers]);

  const flushAliasesSearch = React.useCallback(() => {
    clearDebounceTimer(aliasesSearchDebounceRef);
    runAliasesSearch();
  }, [runAliasesSearch]);

  const flushHandlesSearch = React.useCallback(() => {
    clearDebounceTimer(handlesSearchDebounceRef);
    runHandlesSearch();
  }, [runHandlesSearch]);

  const flushBansSearch = React.useCallback(() => {
    clearDebounceTimer(bansSearchDebounceRef);
    runBansSearch();
  }, [runBansSearch]);

  const flushApiTokensSearch = React.useCallback(() => {
    clearDebounceTimer(apiTokensSearchDebounceRef);
    runApiTokensSearch();
  }, [runApiTokensSearch]);

  const flushUsersSearch = React.useCallback(() => {
    clearDebounceTimer(usersSearchDebounceRef);
    runUsersSearch();
  }, [runUsersSearch]);

  React.useEffect(() => {
    return () => {
      clearDebounceTimer(aliasesSearchDebounceRef);
      clearDebounceTimer(handlesSearchDebounceRef);
      clearDebounceTimer(bansSearchDebounceRef);
      clearDebounceTimer(apiTokensSearchDebounceRef);
      clearDebounceTimer(usersSearchDebounceRef);
    };
  }, []);

  React.useEffect(() => {
    clearDebounceTimer(aliasesSearchDebounceRef);
    clearDebounceTimer(handlesSearchDebounceRef);
    clearDebounceTimer(bansSearchDebounceRef);
    clearDebounceTimer(apiTokensSearchDebounceRef);
    clearDebounceTimer(usersSearchDebounceRef);
  }, [activeSection, adminDialogOpen, isAuthed]);

  const loadSection = React.useCallback((section: AdminSection) => {
    if (section === "domains") {
      void loadDomains();
      return;
    }
    if (section === "aliases") {
      void loadAliases();
      return;
    }
    if (section === "handles") {
      void loadHandles();
      return;
    }
    if (section === "bans") {
      void loadBans();
      return;
    }
    if (section === "api_tokens") {
      void loadApiTokens();
      return;
    }
    if (section === "users") {
      void loadUsers();
    }
  }, [loadAliases, loadApiTokens, loadBans, loadDomains, loadHandles, loadUsers]);

  sectionLoaderRef.current = loadSection;

  React.useEffect(() => {
    if (!isAuthed) return;
    if (!adminDialogOpen) return;
    sectionLoaderRef.current(activeSection);
  }, [activeSection, adminDialogOpen, isAuthed]);

  async function onLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const emailNormalized = normalizeEmailInput(email);
    const emailValidation = validateMailboxEmail(emailNormalized);
    if (!emailValidation.ok) {
      setAuthFeedback("Use um e-mail válido para autenticação admin.");
      return;
    }

    const passwordValue = password;
    if (!passwordValue.trim()) {
      setAuthFeedback("Senha é obrigatória.");
      return;
    }

    setAuthFeedback(null);
    setLoginBusy(true);

    try {
      const response = await fetch(`${API_HOST}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValidation.value, password: passwordValue }),
      });

      const data = (await parseResponseBody<{
        ok?: boolean;
        error?: string;
        reason?: string;
        where?: string;
        hint?: string;
        retry_after_seconds?: number;
        retry_after?: number;
        admin?: { email?: string };
        auth?: { token?: string; token_type?: string; expires_at?: string };
      }>(response)) ?? null;

      const token = data?.auth?.token;
      const success = response.ok && data?.ok === true && typeof token === "string" && token.length > 0;

      if (!success) {
        const details = extractApiErrorDetails(data);
        const failure = describeRequestError(
          {
            status: response.status,
            errorCode: details.errorCode,
            errorReason: details.errorReason,
            errorWhere: details.errorWhere,
            errorHint: details.errorHint,
            errorField: details.errorField,
            retryAfterSeconds: details.retryAfterSeconds ?? parseRetryAfterHeader(response.headers.get("retry-after")),
          },
          details.errorCode === "invalid_credentials" ? "Invalid credentials." : "Authentication failed.",
          "login"
        );

        setAuthFeedback(failure.message);
        toastError(failure.isRateLimited ? "Rate limited" : "Admin login failed", failure.message);
        return;
      }

      const sessionCandidate: AdminSession = {
        token,
        tokenType: typeof data?.auth?.token_type === "string" && data.auth.token_type ? data.auth.token_type : "bearer",
        expiresAt: typeof data?.auth?.expires_at === "string" ? data.auth.expires_at : null,
        email: typeof data?.admin?.email === "string" ? data.admin.email : emailValidation.value,
        savedAt: new Date().toISOString(),
      };

      setSession(sessionCandidate);
      saveSession(sessionCandidate);

      const validation = await verifySession(sessionCandidate.token);
      if (!validation.ok) {
        const reason = validation.reason === "invalid_or_expired_admin_token" ? "Token inválido ou expirado." : validation.reason;
        clearSessionStorage();
        setSession(null);
        setMe(null);
        setAuthStatus("unauthenticated");
        setAuthFeedback(reason);
        toastError("Admin login failed", reason);
        return;
      }

      setAuthDialogOpen(false);
      setEmail("");
      setPassword("");
      setAuthFeedback(null);
      toastSuccess("Admin authenticated", sessionCandidate.email ?? undefined);
      setAdminDialogOpen(true);
      setActiveSection("domains");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setAuthFeedback(`Erro de rede: ${message}`);
      toastError("Network error", message);
    } finally {
      setLoginBusy(false);
    }
  }

  async function onRefreshSession() {
    const token = requireSessionToken();
    if (!token) return;

    const result = await verifySession(token);
    if (!result.ok) {
      handleUnauthorized();
      return;
    }

    toastSuccess("Session refreshed", me?.email ?? undefined);
  }

  function openSection(section: AdminSection) {
    setActiveSection(section);
    setAdminDialogOpen(true);
  }

  function openDomainEditor(item?: AdminDomain) {
    if (item) {
      setDomainFormId(item.id);
      setDomainFormName(item.name);
      setDomainFormActive(isTrueValue(item.active));
    } else {
      setDomainFormId(null);
      setDomainFormName("");
      setDomainFormActive(true);
    }
    setDomainEditorOpen(true);
  }

  async function submitDomainEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    const name = domainFormName.trim().toLowerCase();
    if (!name) {
      toastError("Validation", "Domain is required.");
      return;
    }

    setDomainEditorBusy(true);

    try {
      const isEdit = domainFormId !== null;
      const path = isEdit ? `/admin/domains/${domainFormId}` : "/admin/domains";
      const method = isEdit ? "PATCH" : "POST";

      const result = await adminRequest<CreateUpdateResponse<AdminDomain>>({
        token,
        path,
        method,
        body: {
          name,
          active: boolToApi(domainFormActive),
        },
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Could not save domain.");
        toastError(failure.isRateLimited ? "Rate limited" : "Domain action failed", failure.message);
        return;
      }

      setDomainEditorOpen(false);
      toastSuccess(isEdit ? "Domain updated" : "Domain created", name);
      await loadDomains();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setDomainEditorBusy(false);
    }
  }

  function openAliasEditor(item?: AdminAlias) {
    void ensureAliasDomainsLoaded();
    setAliasDomainComboboxOpen(false);

    if (item) {
      const parsedAlias = splitAliasAddress(item.address);
      setAliasFormId(item.id);
      setAliasFormHandle(parsedAlias?.handle ?? item.address);
      setAliasFormDomain(parsedAlias?.domain ?? aliasDomains[0] ?? "");
      setAliasFormDestination(item.goto);
      setAliasFormActive(isTrueValue(item.active));
    } else {
      setAliasFormId(null);
      setAliasFormHandle("");
      setAliasFormDomain(aliasDomains[0] ?? "");
      setAliasFormDestination("");
      setAliasFormActive(true);
    }
    setAliasEditorOpen(true);
  }

  async function submitAliasEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    const handleValidation = validateAliasHandle(aliasFormHandle.trim().toLowerCase());
    if (!handleValidation.ok) {
      toastError("Validation", "Handle must use strict alias rules (a-z 0-9 dot underscore hyphen).");
      return;
    }

    const domainValue = aliasFormDomain.trim().toLowerCase();
    if (!RE_DOMAIN.test(domainValue)) {
      toastError("Validation", "Select a valid domain from the available list.");
      return;
    }

    const destinationValidation = validateMailboxEmail(aliasFormDestination.trim().toLowerCase());
    if (!destinationValidation.ok) {
      toastError("Validation", "Destination must be a valid email.");
      return;
    }

    const aliasAddress = `${handleValidation.value}@${domainValue}`;
    if (aliasAddress.length > 254) {
      toastError("Validation", "Alias email is too long.");
      return;
    }

    setAliasEditorBusy(true);

    try {
      const isEdit = aliasFormId !== null;
      const path = isEdit ? `/admin/aliases/${aliasFormId}` : "/admin/aliases";
      const method = isEdit ? "PATCH" : "POST";

      const result = await adminRequest<CreateUpdateResponse<AdminAlias>>({
        token,
        path,
        method,
        body: {
          address: aliasAddress,
          goto: destinationValidation.value,
          active: boolToApi(aliasFormActive),
        },
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Could not save alias.");
        toastError(failure.isRateLimited ? "Rate limited" : "Alias action failed", failure.message);
        return;
      }

      setAliasEditorOpen(false);
      toastSuccess(isEdit ? "Alias updated" : "Alias created", aliasAddress);
      await loadAliases();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setAliasEditorBusy(false);
    }
  }

  function openHandleEditor(item?: AdminHandle) {
    if (item) {
      setHandleFormId(item.id);
      setHandleFormHandle(item.handle);
      setHandleFormAddress(item.address);
      setHandleFormActive(isTrueValue(item.active));
    } else {
      setHandleFormId(null);
      setHandleFormHandle("");
      setHandleFormAddress("");
      setHandleFormActive(true);
    }
    setHandleEditorOpen(true);
  }

  async function submitHandleEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    const handleValidation = validateAliasHandle(handleFormHandle.trim().toLowerCase());
    if (!handleValidation.ok) {
      toastError("Validation", handleValidation.error);
      return;
    }

    const addressValidation = validateMailboxEmail(handleFormAddress.trim().toLowerCase());
    if (!addressValidation.ok) {
      toastError("Validation", "Destination must be a valid email.");
      return;
    }

    setHandleEditorBusy(true);

    try {
      const isEdit = handleFormId !== null;
      const path = isEdit ? `/admin/handles/${handleFormId}` : "/admin/handles";
      const method = isEdit ? "PATCH" : "POST";

      const result = await adminRequest<CreateUpdateResponse<AdminHandle>>({
        token,
        path,
        method,
        body: {
          handle: handleValidation.value,
          address: addressValidation.value,
          active: boolToApi(handleFormActive),
        },
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Could not save handle.");
        toastError(failure.isRateLimited ? "Rate limited" : "Handle action failed", failure.message);
        return;
      }

      setHandleEditorOpen(false);
      toastSuccess(isEdit ? "Handle updated" : "Handle created", `${handleValidation.value} -> ${addressValidation.value}`);
      await loadHandles();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setHandleEditorBusy(false);
    }
  }

  function openBanEditor(item?: AdminBan) {
    if (item) {
      const type = (item.ban_type as BanType | undefined) ?? "email";
      setBanFormId(item.id);
      setBanFormType(type);
      setBanFormValue(item.ban_value ?? "");
      setBanFormReason(item.reason ?? "");
      setBanFormExpiresAt(isoToDateTimeLocal(item.expires_at));
      setBanFormRevoked(Boolean(item.revoked_at));
      setBanFormRevokedReason(item.revoked_reason ?? "");
    } else {
      setBanFormId(null);
      setBanFormType("email");
      setBanFormValue("");
      setBanFormReason("");
      setBanFormExpiresAt("");
      setBanFormRevoked(false);
      setBanFormRevokedReason("");
    }
    setBanEditorOpen(true);
  }

  async function submitBanEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    const value = banFormValue.trim();
    if (!value) {
      toastError("Validation", "Ban value is required.");
      return;
    }

    const expiresIso = dateTimeLocalToIso(banFormExpiresAt);
    if (banFormExpiresAt && !expiresIso) {
      toastError("Validation", "Invalid expiration date.");
      return;
    }

    setBanEditorBusy(true);

    try {
      const isEdit = banFormId !== null;
      const path = isEdit ? `/admin/bans/${banFormId}` : "/admin/bans";
      const method = isEdit ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        ban_type: banFormType,
        ban_value: value,
      };

      if (banFormReason.trim()) body.reason = banFormReason.trim();
      if (expiresIso) body.expires_at = expiresIso;

      if (isEdit) {
        body.revoked = boolToApi(banFormRevoked);
        if (banFormRevokedReason.trim()) {
          body.revoked_reason = banFormRevokedReason.trim();
        }
      }

      const result = await adminRequest<CreateUpdateResponse<AdminBan>>({
        token,
        path,
        method,
        body,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Could not save ban.");
        toastError(failure.isRateLimited ? "Rate limited" : "Ban action failed", failure.message);
        return;
      }

      setBanEditorOpen(false);
      toastSuccess(isEdit ? "Ban updated" : "Ban created", `${banFormType}:${value}`);
      await loadBans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setBanEditorBusy(false);
    }
  }

  function openTokenEditor(item?: AdminApiToken) {
    if (item) {
      setTokenFormId(item.id);
      setTokenFormOwnerEmail(item.owner_email ?? "");
      setTokenFormDays("30");
      setTokenFormStatus(item.status ?? "");
      setTokenFormExpiresAt(isoToDateTimeLocal(item.expires_at));
      setTokenFormRevoked(Boolean(item.revoked_at));
      setTokenFormRevokedReason(item.revoked_reason ?? "");
    } else {
      setTokenFormId(null);
      setTokenFormOwnerEmail("");
      setTokenFormDays("30");
      setTokenFormStatus("active");
      setTokenFormExpiresAt("");
      setTokenFormRevoked(false);
      setTokenFormRevokedReason("");
    }
    setCreatedTokenPlaintext(null);
    setTokenEditorOpen(true);
  }

  async function submitTokenEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    const ownerValidation = validateMailboxEmail(tokenFormOwnerEmail.trim().toLowerCase());
    if (!ownerValidation.ok) {
      toastError("Validation", "Owner email must be valid.");
      return;
    }

    setTokenEditorBusy(true);

    try {
      const isEdit = tokenFormId !== null;
      const path = isEdit ? `/admin/api-tokens/${tokenFormId}` : "/admin/api-tokens";
      const method = isEdit ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        owner_email: ownerValidation.value,
      };

      if (isEdit) {
        if (tokenFormStatus.trim()) body.status = tokenFormStatus.trim();

        const expiresIso = dateTimeLocalToIso(tokenFormExpiresAt);
        if (tokenFormExpiresAt && !expiresIso) {
          toastError("Validation", "Invalid expiration date.");
          return;
        }
        if (expiresIso) body.expires_at = expiresIso;

        body.revoked = boolToApi(tokenFormRevoked);
        if (tokenFormRevokedReason.trim()) {
          body.revoked_reason = tokenFormRevokedReason.trim();
        }
      } else {
        const days = Number.parseInt(tokenFormDays, 10);
        if (!Number.isFinite(days) || days < 1 || days > 90) {
          toastError("Validation", "Days must be between 1 and 90.");
          return;
        }
        body.days = days;
      }

      const result = await adminRequest<CreateUpdateResponse<AdminApiToken>>({
        token,
        path,
        method,
        body,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Could not save API token.");
        toastError(failure.isRateLimited ? "Rate limited" : "API token action failed", failure.message);
        return;
      }

      if (!isEdit && typeof result.data?.token === "string" && result.data.token) {
        setCreatedTokenPlaintext(result.data.token);
      }

      setTokenEditorOpen(false);
      toastSuccess(isEdit ? "API token updated" : "API token created", ownerValidation.value);
      await loadApiTokens();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setTokenEditorBusy(false);
    }
  }

  function openUserEditor(item?: AdminUser) {
    if (item) {
      setUserFormId(item.id);
      setUserFormEmail(item.email);
      setUserFormPassword("");
      setUserFormActive(isTrueValue(item.is_active));
    } else {
      setUserFormId(null);
      setUserFormEmail("");
      setUserFormPassword("");
      setUserFormActive(true);
    }

    setUserEditorOpen(true);
  }

  async function submitUserEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    const emailValidation = validateMailboxEmail(userFormEmail.trim().toLowerCase());
    if (!emailValidation.ok) {
      toastError("Validation", "User email must be valid.");
      return;
    }

    const isEdit = userFormId !== null;
    if (isEdit && !userFormActive && editingTargetIsSoleActiveAdmin) {
      toastError("Lockout protection", "You cannot disable the last active admin user.");
      return;
    }

    if (!isEdit && userFormPassword.length < 6) {
      toastError("Validation", "Password must have at least 6 characters.");
      return;
    }

    setUserEditorBusy(true);

    try {
      const path = isEdit ? `/admin/users/${userFormId}` : "/admin/users";
      const method = isEdit ? "PATCH" : "POST";

      const body: Record<string, unknown> = {
        email: emailValidation.value,
        is_active: boolToApi(userFormActive),
      };

      if (userFormPassword.trim()) {
        body.password = userFormPassword;
      }

      const result = await adminRequest<CreateUpdateResponse<AdminUser>>({
        token,
        path,
        method,
        body,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Could not save admin user.");
        const title = failure.isRateLimited
          ? "Rate limited"
          : failure.isLockoutGuard
            ? "Lockout protection"
            : "Admin user action failed";
        toastError(title, failure.message);
        return;
      }

      setUserEditorOpen(false);
      toastSuccess(isEdit ? "Admin user updated" : "Admin user created", emailValidation.value);
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setUserEditorBusy(false);
    }
  }

  function askDelete(section: AdminSection, id: number, label: string) {
    if (section === "users" && isSoleActiveAdminById(id)) {
      toastError("Lockout protection", "You cannot remove the last active admin user.");
      return;
    }

    setDeleteSection(section);
    setDeleteTargetId(id);
    setDeleteLabel(label);
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleteSection || deleteTargetId === null) return;
    const token = requireSessionToken();
    if (!token) return;

    setDeleteBusy(true);

    try {
      let path = "";
      const method = "DELETE" as const;
      let body: Record<string, unknown> | undefined;

      if (deleteSection === "domains") {
        path = `/admin/domains/${deleteTargetId}`;
      } else if (deleteSection === "aliases") {
        path = `/admin/aliases/${deleteTargetId}`;
      } else if (deleteSection === "handles") {
        path = `/admin/handles/${deleteTargetId}`;
      } else if (deleteSection === "bans") {
        path = `/admin/bans/${deleteTargetId}`;
        body = { revoked_reason: "manual cleanup" };
      } else if (deleteSection === "api_tokens") {
        path = `/admin/api-tokens/${deleteTargetId}`;
        body = { revoked_reason: "manual cleanup" };
      } else if (deleteSection === "users") {
        path = `/admin/users/${deleteTargetId}`;
      }

      if (!path) {
        setDeleteBusy(false);
        return;
      }

      const result = await adminRequest<CreateUpdateResponse<unknown>>({
        token,
        path,
        method,
        body,
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok) {
        const failure = describeRequestError(result, "Delete operation failed.");
        const title = failure.isRateLimited
          ? "Rate limited"
          : failure.isLockoutGuard
            ? "Lockout protection"
            : "Delete failed";
        toastError(title, failure.message);
        return;
      }

      toastSuccess("Delete completed", deleteLabel);

      if (deleteSection === "domains") await loadDomains();
      if (deleteSection === "aliases") await loadAliases();
      if (deleteSection === "handles") await loadHandles();
      if (deleteSection === "bans") await loadBans();
      if (deleteSection === "api_tokens") await loadApiTokens();
      if (deleteSection === "users") await loadUsers();

      resetDeleteState();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function onUpdateMyPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = requireSessionToken();
    if (!token) return;

    if (!currentPassword) {
      toastError("Validation", "Current password is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toastError("Validation", "New password must have at least 6 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      toastError("Validation", "New password must be different from current password.");
      return;
    }

    setPasswordBusy(true);

    try {
      const result = await adminRequest<{
        ok?: boolean;
        updated?: boolean;
        reauth_required?: boolean;
        sessions_revoked?: number;
        error?: string;
      }>({
        token,
        path: "/admin/users/me/password",
        method: "PATCH",
        body: {
          current_password: currentPassword,
          new_password: newPassword,
        },
      });

      if (isUnauthorized(result)) {
        handleUnauthorized();
        return;
      }

      if (!result.ok || result.data?.ok !== true || result.data.updated !== true) {
        const failure = describeRequestError(result, "Could not update password.");
        toastError(failure.isRateLimited ? "Rate limited" : "Password change failed", failure.message);
        return;
      }

      const revokeCount = typeof result.data.sessions_revoked === "number" ? result.data.sessions_revoked : 0;
      toastSuccess("Password updated", `Sessions revoked: ${revokeCount}`);
      setCurrentPassword("");
      setNewPassword("");

      if (result.data.reauth_required) {
        forceLogout("Password updated. Please login again.", "success");
        setAuthDialogOpen(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      toastError("Network error", message);
    } finally {
      setPasswordBusy(false);
    }
  }

  const authedEmail = me?.email ?? session?.email ?? "admin";

  return (
    <>
      <div className="flex items-center gap-2">
        {!isAuthed ? (
          <Dialog
            open={authDialogOpen}
            onOpenChange={(nextOpen) => {
              setAuthDialogOpen(nextOpen);
              if (!nextOpen) {
                setAuthFeedback(null);
                setPassword("");
              }
            }}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAuthDialogOpen(true)}
              className="group h-8 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
              aria-label="Open admin authentication"
              title="Admin"
            >
              <Shield className={`h-4 w-4 ${clickableIconClass}`} />
              Admin
            </Button>

            <DialogContent className="max-w-[22rem] border-white/10 bg-zinc-950/95 p-0">
              <div className="space-y-4 px-6 pt-6">
                <DialogHeader>
                  <DialogTitle>Admin Authentication</DialogTitle>
                  <DialogDescription>
                    Login with your admin email and password.
                  </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={onLoginSubmit}>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-auth-email" className="text-xs text-zinc-300">
                      Email
                    </Label>
                    <Input
                      id="admin-auth-email"
                      type="email"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="admin@example.com"
                      value={email}
                      pattern={EMAIL_PATTERN}
                      onChange={(event) => setEmail(normalizeEmailInput(event.target.value))}
                      className="border-white/10 bg-black/40 text-zinc-100 placeholder:text-zinc-500"
                      disabled={loginBusy}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="admin-auth-password" className="text-xs text-zinc-300">
                      Password
                    </Label>
                    <Input
                      id="admin-auth-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="border-white/10 bg-black/40 text-zinc-100 placeholder:text-zinc-500"
                      disabled={loginBusy}
                      required
                    />
                  </div>

                  {authFeedback ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>Authentication failed</AlertTitle>
                      <AlertDescription>{authFeedback}</AlertDescription>
                    </Alert>
                  ) : null}

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20"
                      disabled={loginBusy}
                    >
                      {loginBusy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Authenticate
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </div>

              <div className="px-6 pb-6 pt-3 text-[11px] text-zinc-500">
                Session check via <code className="text-zinc-300">GET /admin/me</code> happens only after explicit login or if a stored admin session already exists.
              </div>
            </DialogContent>
          </Dialog>
        ) : null}

        {isAuthed ? (
          <DropdownMenu open={manageMenuOpen} onOpenChange={setManageMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="group h-8 border-white/10 bg-white/5 px-2.5 text-zinc-200 hover:bg-white/10"
                aria-label="Open manage menu"
                title="Manage"
              >
                <span>Manage</span>
                <ChevronRight
                  className={`h-4 w-4 text-zinc-300 transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] ${manageMenuOpen ? "rotate-90" : "rotate-0"} ${clickableIconClass}`}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 border-white/10 bg-black/80 p-1 text-zinc-100 backdrop-blur-xl"
            >
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("domains");
                }}
              >
                <Globe2 className="h-4 w-4 text-zinc-300" />
                Domains
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("aliases");
                }}
              >
                <Mail className="h-4 w-4 text-zinc-300" />
                Aliases
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("handles");
                }}
              >
                <AtSign className="h-4 w-4 text-zinc-300" />
                Handles
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("bans");
                }}
              >
                <Ban className="h-4 w-4 text-zinc-300" />
                Bans
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("api_tokens");
                }}
              >
                <KeyRound className="h-4 w-4 text-zinc-300" />
                API Tokens
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("users");
                }}
              >
                <Users className="h-4 w-4 text-zinc-300" />
                Admin Users
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  openSection("my_password");
                }}
              >
                <LockKeyhole className="h-4 w-4 text-zinc-300" />
                My Password
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-white/10" />

              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-white/10 focus:text-zinc-100"
                onSelect={(event) => {
                  event.preventDefault();
                  void onRefreshSession();
                }}
              >
                <RefreshCw className={`h-4 w-4 text-zinc-300 ${meBusy ? "animate-spin" : ""}`} />
                Refresh Session
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-md focus:bg-rose-500/15 focus:text-rose-100"
                onSelect={(event) => {
                  event.preventDefault();
                  forceLogout("Logged out.", "success");
                }}
              >
                <LogOut className="h-4 w-4 text-rose-300" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <Dialog
        open={adminDialogOpen}
        onOpenChange={(nextOpen) => {
          setAdminDialogOpen(nextOpen);
        }}
      >
        <DialogContent className="max-h-[90vh] w-[min(96vw,1120px)] max-w-[1120px] overflow-y-auto border-white/10 bg-zinc-950/95 p-0">
          <div className="space-y-4 p-6">
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                <UserCog className="h-4 w-4 text-zinc-200" />
                Admin Control Center
              </DialogTitle>
              <DialogDescription>
                Manage protected resources with authenticated admin routes.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-black/35 px-3 py-2 text-xs text-zinc-300">
              <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                {meBusy ? "Checking" : "Authenticated"}
              </Badge>
              <span className="font-medium text-zinc-200">{authedEmail}</span>
              <span className="text-zinc-500">Expires: {safeDateLabel(session?.expiresAt)}</span>
            </div>

            <Tabs
              value={activeSection}
              onValueChange={(value) => setActiveSection(value as AdminSection)}
              className="space-y-4"
            >
              <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-lg bg-black/35 p-1 sm:grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="domains" className="px-2 py-2 text-xs">Domains</TabsTrigger>
                <TabsTrigger value="aliases" className="px-2 py-2 text-xs">Aliases</TabsTrigger>
                <TabsTrigger value="handles" className="px-2 py-2 text-xs">Handles</TabsTrigger>
                <TabsTrigger value="bans" className="px-2 py-2 text-xs">Bans</TabsTrigger>
                <TabsTrigger value="api_tokens" className="px-2 py-2 text-xs">API Tokens</TabsTrigger>
                <TabsTrigger value="users" className="px-2 py-2 text-xs">Admin Users</TabsTrigger>
                <TabsTrigger value="my_password" className="px-2 py-2 text-xs">My Password</TabsTrigger>
              </TabsList>

              <TabsContent value="domains" className="space-y-3">
                <SectionContainer
                  title="Domains"
                  description="Read/create/update/delete domains. DELETE performs soft delete (active = 0)."
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[160px] space-y-1">
                      <Label className="text-xs text-zinc-400">Active filter</Label>
                      <Select value={domainsActiveFilter} onValueChange={(value) => setDomainsActiveFilter(value as BoolFilter)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="1">Only active</SelectItem>
                          <SelectItem value="0">Only inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => void loadDomains(0)}
                      disabled={domains.loading}
                    >
                      {domains.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => openDomainEditor()}
                    >
                      <Globe2 className="h-4 w-4" />
                      New Domain
                    </Button>
                  </div>

                  {domains.error ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>Domains error</AlertTitle>
                      <AlertDescription>{domains.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="overflow-x-auto rounded-md border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-black/40 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">ID</th>
                          <th className="px-3 py-2 font-medium">Domain</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {domains.items.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-3 text-zinc-500">
                              No domains found.
                            </td>
                          </tr>
                        ) : (
                          domains.items.map((item) => (
                            <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                              <td className="px-3 py-2">{item.id}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.name}</td>
                              <td className="px-3 py-2">
                                <Badge className={isTrueValue(item.active) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}>
                                  {isTrueValue(item.active) ? "active" : "inactive"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                    onClick={() => openDomainEditor(item)}
                                    aria-label={`Edit domain ${item.name}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                                    onClick={() => askDelete("domains", item.id, item.name)}
                                    aria-label={`Delete domain ${item.name}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <PaginationActions
                    state={domains as ListState<unknown>}
                    busy={domains.loading}
                    onPrevious={() => void loadDomains(Math.max(0, domains.offset - domains.limit))}
                    onNext={() => void loadDomains(domains.offset + domains.limit)}
                  />
                </SectionContainer>
              </TabsContent>

              <TabsContent value="aliases" className="space-y-3">
                <SectionContainer
                  title="Aliases"
                  description="Read/create/update/delete aliases with address and destination."
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[200px] space-y-1">
                      <Label className="text-xs text-zinc-400">Search by address</Label>
                      <Input
                        value={aliasesSearch}
                        onChange={(event) => {
                          setAliasesSearch(event.target.value);
                          scheduleDebouncedSearch(aliasesSearchDebounceRef, runAliasesSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushAliasesSearch)}
                        placeholder="john@example.com"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[220px] space-y-1">
                      <Label className="text-xs text-zinc-400">Search by destination</Label>
                      <Input
                        value={aliasesGotoSearch}
                        onChange={(event) => {
                          setAliasesGotoSearch(event.target.value);
                          scheduleDebouncedSearch(aliasesSearchDebounceRef, runAliasesSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushAliasesSearch)}
                        placeholder="destination@pm.me"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[160px] space-y-1">
                      <Label className="text-xs text-zinc-400">Active filter</Label>
                      <Select value={aliasesActiveFilter} onValueChange={(value) => setAliasesActiveFilter(value as BoolFilter)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="1">Only active</SelectItem>
                          <SelectItem value="0">Only inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={flushAliasesSearch}
                      disabled={aliases.loading}
                    >
                      {aliases.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => openAliasEditor()}
                    >
                      <Mail className="h-4 w-4" />
                      New Alias
                    </Button>
                  </div>

                  {aliases.error ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>Aliases error</AlertTitle>
                      <AlertDescription>{aliases.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="overflow-x-auto rounded-md border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-black/40 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">ID</th>
                          <th className="px-3 py-2 font-medium">Address</th>
                          <th className="px-3 py-2 font-medium">Goto</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Modified</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aliases.items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-3 py-3 text-zinc-500">
                              No aliases found.
                            </td>
                          </tr>
                        ) : (
                          aliases.items.map((item) => (
                            <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                              <td className="px-3 py-2">{item.id}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.address}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.goto}</td>
                              <td className="px-3 py-2">
                                <Badge className={isTrueValue(item.active) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}>
                                  {isTrueValue(item.active) ? "active" : "inactive"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">{safeDateLabel(item.modified ?? item.created)}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                    onClick={() => openAliasEditor(item)}
                                    aria-label={`Edit alias ${item.address}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                                    onClick={() => askDelete("aliases", item.id, item.address)}
                                    aria-label={`Delete alias ${item.address}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <PaginationActions
                    state={aliases as ListState<unknown>}
                    busy={aliases.loading}
                    onPrevious={() => void loadAliases(Math.max(0, aliases.offset - aliases.limit))}
                    onNext={() => void loadAliases(aliases.offset + aliases.limit)}
                  />
                </SectionContainer>
              </TabsContent>

              <TabsContent value="handles" className="space-y-3">
                <SectionContainer
                  title="Handles (catch-all)"
                  description="Read/create/update/delete catch-all handles with destination email."
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[170px] space-y-1">
                      <Label className="text-xs text-zinc-400">Search by handle</Label>
                      <Input
                        value={handlesHandleSearch}
                        onChange={(event) => {
                          setHandlesHandleSearch(event.target.value);
                          scheduleDebouncedSearch(handlesSearchDebounceRef, runHandlesSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushHandlesSearch)}
                        placeholder="admin1"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[220px] space-y-1">
                      <Label className="text-xs text-zinc-400">Search by destination</Label>
                      <Input
                        value={handlesAddressSearch}
                        onChange={(event) => {
                          setHandlesAddressSearch(event.target.value);
                          scheduleDebouncedSearch(handlesSearchDebounceRef, runHandlesSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushHandlesSearch)}
                        placeholder="destination@pm.me"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[160px] space-y-1">
                      <Label className="text-xs text-zinc-400">Active filter</Label>
                      <Select value={handlesActiveFilter} onValueChange={(value) => setHandlesActiveFilter(value as BoolFilter)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="1">Only active</SelectItem>
                          <SelectItem value="0">Only inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={flushHandlesSearch}
                      disabled={handles.loading}
                    >
                      {handles.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => openHandleEditor()}
                    >
                      <AtSign className="h-4 w-4" />
                      New Handle
                    </Button>
                  </div>

                  {handles.error ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>Handles error</AlertTitle>
                      <AlertDescription>{handles.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="overflow-x-auto rounded-md border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-black/40 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">ID</th>
                          <th className="px-3 py-2 font-medium">Handle</th>
                          <th className="px-3 py-2 font-medium">Destination</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {handles.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-3 text-zinc-500">
                              No handles found.
                            </td>
                          </tr>
                        ) : (
                          handles.items.map((item) => (
                            <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                              <td className="px-3 py-2">{item.id}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.handle}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.address}</td>
                              <td className="px-3 py-2">
                                <Badge className={isTrueValue(item.active) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}>
                                  {isTrueValue(item.active) ? "active" : "inactive"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                    onClick={() => openHandleEditor(item)}
                                    aria-label={`Edit handle ${item.handle}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                                    onClick={() => askDelete("handles", item.id, item.handle)}
                                    aria-label={`Delete handle ${item.handle}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <PaginationActions
                    state={handles as ListState<unknown>}
                    busy={handles.loading}
                    onPrevious={() => void loadHandles(Math.max(0, handles.offset - handles.limit))}
                    onNext={() => void loadHandles(handles.offset + handles.limit)}
                  />
                </SectionContainer>
              </TabsContent>

              <TabsContent value="bans" className="space-y-3">
                <SectionContainer
                  title="Bans"
                  description="Read/create/update/revoke bans by type and value."
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[170px] space-y-1">
                      <Label className="text-xs text-zinc-400">Ban type</Label>
                      <Select value={bansTypeFilter} onValueChange={(value) => setBansTypeFilter(value as "all" | BanType)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="email">email</SelectItem>
                          <SelectItem value="domain">domain</SelectItem>
                          <SelectItem value="ip">ip</SelectItem>
                          <SelectItem value="name">name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-[190px] space-y-1">
                      <Label className="text-xs text-zinc-400">Ban value</Label>
                      <Input
                        value={bansSearch}
                        onChange={(event) => {
                          setBansSearch(event.target.value);
                          scheduleDebouncedSearch(bansSearchDebounceRef, runBansSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushBansSearch)}
                        placeholder="user@example.com"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[160px] space-y-1">
                      <Label className="text-xs text-zinc-400">Active filter</Label>
                      <Select value={bansActiveFilter} onValueChange={(value) => setBansActiveFilter(value as BoolFilter)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="1">Only active</SelectItem>
                          <SelectItem value="0">Only inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={flushBansSearch}
                      disabled={bans.loading}
                    >
                      {bans.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => openBanEditor()}
                    >
                      <Ban className="h-4 w-4" />
                      New Ban
                    </Button>
                  </div>

                  {bans.error ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>Bans error</AlertTitle>
                      <AlertDescription>{bans.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="overflow-x-auto rounded-md border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-black/40 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">ID</th>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Value</th>
                          <th className="px-3 py-2 font-medium">Reason</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Expires</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bans.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-3 py-3 text-zinc-500">
                              No bans found.
                            </td>
                          </tr>
                        ) : (
                          bans.items.map((item) => (
                            <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                              <td className="px-3 py-2">{item.id}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.ban_type}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.ban_value}</td>
                              <td className="px-3 py-2">{item.reason || "-"}</td>
                              <td className="px-3 py-2">
                                <Badge className={isTrueValue(item.active) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}>
                                  {isTrueValue(item.active) ? "active" : "inactive"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">{safeDateLabel(item.expires_at)}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                    onClick={() => openBanEditor(item)}
                                    aria-label={`Edit ban ${item.ban_value}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                                    onClick={() => askDelete("bans", item.id, `${item.ban_type}:${item.ban_value}`)}
                                    aria-label={`Revoke ban ${item.ban_value}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <PaginationActions
                    state={bans as ListState<unknown>}
                    busy={bans.loading}
                    onPrevious={() => void loadBans(Math.max(0, bans.offset - bans.limit))}
                    onNext={() => void loadBans(bans.offset + bans.limit)}
                  />
                </SectionContainer>
              </TabsContent>

              <TabsContent value="api_tokens" className="space-y-3">
                <SectionContainer
                  title="API Tokens"
                  description="Read/create/update/revoke API tokens."
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[210px] space-y-1">
                      <Label className="text-xs text-zinc-400">Owner email</Label>
                      <Input
                        value={tokenOwnerFilter}
                        onChange={(event) => {
                          setTokenOwnerFilter(normalizeEmailInput(event.target.value));
                          scheduleDebouncedSearch(apiTokensSearchDebounceRef, runApiTokensSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushApiTokensSearch)}
                        placeholder="owner@example.com"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[160px] space-y-1">
                      <Label className="text-xs text-zinc-400">Status filter</Label>
                      <Select value={tokenStatusFilter} onValueChange={(value) => setTokenStatusFilter(value as TokenStatusFilter)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">active</SelectItem>
                          <SelectItem value="revoked">revoked</SelectItem>
                          <SelectItem value="expired">expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={flushApiTokensSearch}
                      disabled={apiTokens.loading}
                    >
                      {apiTokens.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => openTokenEditor()}
                    >
                      <KeyRound className="h-4 w-4" />
                      New Token
                    </Button>
                  </div>

                  {createdTokenPlaintext ? (
                    <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <AlertTitle>Token created (showing once)</AlertTitle>
                      <AlertDescription>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <code className="max-w-full overflow-x-auto rounded-md border border-white/10 bg-black/35 px-2 py-1 text-[11px] text-zinc-100">
                            {createdTokenPlaintext}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                            onClick={() =>
                              void copyWithFeedback(
                                "admin-api-created-token",
                                createdTokenPlaintext,
                                "Admin API token copied."
                              )
                            }
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedId === "admin-api-created-token" ? "Copied" : "Copy"}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {apiTokens.error ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>API tokens error</AlertTitle>
                      <AlertDescription>{apiTokens.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="overflow-x-auto rounded-md border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-black/40 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">ID</th>
                          <th className="px-3 py-2 font-medium">Owner</th>
                          <th className="px-3 py-2 font-medium">Status</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Expires</th>
                          <th className="px-3 py-2 font-medium">Last Used</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiTokens.items.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-3 py-3 text-zinc-500">
                              No api tokens found.
                            </td>
                          </tr>
                        ) : (
                          apiTokens.items.map((item) => (
                            <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                              <td className="px-3 py-2">{item.id}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.owner_email}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{item.status || "-"}</td>
                              <td className="px-3 py-2">
                                <Badge className={isTrueValue(item.active) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}>
                                  {isTrueValue(item.active) ? "active" : "inactive"}
                                </Badge>
                              </td>
                              <td className="px-3 py-2">{safeDateLabel(item.expires_at)}</td>
                              <td className="px-3 py-2">{safeDateLabel(item.last_used_at)}</td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                    onClick={() => openTokenEditor(item)}
                                    aria-label={`Edit api token ${item.id}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="h-7 w-7 border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                                    onClick={() => askDelete("api_tokens", item.id, `${item.owner_email} #${item.id}`)}
                                    aria-label={`Revoke api token ${item.id}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <PaginationActions
                    state={apiTokens as ListState<unknown>}
                    busy={apiTokens.loading}
                    onPrevious={() => void loadApiTokens(Math.max(0, apiTokens.offset - apiTokens.limit))}
                    onNext={() => void loadApiTokens(apiTokens.offset + apiTokens.limit)}
                  />
                </SectionContainer>
              </TabsContent>

              <TabsContent value="users" className="space-y-3">
                <SectionContainer
                  title="Admin Users"
                  description="Read/create/update/delete admin users."
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="w-[210px] space-y-1">
                      <Label className="text-xs text-zinc-400">Search by email</Label>
                      <Input
                        value={usersSearch}
                        onChange={(event) => {
                          setUsersSearch(event.target.value);
                          scheduleDebouncedSearch(usersSearchDebounceRef, runUsersSearch);
                        }}
                        onKeyDown={(event) => triggerSearchOnEnter(event, flushUsersSearch)}
                        placeholder="admin@example.com"
                        className="h-8 border-white/10 bg-black/30 text-zinc-100"
                      />
                    </div>

                    <div className="w-[160px] space-y-1">
                      <Label className="text-xs text-zinc-400">Active filter</Label>
                      <Select value={usersActiveFilter} onValueChange={(value) => setUsersActiveFilter(value as BoolFilter)}>
                        <SelectTrigger className="w-full border-white/10 bg-black/30 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="1">Only active</SelectItem>
                          <SelectItem value="0">Only inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={flushUsersSearch}
                      disabled={users.loading}
                    >
                      {users.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      onClick={() => openUserEditor()}
                    >
                      <Users className="h-4 w-4" />
                      New Admin User
                    </Button>
                  </div>

                  {users.error ? (
                    <Alert className="border-rose-500/30 bg-rose-500/10 text-rose-100">
                      <AlertTriangle className="h-4 w-4 text-rose-300" />
                      <AlertTitle>Admin users error</AlertTitle>
                      <AlertDescription>{users.error}</AlertDescription>
                    </Alert>
                  ) : null}

                  {isKnownSingleActiveAdmin ? (
                    <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                      <ShieldCheck className="h-4 w-4 text-amber-300" />
                      <AlertTitle>Lockout protection enabled</AlertTitle>
                      <AlertDescription>
                        Only one active admin is available. Deactivate/remove actions for this admin are blocked.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="overflow-x-auto rounded-md border border-white/10">
                    <table className="min-w-full text-left text-xs">
                      <thead className="bg-black/40 text-zinc-400">
                        <tr>
                          <th className="px-3 py-2 font-medium">ID</th>
                          <th className="px-3 py-2 font-medium">Email</th>
                          <th className="px-3 py-2 font-medium">Active</th>
                          <th className="px-3 py-2 font-medium">Last login</th>
                          <th className="px-3 py-2 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-3 py-3 text-zinc-500">
                              No admin users found.
                            </td>
                          </tr>
                        ) : (
                          users.items.map((item) => {
                            const deleteBlockedByLockout = isSoleActiveAdminById(item.id);

                            return (
                              <tr key={item.id} className="border-t border-white/10 text-zinc-200">
                                <td className="px-3 py-2">{item.id}</td>
                                <td className="px-3 py-2 font-mono text-[11px]">{item.email}</td>
                                <td className="px-3 py-2">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge className={isTrueValue(item.is_active) ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300"}>
                                      {isTrueValue(item.is_active) ? "active" : "inactive"}
                                    </Badge>
                                    {deleteBlockedByLockout ? (
                                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200">
                                        lockout-guard
                                      </Badge>
                                    ) : null}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{safeDateLabel(item.last_login_at)}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-7 w-7 border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                                      onClick={() => openUserEditor(item)}
                                      aria-label={`Edit admin user ${item.email}`}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className="h-7 w-7 border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-45"
                                      onClick={() => askDelete("users", item.id, item.email)}
                                      aria-label={`Deactivate admin user ${item.email}`}
                                      disabled={deleteBlockedByLockout}
                                      title={deleteBlockedByLockout ? "Lockout protection enabled for last active admin." : undefined}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <PaginationActions
                    state={users as ListState<unknown>}
                    busy={users.loading}
                    onPrevious={() => void loadUsers(Math.max(0, users.offset - users.limit))}
                    onNext={() => void loadUsers(users.offset + users.limit)}
                  />
                </SectionContainer>
              </TabsContent>

              <TabsContent value="my_password" className="space-y-3">
                <SectionContainer
                  title="My Password"
                  description="PATCH /admin/users/me/password. Success forces re-login."
                >
                  <form className="grid gap-3 sm:max-w-md" onSubmit={onUpdateMyPassword}>
                    <div className="space-y-1">
                      <Label htmlFor="admin-current-password" className="text-xs text-zinc-400">
                        Current password
                      </Label>
                      <Input
                        id="admin-current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        className="border-white/10 bg-black/30 text-zinc-100"
                        disabled={passwordBusy}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="admin-new-password" className="text-xs text-zinc-400">
                        New password
                      </Label>
                      <Input
                        id="admin-new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="border-white/10 bg-black/30 text-zinc-100"
                        disabled={passwordBusy}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="h-8 w-fit border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
                      disabled={passwordBusy}
                    >
                      {passwordBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                      Update Password
                    </Button>
                  </form>
                </SectionContainer>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={domainEditorOpen} onOpenChange={setDomainEditorOpen}>
        <DialogContent className="max-w-[25rem] border-white/10 bg-zinc-950/95">
          <DialogHeader>
            <DialogTitle>{domainFormId === null ? "Create domain" : `Edit domain #${domainFormId}`}</DialogTitle>
            <DialogDescription>POST/PATCH /admin/domains</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitDomainEditor}>
            <div className="space-y-1">
              <Label htmlFor="domain-name">Domain</Label>
              <Input
                id="domain-name"
                value={domainFormName}
                onChange={(event) => setDomainFormName(event.target.value.toLowerCase())}
                placeholder="example.com"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={domainEditorBusy}
                required
              />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
              <Switch checked={domainFormActive} onCheckedChange={setDomainFormActive} disabled={domainEditorBusy} />
              <span className="text-sm text-zinc-200">Active</span>
            </div>

            <DialogFooter>
              <Button type="submit" className="border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20" disabled={domainEditorBusy}>
                {domainEditorBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {domainFormId === null ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={aliasEditorOpen} onOpenChange={setAliasEditorOpen}>
        <DialogContent className="max-w-[28rem] border-white/10 bg-zinc-950/95">
          <DialogHeader>
            <DialogTitle>{aliasFormId === null ? "Create alias" : `Edit alias #${aliasFormId}`}</DialogTitle>
            <DialogDescription>POST/PATCH /admin/aliases</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitAliasEditor}>
            <div className="space-y-1">
              <Label htmlFor="alias-handle">Handle</Label>
              <Input
                id="alias-handle"
                type="text"
                value={aliasFormHandle}
                onChange={(event) => setAliasFormHandle(event.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="admin1"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={aliasEditorBusy}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Domain</Label>
              <Popover
                open={aliasDomainComboboxOpen}
                onOpenChange={(nextOpen) => {
                  setAliasDomainComboboxOpen(nextOpen);
                  if (nextOpen) {
                    void ensureAliasDomainsLoaded();
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={aliasDomainComboboxOpen}
                    className="h-9 w-full justify-between border-white/10 bg-black/35 text-zinc-100 hover:bg-black/45"
                    disabled={aliasEditorBusy}
                  >
                    <span className="truncate font-mono text-[11px]">
                      {aliasFormDomain || (aliasDomainsLoading ? "Loading domains..." : "Select domain")}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] border-white/10 bg-black/90 p-0 text-zinc-100">
                  <Command className="bg-transparent">
                    <CommandInput placeholder="Search domain..." />
                    <CommandList>
                      <CommandEmpty>No domains found.</CommandEmpty>
                      <CommandGroup>
                        {aliasDomains.length ? (
                          aliasDomains.map((domain) => (
                            <CommandItem
                              key={domain}
                              value={domain}
                              className="cursor-pointer text-zinc-100"
                              onSelect={() => {
                                setAliasFormDomain(domain);
                                setAliasDomainComboboxOpen(false);
                              }}
                            >
                              <Check className={`mr-2 h-4 w-4 ${aliasFormDomain === domain ? "opacity-100" : "opacity-0"}`} />
                              <span className="truncate font-mono text-[11px]">{domain}</span>
                            </CommandItem>
                          ))
                        ) : (
                          <CommandItem value="no-domains" disabled>
                            {aliasDomainsLoading ? "Loading domains..." : "No domains available"}
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label htmlFor="alias-destination">Destination</Label>
              <Input
                id="alias-destination"
                type="email"
                inputMode="email"
                value={aliasFormDestination}
                pattern={EMAIL_PATTERN}
                onChange={(event) => setAliasFormDestination(normalizeEmailInput(event.target.value))}
                placeholder="destination@pm.me"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={aliasEditorBusy}
                required
              />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
              <Switch checked={aliasFormActive} onCheckedChange={setAliasFormActive} disabled={aliasEditorBusy} />
              <span className="text-sm text-zinc-200">Active</span>
            </div>

            <DialogFooter>
              <Button type="submit" className="border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20" disabled={aliasEditorBusy}>
                {aliasEditorBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {aliasFormId === null ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={handleEditorOpen} onOpenChange={setHandleEditorOpen}>
        <DialogContent className="max-w-[28rem] border-white/10 bg-zinc-950/95">
          <DialogHeader>
            <DialogTitle>{handleFormId === null ? "Create handle" : `Edit handle #${handleFormId}`}</DialogTitle>
            <DialogDescription>POST/PATCH /admin/handles</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitHandleEditor}>
            <div className="space-y-1">
              <Label htmlFor="handle-local-part">Handle</Label>
              <Input
                id="handle-local-part"
                value={handleFormHandle}
                onChange={(event) => setHandleFormHandle(event.target.value.toLowerCase())}
                placeholder="admin1"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={handleEditorBusy}
                required
              />
              <p className="text-[11px] text-zinc-500">Catch-all local part. Ex: admin1 =&gt; admin1@*</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="handle-destination-address">Destination</Label>
              <Input
                id="handle-destination-address"
                type="email"
                inputMode="email"
                value={handleFormAddress}
                onChange={(event) => setHandleFormAddress(normalizeEmailInput(event.target.value))}
                placeholder="destination@pm.me"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={handleEditorBusy}
                required
              />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
              <Switch checked={handleFormActive} onCheckedChange={setHandleFormActive} disabled={handleEditorBusy} />
              <span className="text-sm text-zinc-200">Active</span>
            </div>

            <DialogFooter>
              <Button type="submit" className="border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20" disabled={handleEditorBusy}>
                {handleEditorBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {handleFormId === null ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={banEditorOpen} onOpenChange={setBanEditorOpen}>
        <DialogContent className="max-w-[30rem] border-white/10 bg-zinc-950/95">
          <DialogHeader>
            <DialogTitle>{banFormId === null ? "Create ban" : `Edit ban #${banFormId}`}</DialogTitle>
            <DialogDescription>POST/PATCH /admin/bans</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitBanEditor}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={banFormType} onValueChange={(value) => setBanFormType(value as BanType)}>
                  <SelectTrigger className="w-full border-white/10 bg-black/35 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-black/90 text-zinc-100">
                    <SelectItem value="email">email</SelectItem>
                    <SelectItem value="domain">domain</SelectItem>
                    <SelectItem value="ip">ip</SelectItem>
                    <SelectItem value="name">name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ban-value">Value</Label>
                <Input
                  id="ban-value"
                  value={banFormValue}
                  onChange={(event) => setBanFormValue(event.target.value)}
                  placeholder="user@example.com"
                  className="border-white/10 bg-black/35 text-zinc-100"
                  disabled={banEditorBusy}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="ban-reason">Reason</Label>
              <Input
                id="ban-reason"
                value={banFormReason}
                onChange={(event) => setBanFormReason(event.target.value)}
                placeholder="abuse"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={banEditorBusy}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ban-expires-at">Expires at</Label>
              <Input
                id="ban-expires-at"
                type="datetime-local"
                value={banFormExpiresAt}
                onChange={(event) => setBanFormExpiresAt(event.target.value)}
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={banEditorBusy}
              />
            </div>

            {banFormId !== null ? (
              <>
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <Switch checked={banFormRevoked} onCheckedChange={setBanFormRevoked} disabled={banEditorBusy} />
                  <span className="text-sm text-zinc-200">Revoked</span>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="ban-revoked-reason">Revoked reason</Label>
                  <Input
                    id="ban-revoked-reason"
                    value={banFormRevokedReason}
                    onChange={(event) => setBanFormRevokedReason(event.target.value)}
                    placeholder="manual cleanup"
                    className="border-white/10 bg-black/35 text-zinc-100"
                    disabled={banEditorBusy}
                  />
                </div>
              </>
            ) : null}

            <DialogFooter>
              <Button type="submit" className="border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20" disabled={banEditorBusy}>
                {banEditorBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {banFormId === null ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={tokenEditorOpen} onOpenChange={setTokenEditorOpen}>
        <DialogContent className="max-w-[30rem] border-white/10 bg-zinc-950/95">
          <DialogHeader>
            <DialogTitle>{tokenFormId === null ? "Create API token" : `Edit API token #${tokenFormId}`}</DialogTitle>
            <DialogDescription>POST/PATCH /admin/api-tokens</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitTokenEditor}>
            <div className="space-y-1">
              <Label htmlFor="api-token-owner-email">Owner email</Label>
              <Input
                id="api-token-owner-email"
                type="email"
                inputMode="email"
                value={tokenFormOwnerEmail}
                onChange={(event) => setTokenFormOwnerEmail(normalizeEmailInput(event.target.value))}
                placeholder="owner@example.com"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={tokenEditorBusy}
                required
              />
            </div>

            {tokenFormId === null ? (
              <div className="space-y-1">
                <Label htmlFor="api-token-days">Days</Label>
                <Input
                  id="api-token-days"
                  value={tokenFormDays}
                  onChange={(event) => setTokenFormDays(event.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="30"
                  className="border-white/10 bg-black/35 text-zinc-100"
                  disabled={tokenEditorBusy}
                />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <Label htmlFor="api-token-status">Status</Label>
                  <Input
                    id="api-token-status"
                    value={tokenFormStatus}
                    onChange={(event) => setTokenFormStatus(event.target.value)}
                    placeholder="active"
                    className="border-white/10 bg-black/35 text-zinc-100"
                    disabled={tokenEditorBusy}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="api-token-expires-at">Expires at</Label>
                  <Input
                    id="api-token-expires-at"
                    type="datetime-local"
                    value={tokenFormExpiresAt}
                    onChange={(event) => setTokenFormExpiresAt(event.target.value)}
                    className="border-white/10 bg-black/35 text-zinc-100"
                    disabled={tokenEditorBusy}
                  />
                </div>

                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
                  <Switch checked={tokenFormRevoked} onCheckedChange={setTokenFormRevoked} disabled={tokenEditorBusy} />
                  <span className="text-sm text-zinc-200">Revoked</span>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="api-token-revoked-reason">Revoked reason</Label>
                  <Input
                    id="api-token-revoked-reason"
                    value={tokenFormRevokedReason}
                    onChange={(event) => setTokenFormRevokedReason(event.target.value)}
                    placeholder="security incident"
                    className="border-white/10 bg-black/35 text-zinc-100"
                    disabled={tokenEditorBusy}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="submit" className="border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20" disabled={tokenEditorBusy}>
                {tokenEditorBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {tokenFormId === null ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={userEditorOpen} onOpenChange={setUserEditorOpen}>
        <DialogContent className="max-w-[30rem] border-white/10 bg-zinc-950/95">
          <DialogHeader>
            <DialogTitle>{userFormId === null ? "Create admin user" : `Edit admin user #${userFormId}`}</DialogTitle>
            <DialogDescription>POST/PATCH /admin/users</DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={submitUserEditor}>
            <div className="space-y-1">
              <Label htmlFor="admin-user-email">Email</Label>
              <Input
                id="admin-user-email"
                type="email"
                inputMode="email"
                value={userFormEmail}
                onChange={(event) => setUserFormEmail(normalizeEmailInput(event.target.value))}
                placeholder="admin2@example.com"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={userEditorBusy}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="admin-user-password">
                Password {userFormId === null ? "(required)" : "(optional)"}
              </Label>
              <Input
                id="admin-user-password"
                type="password"
                autoComplete="new-password"
                value={userFormPassword}
                onChange={(event) => setUserFormPassword(event.target.value)}
                placeholder="StrongPassword"
                className="border-white/10 bg-black/35 text-zinc-100"
                disabled={userEditorBusy}
                required={userFormId === null}
              />
            </div>

            {editingTargetIsSoleActiveAdmin ? (
              <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-100">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <AlertTitle>Lockout protection enabled</AlertTitle>
                <AlertDescription>
                  This admin is currently the last active one. Deactivation is blocked.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3 py-2">
              <Switch
                checked={userFormActive}
                onCheckedChange={setUserFormActive}
                disabled={userEditorBusy || editingTargetIsSoleActiveAdmin}
              />
              <span className="text-sm text-zinc-200">Active</span>
            </div>

            <DialogFooter>
              <Button type="submit" className="border-white/10 bg-white/10 text-zinc-100 hover:bg-white/20" disabled={userEditorBusy}>
                {userEditorBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {userFormId === null ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(nextOpen) => {
          setDeleteDialogOpen(nextOpen);
          if (!nextOpen && !deleteBusy) {
            resetDeleteState();
          }
        }}
      >
        <AlertDialogContent className="border-white/10 bg-zinc-950/95 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm action</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will apply the delete/revoke operation for <span className="font-mono text-zinc-200">{deleteLabel}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
              disabled={deleteBusy}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="border border-rose-500/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              disabled={deleteBusy}
            >
              {deleteBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
