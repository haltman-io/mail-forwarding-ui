import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminBan,
  CreateUpdateResponse,
  ListResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchBans(
  params: { limit: number; offset: number; active?: string; ban_type?: string; ban_value?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.active && params.active !== "all") qs.set("active", params.active);
  if (params.ban_type && params.ban_type !== "all") qs.set("ban_type", params.ban_type);
  if (params.ban_value) qs.set("ban_value", params.ban_value);
  return adminRequest<ListResponse<AdminBan>>({ path: `/admin/bans?${qs.toString()}` });
}

export async function createBan(
  body: Record<string, unknown>,
) {
  return adminRequest<CreateUpdateResponse<AdminBan>>({ path: "/admin/bans", method: "POST", body });
}

export async function updateBan(
  id: number,
  body: Record<string, unknown>,
) {
  return adminRequest<CreateUpdateResponse<AdminBan>>({ path: `/admin/bans/${id}`, method: "PATCH", body });
}

export async function deleteBan(id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({
    path: `/admin/bans/${id}`,
    method: "DELETE",
    body: { revoked_reason: "manual cleanup" },
  });
}
