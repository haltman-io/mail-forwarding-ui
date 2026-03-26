import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminDnsRequest,
  CreateUpdateResponse,
  ListResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchDnsRequests(
  params: { limit: number; offset: number; type?: string; status?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.type && params.type !== "all") qs.set("type", params.type);
  if (params.status && params.status !== "all") qs.set("status", params.status);
  return adminRequest<ListResponse<AdminDnsRequest>>({ path: `/api/admin/dns-requests?${qs.toString()}` });
}

export async function createDnsRequest(body: Record<string, unknown>) {
  return adminRequest<CreateUpdateResponse<AdminDnsRequest>>({ path: "/api/admin/dns-requests", method: "POST", body });
}

export async function updateDnsRequest(id: number, body: Record<string, unknown>) {
  return adminRequest<CreateUpdateResponse<AdminDnsRequest>>({ path: `/api/admin/dns-requests/${id}`, method: "PATCH", body });
}

export async function deleteDnsRequest(id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({ path: `/api/admin/dns-requests/${id}`, method: "DELETE" });
}
