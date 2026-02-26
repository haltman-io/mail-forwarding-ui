import { API_HOST } from "@/lib/api-host";
import { fetchDomains, normalizeDomains } from "@/lib/domains";

import type { ApiResponse } from "@/features/alias-console/types/alias-console.types";

export type ForwardingRequestResult = {
  response: Response;
  rawText: string;
  data: ApiResponse | null;
};

export async function loadAvailableDomains(domainsUrl: string, fallbackRaw: string) {
  const list = await fetchDomains(domainsUrl);
  const fallback = normalizeDomains(fallbackRaw.split(","));
  return list.length ? list : fallback;
}

export function buildSubscribeUrl(params: { name: string; domain: string; to: string } | { address: string; to: string }) {
  const query = new URLSearchParams(params).toString();
  return `${API_HOST}/forward/subscribe?${query}`;
}

export function buildUnsubscribeUrl(alias: string) {
  return `${API_HOST}/forward/unsubscribe?${new URLSearchParams({ alias }).toString()}`;
}

export function buildConfirmUrl(token: string) {
  return `${API_HOST}/forward/confirm?${new URLSearchParams({ token }).toString()}`;
}

export async function requestForwarding(url: string): Promise<ForwardingRequestResult> {
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

export async function requestConfirmToken(token: string) {
  const response = await fetch(buildConfirmUrl(token), { method: "GET" });
  const data = (await response.json()) as ApiResponse;
  return { response, data };
}
