import { DASHBOARD_STATUSES, type DashboardStatus } from "./types";

const legacyStatusMap: Record<string, DashboardStatus> = {
  complete: "done",
  completed: "done",
  verified: "done",
  success: "done",
  ok: "done",
  open: "todo",
  not_started: "todo",
  pending: "todo",
  active: "in_progress",
  working: "in_progress",
  started: "in_progress",
  paused: "partial",
  deferred: "partial",
  warning: "needs_review",
  review: "needs_review",
  failed: "blocked",
  error: "blocked",
  cancelled: "abandoned",
  canceled: "abandoned",
};

export function normalizeStatus(value: unknown): DashboardStatus {
  if (typeof value !== "string" || value.trim().length === 0) {
    return "needs_review";
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  if ((DASHBOARD_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as DashboardStatus;
  }

  return legacyStatusMap[normalized] ?? "needs_review";
}

export function isDoneLike(status: unknown): boolean {
  return normalizeStatus(status) === "done";
}
