export type ApiResponse = Record<string, unknown>;

export type RequestState = "idle" | "loading" | "awaiting_confirmation" | "success" | "error";
export type ApiStatus = "idle" | "connected" | "error";
export type Intent = "subscribe" | "unsubscribe";
export type AliasConsoleTab = Intent | "curl";
export type RequestPreviewState = "empty" | "draft" | "awaiting_confirmation" | "confirmed";
export type PreviewSummaryTone = "default" | "accent" | "danger" | "muted";

export type PreviewSummaryItem = {
  label: string;
  value: string;
  mono?: boolean;
  tone?: PreviewSummaryTone;
};

export type MappingSnapshot = {
  alias: string;
  to: string;
  intent: Intent;
};

export type StatusKind = "ok" | "bad" | "idle";

export type ApiErrorInfo = {
  title: string;
  description?: string;
};

export type SubscribeCardProps = {
  apiStatus?: ApiStatus;
  onApiStatusChange?: (status: ApiStatus) => void;
};

export type ParsedCustomAddress = {
  local: string;
  domain: string;
};
