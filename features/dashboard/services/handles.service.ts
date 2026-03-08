import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminHandle,
  CreateUpdateResponse,
  ListResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchHandles(
  token: string,
  params: { limit: number; offset: number; active?: string; handle?: string; address?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.active && params.active !== "all") qs.set("active", params.active);
  if (params.handle) qs.set("handle", params.handle);
  if (params.address) qs.set("address", params.address);
  return adminRequest<ListResponse<AdminHandle>>({ token, path: `/admin/handles?${qs.toString()}` });
}

export async function createHandle(
  token: string,
  body: { handle: string; address: string; active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminHandle>>({ token, path: "/admin/handles", method: "POST", body });
}

export async function updateHandle(
  token: string,
  id: number,
  body: { handle: string; address: string; active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminHandle>>({ token, path: `/admin/handles/${id}`, method: "PATCH", body });
}

export async function deleteHandle(token: string, id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({ token, path: `/admin/handles/${id}`, method: "DELETE" });
}
