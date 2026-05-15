export const DASHBOARD_STATUSES = [
  "todo",
  "in_progress",
  "partial",
  "blocked",
  "needs_review",
  "done",
  "abandoned",
] as const;

export type DashboardStatus = (typeof DASHBOARD_STATUSES)[number];

export type VerificationStatus = "passed" | "failed" | "not_run" | "not_applicable";

export interface DashboardWarning {
  file: string;
  message: string;
  severity: "warning" | "error";
}

export interface ProjectConfig {
  project?: {
    name?: string;
    repository?: string;
    description?: string;
    primary_progress_source?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CurrentStatus {
  project?: string;
  overall_status?: DashboardStatus;
  current_focus?: string;
  last_updated?: string;
  completed_work?: Task[];
  remaining_work?: Task[];
  blockers?: Blocker[];
  recent_runs?: string[];
  next_recommended_prompt?: string;
  [key: string]: unknown;
}

export interface GoalFile {
  goal?: Goal;
  goals?: Goal[];
  milestones?: Milestone[];
  tasks?: Task[];
  [key: string]: unknown;
}

export interface Goal {
  id?: string;
  title?: string;
  status?: DashboardStatus;
  milestones?: Milestone[];
  tasks?: Task[];
  [key: string]: unknown;
}

export interface Milestone {
  id?: string;
  title?: string;
  status?: DashboardStatus;
  tasks?: Task[];
  [key: string]: unknown;
}

export interface Task {
  id?: string;
  title: string;
  status: DashboardStatus;
  description?: string;
  owner?: string;
  verification?: VerificationCheck[];
  [key: string]: unknown;
}

export interface AgentRunReport {
  run_id: string;
  task_slug: string;
  status: DashboardStatus;
  goal_ids: string[];
  started_at?: string;
  completed_at?: string;
  summary?: string;
  changed_files: string[];
  verification: VerificationCheck[];
  blockers: Blocker[];
  next_recommended_prompt?: string;
  warnings?: string[];
  source_file: string;
  [key: string]: unknown;
}

export interface ThreadSummary {
  thread_id?: string;
  run_id?: string;
  status?: DashboardStatus;
  summary?: string;
  changed_files?: string[];
  next_recommended_prompt?: string;
  [key: string]: unknown;
}

export interface VerificationCheck {
  name: string;
  status: VerificationStatus;
  details?: string;
  command?: string;
  [key: string]: unknown;
}

export interface Blocker {
  id?: string;
  title: string;
  status: DashboardStatus;
  details?: string;
  owner?: string;
  [key: string]: unknown;
}

export interface DashboardData {
  project: ProjectConfig | null;
  currentStatus: CurrentStatus | null;
  goals: GoalFile | null;
  runs: AgentRunReport[];
  latestReportMarkdown: string;
  warnings: DashboardWarning[];
  schema: {
    loaded: boolean;
    statusSource: string;
  };
}
