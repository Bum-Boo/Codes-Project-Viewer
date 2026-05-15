import { promises as fs } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { normalizeStatus } from "./status";
import type {
  AgentRunReport,
  Blocker,
  CurrentStatus,
  DashboardData,
  DashboardStatus,
  DashboardWarning,
  Goal,
  GoalFile,
  Milestone,
  ProjectConfig,
  Task,
  VerificationCheck,
  VerificationStatus,
} from "./types";

const dashboardRoot = path.join(process.cwd(), ".agent-dashboard");

function toDashboardPath(relativePath: string) {
  const dashboardRelativePath = relativePath
    .replace(/^\.agent-dashboard[\\/]/, "")
    .replace(/^\.agent-dashboard$/, "");

  return path.join(dashboardRoot, dashboardRelativePath);
}

function addWarning(
  warnings: DashboardWarning[],
  file: string,
  message: string,
  severity: DashboardWarning["severity"] = "warning",
) {
  warnings.push({ file, message, severity });
}

async function readText(
  relativePath: string,
  warnings: DashboardWarning[],
  required = true,
): Promise<string | null> {
  const fullPath = toDashboardPath(relativePath);
  try {
    return await fs.readFile(fullPath, "utf8");
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : "";
    addWarning(
      warnings,
      relativePath,
      code === "ENOENT" ? "File is missing." : "Unable to read file.",
      required ? "error" : "warning",
    );
    return null;
  }
}

async function readJson<T>(
  relativePath: string,
  warnings: DashboardWarning[],
  required = true,
): Promise<T | null> {
  const content = await readText(relativePath, warnings, required);
  if (!content) {
    return null;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    addWarning(warnings, relativePath, "JSON could not be parsed.", "error");
    return null;
  }
}

async function readYaml<T>(
  relativePath: string,
  warnings: DashboardWarning[],
  required = true,
): Promise<T | null> {
  const content = await readText(relativePath, warnings, required);
  if (!content) {
    return null;
  }

  try {
    return parseYaml(content) as T;
  } catch {
    addWarning(warnings, relativePath, "YAML could not be parsed.", "error");
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeVerification(value: unknown): VerificationCheck[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = asRecord(item);
    const rawStatus = asString(record.status, "not_run").toLowerCase();
    const status: VerificationStatus =
      rawStatus === "passed" ||
      rawStatus === "failed" ||
      rawStatus === "not_run" ||
      rawStatus === "not_applicable"
        ? rawStatus
        : "not_run";

    return {
      ...record,
      name: asString(record.name, `Verification ${index + 1}`),
      status,
      details: asString(record.details),
      command: asString(record.command),
    };
  });
}

function normalizeTask(value: unknown, index: number): Task {
  if (typeof value === "string") {
    return {
      title: value,
      status: "todo",
    };
  }

  const record = asRecord(value);
  return {
    ...record,
    id: asString(record.id),
    title: asString(record.title, asString(record.name, `Task ${index + 1}`)),
    status: normalizeStatus(record.status),
    description: asString(record.description),
    owner: asString(record.owner),
    verification: normalizeVerification(record.verification),
  };
}

function normalizeTaskArray(value: unknown): Task[] {
  return Array.isArray(value) ? value.map(normalizeTask) : [];
}

function normalizeBlocker(value: unknown, index: number): Blocker {
  if (typeof value === "string") {
    return {
      title: value,
      status: "blocked",
    };
  }

  const record = asRecord(value);
  return {
    ...record,
    id: asString(record.id),
    title: asString(record.title, asString(record.name, `Blocker ${index + 1}`)),
    status: normalizeStatus(record.status || "blocked"),
    details: asString(record.details, asString(record.description)),
    owner: asString(record.owner),
  };
}

function normalizeBlockerArray(value: unknown): Blocker[] {
  return Array.isArray(value) ? value.map(normalizeBlocker) : [];
}

function normalizeCurrentStatus(value: CurrentStatus | null): CurrentStatus | null {
  if (!value) {
    return null;
  }

  const record = asRecord(value);
  return {
    ...value,
    overall_status: normalizeStatus(record.overall_status),
    current_focus: asString(record.current_focus),
    completed_work: normalizeTaskArray(record.completed_work),
    remaining_work: normalizeTaskArray(record.remaining_work),
    blockers: normalizeBlockerArray(record.blockers),
    recent_runs: asStringArray(record.recent_runs),
    next_recommended_prompt: asString(record.next_recommended_prompt),
  };
}

function normalizeGoal(value: unknown, index: number): Goal {
  const record = asRecord(value);
  return {
    ...record,
    id: asString(record.id, `goal-${index + 1}`),
    title: asString(record.title, asString(record.name, `Goal ${index + 1}`)),
    status: normalizeStatus(record.status),
    milestones: normalizeMilestoneArray(record.milestones),
    tasks: normalizeTaskArray(record.tasks),
  };
}

function normalizeMilestone(value: unknown, index: number): Milestone {
  const record = asRecord(value);
  return {
    ...record,
    id: asString(record.id, `milestone-${index + 1}`),
    title: asString(record.title, asString(record.name, `Milestone ${index + 1}`)),
    status: normalizeStatus(record.status),
    tasks: normalizeTaskArray(record.tasks),
  };
}

function normalizeMilestoneArray(value: unknown): Milestone[] {
  return Array.isArray(value) ? value.map(normalizeMilestone) : [];
}

function normalizeGoalFile(value: GoalFile | null): GoalFile | null {
  if (!value) {
    return null;
  }

  const record = asRecord(value);
  const normalizedGoal = record.goal ? normalizeGoal(record.goal, 0) : undefined;

  return {
    ...value,
    goal: normalizedGoal,
    goals: Array.isArray(record.goals) ? record.goals.map(normalizeGoal) : undefined,
    milestones: normalizeMilestoneArray(record.milestones),
    tasks: normalizeTaskArray(record.tasks),
  };
}

function normalizeRun(value: unknown, sourceFile: string): AgentRunReport {
  const record = asRecord(value);
  const idFromFile = path.basename(sourceFile, ".json");

  return {
    ...record,
    run_id: asString(record.run_id, asString(record.id, idFromFile)),
    task_slug: asString(record.task_slug, idFromFile),
    status: normalizeStatus(record.status),
    goal_ids: asStringArray(record.goal_ids),
    started_at: asString(record.started_at),
    completed_at: asString(record.completed_at, asString(record.finished_at)),
    summary: asString(record.summary),
    changed_files: asStringArray(record.changed_files),
    verification: normalizeVerification(record.verification),
    blockers: normalizeBlockerArray(record.blockers),
    next_recommended_prompt: asString(record.next_recommended_prompt),
    warnings: asStringArray(record.warnings),
    source_file: sourceFile,
  };
}

async function readRuns(warnings: DashboardWarning[]): Promise<AgentRunReport[]> {
  const runsPath = path.join(dashboardRoot, "runs");
  let entries: string[] = [];

  try {
    entries = await fs.readdir(runsPath);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? error.code : "";
    addWarning(
      warnings,
      ".agent-dashboard/runs",
      code === "ENOENT" ? "Runs directory is missing." : "Unable to read runs directory.",
      "error",
    );
    return [];
  }

  const jsonFiles = entries
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => `.agent-dashboard/runs/${entry}`)
    .sort()
    .reverse();

  const reports = await Promise.all(
    jsonFiles.map(async (relativePath) => {
      const parsed = await readJson<unknown>(relativePath, warnings, false);
      return parsed ? normalizeRun(parsed, relativePath) : null;
    }),
  );

  return reports
    .filter((report): report is AgentRunReport => report !== null)
    .sort((left, right) => {
      const leftDate = left.completed_at || left.started_at || left.run_id;
      const rightDate = right.completed_at || right.started_at || right.run_id;
      return rightDate.localeCompare(leftDate);
    });
}

export async function loadDashboardData(): Promise<DashboardData> {
  const warnings: DashboardWarning[] = [];
  const [project, currentStatus, goals, latestReportMarkdown, schemaText, runs] =
    await Promise.all([
      readYaml<ProjectConfig>(".agent-dashboard/project.yaml", warnings),
      readJson<CurrentStatus>(".agent-dashboard/current-status.json", warnings),
      readYaml<GoalFile>(".agent-dashboard/goals/main.yaml", warnings),
      readText(".agent-dashboard/reports/latest.md", warnings),
      readText(".agent-dashboard/protocol/report-schema.md", warnings, false),
      readRuns(warnings),
    ]);

  return {
    project,
    currentStatus: normalizeCurrentStatus(currentStatus),
    goals: normalizeGoalFile(goals),
    runs,
    latestReportMarkdown: latestReportMarkdown ?? "",
    warnings,
    schema: {
      loaded: Boolean(schemaText),
      statusSource: schemaText
        ? ".agent-dashboard/protocol/report-schema.md"
        : "Built-in fallback status map",
    },
  };
}

export function countCompletedWork(currentStatus: CurrentStatus | null, runs: AgentRunReport[]) {
  const statusCompleted = currentStatus?.completed_work?.length ?? 0;
  const verifiedRuns = runs.filter((run) => {
    const passed = run.verification.some((check) => check.status === "passed");
    return run.status === "done" && passed;
  }).length;

  return Math.max(statusCompleted, verifiedRuns);
}

export function getStatusTone(status: DashboardStatus) {
  const tones: Record<DashboardStatus, string> = {
    todo: "border-slate-300 bg-slate-50 text-slate-700",
    in_progress: "border-blue-200 bg-blue-50 text-blue-700",
    partial: "border-amber-200 bg-amber-50 text-amber-800",
    blocked: "border-rose-200 bg-rose-50 text-rose-700",
    needs_review: "border-purple-200 bg-purple-50 text-purple-700",
    done: "border-emerald-200 bg-emerald-50 text-emerald-700",
    abandoned: "border-zinc-300 bg-zinc-100 text-zinc-600",
  };

  return tones[status];
}
