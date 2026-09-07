import { adminRequest, isUnauthorized, describeError } from "@/features/dashboard/services/domains.service";
import type {
  AdminSmtpCredential,
  CreateUpdateResponse,
  ListResponse,
  SmtpCreateCredentialResponse,
  SmtpInviteResponse,
  SmtpSetupClaimResponse,
  SmtpSetupInfoResponse,
} from "@/features/dashboard/types/admin.types";

export { isUnauthorized, describeError };

export async function fetchSmtpCredentials(params: {
  limit: number;
  offset: number;
  active?: string;
  username?: string;
  sender?: string;
}) {
  const qs = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.active && params.active !== "all") qs.set("active", params.active);
  if (params.username) qs.set("username", params.username);
  if (params.sender) qs.set("sender", params.sender);

  return adminRequest<ListResponse<AdminSmtpCredential>>({
    path: `/api/admin/smtp-credentials?${qs.toString()}`,
  });
}

export async function createSmtpCredential(body: {
  username: string;
  password?: string;
  allowed_senders: string[];
  active?: boolean;
}) {
  return adminRequest<SmtpCreateCredentialResponse>({
    path: "/api/admin/smtp-credentials",
    method: "POST",
    body,
  });
}

export async function updateSmtpCredential(
  username: string,
  body: {
    password?: string;
    allowed_senders?: string[];
    active?: boolean;
  },
) {
  return adminRequest<CreateUpdateResponse<AdminSmtpCredential>>({
    path: `/api/admin/smtp-credentials/${encodeURIComponent(username)}`,
    method: "PATCH",
    body,
  });
}

export async function deleteSmtpCredential(username: string) {
  return adminRequest<CreateUpdateResponse<AdminSmtpCredential>>({
    path: `/api/admin/smtp-credentials/${encodeURIComponent(username)}`,
    method: "DELETE",
  });
}

export async function createSmtpInvite(body: {
  allowed_sender_constraint?: string;
  expires_in_hours?: number;
}) {
  return adminRequest<SmtpInviteResponse>({
    path: "/api/admin/smtp-credentials/invites",
    method: "POST",
    body,
  });
}

/* ── Public Token-Gated Setup endpoints ── */

export async function getSmtpSetupInfo(token: string) {
  return adminRequest<SmtpSetupInfoResponse>({
    path: `/api/smtp-setup/${encodeURIComponent(token)}`,
    method: "GET",
  });
}

export async function claimSmtpSetup(
  token: string,
  body: { alias: string; username: string; password: string },
) {
  return adminRequest<SmtpSetupClaimResponse>({
    path: `/api/smtp-setup/${encodeURIComponent(token)}/claim`,
    method: "POST",
    body,
  });
}
