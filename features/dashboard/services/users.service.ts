import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminUser,
  CreateUpdateResponse,
  ListResponse,
  PasswordChangeResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchUsers(
  token: string,
  params: { limit: number; offset: number; active?: string; email?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.active && params.active !== "all") qs.set("active", params.active);
  if (params.email) qs.set("email", params.email);
  return adminRequest<ListResponse<AdminUser>>({ token, path: `/admin/users?${qs.toString()}` });
}

export async function createUser(
  token: string,
  body: { email: string; password: string; is_active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminUser>>({ token, path: "/admin/users", method: "POST", body });
}

export async function updateUser(
  token: string,
  id: number,
  body: Record<string, unknown>,
) {
  return adminRequest<CreateUpdateResponse<AdminUser>>({ token, path: `/admin/users/${id}`, method: "PATCH", body });
}

export async function deleteUser(token: string, id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({ token, path: `/admin/users/${id}`, method: "DELETE" });
}

export async function changeMyPassword(
  token: string,
  body: { current_password: string; new_password: string },
) {
  return adminRequest<PasswordChangeResponse>({ token, path: "/admin/users/me/password", method: "PATCH", body });
}
