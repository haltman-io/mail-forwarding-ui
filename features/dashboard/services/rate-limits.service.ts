import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  RateLimitCheckResponse,
  RateLimitResetResponse,
  RateLimitTargetType,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function checkRateLimit(params: {
  target: string;
  type?: RateLimitTargetType;
}) {
  const qs = new URLSearchParams({ target: params.target.trim().toLowerCase() });
  if (params.type && params.type !== "auto") {
    qs.set("type", params.type);
  }
  return adminRequest<RateLimitCheckResponse>({
    path: `/api/admin/rate-limit/check?${qs.toString()}`,
    method: "GET",
  });
}

export async function resetRateLimit(body: {
  target: string;
  type?: RateLimitTargetType;
}) {
  return adminRequest<RateLimitResetResponse>({
    path: "/api/admin/rate-limit/reset",
    method: "POST",
    body: {
      target: body.target.trim().toLowerCase(),
      type: body.type || "auto",
    },
  });
}
