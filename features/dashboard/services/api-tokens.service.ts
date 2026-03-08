import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminApiToken,
  CreateUpdateResponse,
  ListResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchApiTokens(
  token: string,
  params: { limit: number; offset: number; status?: string; owner_email?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.status && params.status !== "all") qs.set("status", params.status);
  if (params.owner_email) qs.set("owner_email", params.owner_email);
  return adminRequest<ListResponse<AdminApiToken>>({ token, path: `/admin/api-tokens?${qs.toString()}` });
}

export async function createApiToken(
  token: string,
  body: { owner_email: string; days: number },
) {
  return adminRequest<CreateUpdateResponse<AdminApiToken>>({ token, path: "/admin/api-tokens", method: "POST", body });
}

export async function updateApiToken(
  token: string,
  id: number,
  body: Record<string, unknown>,
) {
  return adminRequest<CreateUpdateResponse<AdminApiToken>>({ token, path: `/admin/api-tokens/${id}`, method: "PATCH", body });
}

export async function deleteApiToken(token: string, id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({
    token,
    path: `/admin/api-tokens/${id}`,
    method: "DELETE",
    body: { revoked_reason: "manual cleanup" },
  });
}
