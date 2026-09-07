"use client";

import * as React from "react";
import {
  checkRateLimit,
  resetRateLimit,
  isUnauthorized,
  describeError,
} from "@/features/dashboard/services/rate-limits.service";
import type {
  RateLimitCheckResponse,
  RateLimitResetResponse,
  RateLimitTargetType,
} from "@/features/dashboard/types/admin.types";
import { toastFail, toastOk } from "@/features/dashboard/lib/admin-utils";
import { useUrlQueryState } from "@/features/dashboard/hooks/use-url-query-state";

const DEFAULT_QUERY = {
  target: "",
  type: "auto",
};

export function useRateLimitsController() {
  const { state, setField, patch, reset } = useUrlQueryState(DEFAULT_QUERY, [
    "target",
    "type",
  ]);

  const target = state.target;
  const type = (
    ["auto", "ip", "email", "handle", "domain"].includes(state.type)
      ? state.type
      : "auto"
  ) as RateLimitTargetType;

  const [checkBusy, setCheckBusy] = React.useState(false);
  const [resetBusy, setResetBusy] = React.useState(false);
  const [lastCheckResult, setLastCheckResult] =
    React.useState<RateLimitCheckResponse | null>(null);
  const [lastResetResult, setLastResetResult] =
    React.useState<RateLimitResetResponse | null>(null);
  const [lastAction, setLastAction] = React.useState<"check" | "reset" | null>(
    null,
  );
  const [confirmResetOpen, setConfirmResetOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const setTarget = React.useCallback(
    (val: string) => {
      setField("target", val);
      setErrorMessage(null);
    },
    [setField],
  );

  const setType = React.useCallback(
    (val: RateLimitTargetType) => {
      setField("type", val);
      setErrorMessage(null);
    },
    [setField],
  );

  const check = React.useCallback(
    async (targetOverride?: string, typeOverride?: RateLimitTargetType) => {
      const activeTarget = (targetOverride ?? target).trim();
      const activeType = typeOverride ?? type;

      if (!activeTarget) {
        setErrorMessage("Please enter a target (IP, email, handle, or domain).");
        toastFail("Validation error", "Target cannot be empty.");
        return;
      }

      setCheckBusy(true);
      setErrorMessage(null);

      try {
        const result = await checkRateLimit({
          target: activeTarget,
          type: activeType,
        });

        if (isUnauthorized(result)) {
          toastFail("Unauthorized", "Your admin session is expired or invalid.");
          return;
        }

        if (!result.ok || !result.data) {
          const err = describeError(result, "Failed to check rate limits.");
          setErrorMessage(err.message);
          toastFail(err.isRateLimited ? "Rate limited" : "Check failed", err.message);
          return;
        }

        const data = result.data;
        setLastCheckResult(data);
        setLastAction("check");

        if (!data.redis_configured) {
          toastFail(
            "Redis not configured",
            "Redis rate limiting is disabled. In-memory fallback is active.",
          );
        } else if (!data.redis_available) {
          toastFail(
            "Redis unavailable",
            "Could not connect to Redis rate limit store.",
          );
        } else if (data.active_keys_count === 0) {
          toastOk(
            "No active limits",
            `No active rate limit keys found for "${data.target}" (${data.resolved_type}).`,
          );
        } else {
          toastOk(
            "Active limits found",
            `Found ${data.active_keys_count} active rate limit key${
              data.active_keys_count === 1 ? "" : "s"
            } for "${data.target}".`,
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Network error";
        setErrorMessage(msg);
        toastFail("Error", msg);
      } finally {
        setCheckBusy(false);
      }
    },
    [target, type],
  );

  const openConfirmReset = React.useCallback(() => {
    const activeTarget = target.trim();
    if (!activeTarget) {
      setErrorMessage("Please enter a target before resetting.");
      toastFail("Validation error", "Target cannot be empty.");
      return;
    }
    setConfirmResetOpen(true);
  }, [target]);

  const confirmReset = React.useCallback(async () => {
    const activeTarget = target.trim();
    if (!activeTarget) return;

    setResetBusy(true);
    setErrorMessage(null);

    try {
      const result = await resetRateLimit({
        target: activeTarget,
        type,
      });

      if (isUnauthorized(result)) {
        toastFail("Unauthorized", "Your admin session is expired or invalid.");
        return;
      }

      if (!result.ok || !result.data) {
        const err = describeError(result, "Failed to reset rate limits.");
        setErrorMessage(err.message);
        toastFail(err.isRateLimited ? "Rate limited" : "Reset failed", err.message);
        return;
      }

      const data = result.data;
      setLastResetResult(data);
      setLastAction("reset");
      setConfirmResetOpen(false);

      // If we had active check items, update them to empty
      if (lastCheckResult) {
        setLastCheckResult({
          ...lastCheckResult,
          active_keys_count: 0,
          items: [],
        });
      }

      if (!data.redis_configured) {
        toastFail(
          "Redis not configured",
          "Redis is not configured. No keys were deleted.",
        );
      } else if (!data.redis_available) {
        toastFail(
          "Redis unavailable",
          "Redis is currently unavailable. No keys were deleted.",
        );
      } else if (data.deleted_keys_count === 0) {
        toastOk(
          "Rate limit reset",
          `No active Redis rate limit keys were found to delete for "${data.target}".`,
        );
      } else {
        const rulesList =
          data.cleared_rules.length > 0
            ? ` (${data.cleared_rules.join(", ")})`
            : "";
        toastOk(
          "Rate limit reset complete",
          `Cleared ${data.deleted_keys_count} Redis key${
            data.deleted_keys_count === 1 ? "" : "s"
          }${rulesList}.`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(msg);
      toastFail("Error", msg);
    } finally {
      setResetBusy(false);
    }
  }, [target, type, lastCheckResult]);

  const quickSetAndCheck = React.useCallback(
    (newTarget: string, newType: RateLimitTargetType = "auto") => {
      patch({ target: newTarget, type: newType });
      void check(newTarget, newType);
    },
    [patch, check],
  );

  const clear = React.useCallback(() => {
    reset();
    setLastCheckResult(null);
    setLastResetResult(null);
    setLastAction(null);
    setErrorMessage(null);
  }, [reset]);

  return {
    target,
    setTarget,
    type,
    setType,
    checkBusy,
    resetBusy,
    busy: checkBusy || resetBusy,
    lastCheckResult,
    lastResetResult,
    lastAction,
    errorMessage,
    confirmResetOpen,
    setConfirmResetOpen,
    check,
    openConfirmReset,
    confirmReset,
    quickSetAndCheck,
    clear,
  };
}
