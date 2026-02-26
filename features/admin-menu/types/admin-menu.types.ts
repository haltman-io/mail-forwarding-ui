export type AuthStatus = "checking" | "unauthenticated" | "authenticated";
export type AdminSection = "domains" | "aliases" | "handles" | "bans" | "api_tokens" | "users" | "my_password";
export type BoolFilter = "all" | "1" | "0";
export type BanType = "email" | "domain" | "ip" | "name";
export type TokenStatusFilter = "all" | "active" | "revoked" | "expired";

export type AdminSession = {
  token: string;
  tokenType: string;
  expiresAt: string | null;
  email: string | null;
  savedAt: string;
};

export type AdminMe = {
  id: number;
  email: string;
  is_active: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

export type AdminMeResponse = {
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

export type AdminDomain = {
  id: number;
  name: string;
  active: number | boolean;
};

export type AdminAlias = {
  id: number;
  address: string;
  goto: string;
  active: number | boolean;
  domain_id?: number | null;
  created?: string | null;
  modified?: string | null;
};

export type AdminHandle = {
  id: number;
  handle: string;
  address: string;
  active: number | boolean;
};

export type AdminBan = {
  id: number;
  ban_type: string;
  ban_value: string;
  reason?: string | null;
  expires_at?: string | null;
  revoked_at?: string | null;
  revoked_reason?: string | null;
  active?: boolean | number;
};

export type AdminApiToken = {
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

export type AdminUser = {
  id: number;
  email: string;
  is_active: number | boolean;
  created_at?: string | null;
  updated_at?: string | null;
  last_login_at?: string | null;
};

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
};

export type ListResponse<T> = {
  items?: T[];
  pagination?: Partial<Pagination>;
  error?: string;
};

export type CreateUpdateResponse<T> = {
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

export type RequestResult<T> = {
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

export type ListState<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  loading: boolean;
  loadedAt: number | null;
  error: string | null;
};

export type RequestErrorDescription = {
  isRateLimited: boolean;
  isLockoutGuard: boolean;
  message: string;
};
