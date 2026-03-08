import { API_HOST } from "@/lib/api-host";
import { fetchDomains, normalizeDomains } from "@/lib/domains";
import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminAlias,
  CreateUpdateResponse,
  ListResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

let cachedDomains: string[] | null = null;
let domainsPromise: Promise<string[]> | null = null;

export async function getDashboardDomainsCached() {
  if (cachedDomains) return cachedDomains;
  if (domainsPromise) return domainsPromise;

  domainsPromise = (async () => {
    try {
      const list = await fetchDomains(`${API_HOST}/domains`);
      const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
      const fallback = normalizeDomains(fallbackRaw.split(","));
      const finalList = list.length ? list : fallback;
      cachedDomains = finalList;
      return finalList;
    } catch {
      const fallbackRaw = process.env.NEXT_PUBLIC_DOMAINS ?? "";
      const fallback = normalizeDomains(fallbackRaw.split(","));
      cachedDomains = fallback;
      return fallback;
    } finally {
      domainsPromise = null;
    }
  })();

  return domainsPromise;
}

export async function fetchAliases(
  token: string,
  params: { limit: number; offset: number; active?: string; address?: string; goto?: string },
) {
  const qs = new URLSearchParams({ limit: String(params.limit), offset: String(params.offset) });
  if (params.active && params.active !== "all") qs.set("active", params.active);
  if (params.address) qs.set("address", params.address);
  if (params.goto) qs.set("goto", params.goto);
  return adminRequest<ListResponse<AdminAlias>>({ token, path: `/admin/aliases?${qs.toString()}` });
}

export async function createAlias(
  token: string,
  body: { address: string; goto: string; active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminAlias>>({ token, path: "/admin/aliases", method: "POST", body });
}

export async function updateAlias(
  token: string,
  id: number,
  body: { address: string; goto: string; active: number },
) {
  return adminRequest<CreateUpdateResponse<AdminAlias>>({ token, path: `/admin/aliases/${id}`, method: "PATCH", body });
}

export async function deleteAlias(token: string, id: number) {
  return adminRequest<CreateUpdateResponse<unknown>>({ token, path: `/admin/aliases/${id}`, method: "DELETE" });
}
