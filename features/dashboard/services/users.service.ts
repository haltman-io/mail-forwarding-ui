import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminUser,
  CreateUpdateResponse,
  ListResponse,
  PasswordChangeResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchUsers(
  params: { limit: number; offset: number; active?: string; email?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.active && params.active !== "all") qs.set("active", params.active);
  if (params.email) qs.set("email", params.email);
  return adminRequest<ListResponse<AdminUser>>({ path: `/api/admin/users?${qs.toString()}` });
}

export async function createUser(
  body: { email: string; password: string; is_active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminUser>>({ path: "/api/admin/users", method: "POST", body });
}

export async function updateUser(
  id: number,
  body: Record<string, unknown>,
) {
  return adminRequest<CreateUpdateResponse<AdminUser>>({ path: `/api/admin/users/${id}`, method: "PATCH", body });
}

export async function deleteUser(id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({ path: `/api/admin/users/${id}`, method: "DELETE" });
}

export async function changeMyPassword(
  body: { current_password: string; new_password: string },
) {
  return adminRequest<PasswordChangeResponse>({ path: "/api/admin/users/me/password", method: "PATCH", body });
}
