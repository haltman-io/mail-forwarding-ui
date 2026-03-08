export type AdminDomain = {
  id: number;
  name: string;
  active: number | boolean;
};

export type BoolFilter = "all" | "1" | "0";

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
