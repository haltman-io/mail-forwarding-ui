export type ApiResponse = Record<string, unknown>;

export type RequestState = "idle" | "loading" | "awaiting_confirmation" | "success" | "error";
export type ApiStatus = "idle" | "connected" | "error";
export type HandleIntent = "subscribe" | "unsubscribe" | "domain_disable" | "domain_enable";
export type HandleConsoleTab = "claim" | "remove" | "domains" | "curl";
export type RequestPreviewState = "empty" | "draft" | "awaiting_confirmation" | "confirmed";
export type PreviewSummaryTone = "default" | "accent" | "danger" | "muted";

export type PreviewSummaryItem = {
  label: string;
  value: string;
  mono?: boolean;
  tone?: PreviewSummaryTone;
};

export type HandleSnapshot = {
  handle: string;
  to: string;
  intent: HandleIntent;
  domain?: string;
};

export type StatusKind = "ok" | "bad" | "idle";

export type ApiErrorInfo = {
  title: string;
  description?: string;
};

export type HandleConsoleCardProps = {
  apiStatus?: ApiStatus;
  onApiStatusChange?: (status: ApiStatus) => void;
};
