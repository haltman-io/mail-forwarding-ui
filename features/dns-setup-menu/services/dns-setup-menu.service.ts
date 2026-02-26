import {
  checkDns,
  requestEmail,
  type CheckDnsResponse,
  type DnsRequestResponse,
} from "@/lib/dns-validation";

export const MIN_POLL_INTERVAL_MS = 10000;
export const FALLBACK_POLL_INTERVAL_MS = 45000;
export const MAX_POLL_INTERVAL_MS = 120000;
export const POLL_ERROR_THRESHOLD = 3;
export const POLL_ERROR_TOAST_COOLDOWN_MS = 60000;

const REQUEST_RETRY_COUNT = 2;
const REQUEST_RETRY_BASE_DELAY_MS = 600;
const REQUEST_RETRY_MAX_DELAY_MS = 4000;

function abortError() {
  const err = new Error("Aborted");
  (err as Error).name = "AbortError";
  return err;
}

export function sleep(ms: number, signal?: AbortSignal) {
  if (!signal) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      reject(abortError());
    };

    signal.addEventListener("abort", onAbort);
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  {
    retries,
    baseDelayMs,
    maxDelayMs,
    signal,
    shouldRetry,
  }: {
    retries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    signal?: AbortSignal;
    shouldRetry?: (error: unknown) => boolean;
  }
): Promise<T> {
  let attempt = 0;
  let delay = baseDelayMs;

  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      if ((err as { name?: string } | null)?.name === "AbortError") throw err;
      if (shouldRetry && !shouldRetry(err)) throw err;
      if (attempt >= retries) throw err;
      attempt += 1;
      await sleep(delay, signal);
      delay = Math.min(maxDelayMs, delay * 2);
    }
  }
}

function shouldRetryRequestError(error: unknown) {
  const status = Number((error as { status?: unknown } | null)?.status);
  if (!status) return true;
  if (status === 429 || status >= 500) return true;
  return false;
}

export async function requestDnsValidation(target: string, signal?: AbortSignal): Promise<DnsRequestResponse> {
  return withRetry(() => requestEmail(target, signal), {
    retries: REQUEST_RETRY_COUNT,
    baseDelayMs: REQUEST_RETRY_BASE_DELAY_MS,
    maxDelayMs: REQUEST_RETRY_MAX_DELAY_MS,
    signal,
    shouldRetry: shouldRetryRequestError,
  });
}

export async function fetchDnsStatus(target: string, token?: string, signal?: AbortSignal): Promise<CheckDnsResponse> {
  return checkDns(target, token, signal);
}
