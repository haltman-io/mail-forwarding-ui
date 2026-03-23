/**
 * Whether the dashboard (auth forms + protected routes) is enabled.
 * Controlled by the NEXT_DASHBOARD_ENABLED env var (default: true).
 * Inlined at build time via next.config.ts `env`.
 */
export const DASHBOARD_ENABLED =
  process.env.NEXT_DASHBOARD_ENABLED !== "false";
