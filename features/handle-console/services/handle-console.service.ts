import { API_HOST } from "@/lib/api-host";

import type { ApiResponse, HandleIntent } from "@/features/handle-console/types/handle-console.types";

export type HandleRequestResult = {
  response: Response;
  rawText: string;
  data: ApiResponse | null;
};

export function buildSubscribeUrl(handle: string, to: string) {
  const query = new URLSearchParams({ handle, to }).toString();
  return `${API_HOST}/api/handle/subscribe?${query}`;
}

export function buildUnsubscribeUrl(handle: string) {
  return `${API_HOST}/api/handle/unsubscribe?${new URLSearchParams({ handle }).toString()}`;
}

export function buildDomainDisableUrl(handle: string, domain: string) {
  const query = new URLSearchParams({ handle, domain }).toString();
  return `${API_HOST}/api/handle/domain/disable?${query}`;
}

export function buildDomainEnableUrl(handle: string, domain: string) {
  const query = new URLSearchParams({ handle, domain }).toString();
  return `${API_HOST}/api/handle/domain/enable?${query}`;
}

const CONFIRM_ENDPOINTS: Record<HandleIntent, string> = {
  subscribe: "/api/handle/confirm",
  unsubscribe: "/api/handle/unsubscribe/confirm",
  domain_disable: "/api/handle/domain/disable/confirm",
  domain_enable: "/api/handle/domain/enable/confirm",
};

export function buildConfirmUrl(token: string, intent: HandleIntent) {
  const path = CONFIRM_ENDPOINTS[intent];
  return `${API_HOST}${path}?${new URLSearchParams({ token }).toString()}`;
}

export async function requestHandle(url: string): Promise<HandleRequestResult> {
  const response = await fetch(url, { method: "GET" });
  const rawText = await response.text();

  if (!rawText) {
    return { response, rawText, data: null };
  }

  try {
    const data = JSON.parse(rawText) as ApiResponse;
    return { response, rawText, data };
  } catch {
    return { response, rawText, data: null };
  }
}

export async function requestConfirmToken(token: string, intent: HandleIntent) {
  const response = await fetch(buildConfirmUrl(token, intent), { method: "GET" });
  const data = (await response.json()) as ApiResponse;
  return { response, data };
}
