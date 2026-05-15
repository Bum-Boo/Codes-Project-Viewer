# Report Schema

This file defines the canonical `.agent-dashboard` data model for dashboard consumers and future Codex threads.

Writers should emit the canonical statuses from `AGENTS.md`: `todo`, `in_progress`, `partial`, `blocked`, `needs_review`, `done`, and `abandoned`.

Readers should also accept legacy statuses already present in older reports and normalize them with the migration map below.

## TypeScript-Compatible Schemas

```ts
export type SchemaVersion = string;
export type ISODateTime = string;
export type RelativePath = string;

export type DashboardStatus =
  | "todo"
  | "in_progress"
  | "partial"
  | "blocked"
  | "needs_review"
  | "done"
  | "abandoned";

export type LegacyStatus =
  | "not_started"
  | "pending_verification"
  | "verified"
  | "completed"
  | "active"
  | "ready"
  | "complete";

export type InputStatus = DashboardStatus | LegacyStatus;
export type VerificationStatus = "passed" | "failed" | "not_run";

export interface ProjectConfig {
  schema_version: SchemaVersion;
  project: {
    name: string;
    root: RelativePath;
    dashboard_path: RelativePath;
    primary_progress_source: RelativePath;
    git_dependency: string;
    initialized_at: ISODateTime;
    initialized_by: string;
  };
  purpose: {
    summary: string;
    goals_file: RelativePath;
    status_file: RelativePath;
  };
  protocol: {
    version: string;
    reporting_rules: RelativePath;
    report_schema: RelativePath;
    status_taxonomy: RelativePath;
  };
  required_read_order: RelativePath[];
  required_write_outputs: {
    run_report_pattern: string;
    thread_summary_pattern: string;
    status_updates: RelativePath[];
  };
  constraints: {
    no_secrets_in_reports: boolean;
    done_requires_verification: boolean;
    reports_must_be_concise: boolean;
    progress_not_limited_to_git: boolean;
  };
}

export interface CurrentStatus {
  schema_version: SchemaVersion;
  last_updated: ISODateTime;
  overall_status: InputStatus;
  current_focus: string;
  completed_work: Task[];
  remaining_work: Task[];
  blockers: Blocker[];
  active_threads: Array<string | ThreadRef>;
  recent_runs: RunRef[];
  reporting_audit?: {
    last_audit_run: RelativePath;
    status: InputStatus;
    findings: string[];
  };
  changed_files: RelativePath[];
  next_recommended_prompts: string[];
  notes?: string[];
}

export interface GoalFile {
  schema_version: SchemaVersion;
  goal: Goal;
  success_criteria: string[];
  workstreams: Milestone[];
  remaining_questions?: string[];
}

export interface Goal {
  id: string;
  title: string;
  status: InputStatus;
  owner?: string;
  created_at?: ISODateTime;
  updated_at?: ISODateTime;
  summary: string;
  milestones?: Milestone[];
  tasks?: Task[];
}

export interface Milestone {
  id: string;
  title: string;
  status: InputStatus;
  summary?: string;
  next_step?: string;
  verification?: string[] | VerificationCheck[];
  tasks?: Task[];
}

export interface Task {
  id?: string;
  title: string;
  status: InputStatus;
  summary?: string;
  owner?: string;
  linked_goal?: LinkedGoal;
  evidence?: string;
  run_report?: RelativePath;
  thread_summary?: RelativePath;
  changed_files?: RelativePath[];
  verification?: string[] | VerificationCheck[];
  next_recommended_prompts?: string[];
}

export interface AgentRunReport {
  schema_version: SchemaVersion;
  run_id: string;
  thread_id: string;
  task: string;
  status: InputStatus;
  linked_goal?: LinkedGoal;
  started_at: ISODateTime;
  completed_at?: ISODateTime;
  summary: string;
  completed_work: Task[];
  remaining_work: Array<string | Task>;
  blockers: Blocker[];
  changed_files: RelativePath[];
  verification: VerificationCheck[];
  next_recommended_prompts: string[];
  secret_handling: {
    secrets_stored: boolean;
    notes: string;
  };
  [extensionField: string]: unknown;
}

export interface ThreadSummary {
  schema_version?: SchemaVersion;
  thread_id: string;
  status: InputStatus;
  objective?: string;
  linked_goal?: LinkedGoal;
  started_at?: ISODateTime;
  completed_at?: ISODateTime;
  completed_work: Array<string | Task>;
  remaining_work: Array<string | Task>;
  blockers: Array<string | Blocker>;
  changed_files: RelativePath[];
  verification: Array<string | VerificationCheck>;
  next_recommended_prompts: string[];
  source_format: "markdown" | "json";
}

export interface VerificationCheck {
  name?: string;
  type?: string;
  status: VerificationStatus;
  details?: string;
  summary?: string;
  evidence?: string;
}

export interface Blocker {
  id?: string;
  title?: string;
  status: InputStatus;
  summary?: string;
  details?: string;
  run_report?: RelativePath;
}

export interface Decision {
  id: string;
  date?: string;
  status: "proposed" | "accepted" | "deprecated" | "superseded";
  context: string;
  decision: string;
  consequence: string;
}

export interface LinkedGoal {
  goal_id: string;
  workstream_id?: string | null;
  milestone_id?: string | null;
  task_id?: string | null;
  reason?: string;
  notes?: string;
}

export interface RunRef {
  run_id: string;
  task: string;
  status: InputStatus;
  path: RelativePath;
  completed_at?: ISODateTime;
}

export interface ThreadRef {
  thread_id: string;
  status: InputStatus;
  summary_path?: RelativePath;
  latest_run_report?: RelativePath;
}
```

## Canonical Run Report Example

Every new run report should match this shape. Additional task-specific fields are allowed, but dashboard consumers should rely on the common fields.

```json
{
  "schema_version": "1.0.0",
  "run_id": "run-YYYYMMDD-HHMMSS-task-slug",
  "thread_id": "thread-YYYYMMDD-HHMMSS-task-slug",
  "task": "Brief task description.",
  "status": "done",
  "linked_goal": {
    "goal_id": "main",
    "workstream_id": "protocol-setup",
    "reason": "Explain why this task belongs to the workstream."
  },
  "started_at": "2026-05-16T06:56:28+09:00",
  "completed_at": "2026-05-16T06:59:28+09:00",
  "summary": "One or two sentence outcome.",
  "completed_work": [
    {
      "title": "Work item",
      "status": "done",
      "evidence": "What was implemented or checked."
    }
  ],
  "remaining_work": [
    "Follow-up work, if any."
  ],
  "blockers": [],
  "changed_files": [
    ".agent-dashboard/protocol/report-schema.md"
  ],
  "verification": [
    {
      "name": "json_parse_check",
      "status": "passed",
      "details": "All dashboard JSON files parsed successfully."
    },
    {
      "name": "application_tests",
      "status": "not_run",
      "details": "No application behavior changed."
    }
  ],
  "next_recommended_prompts": [
    "Concrete prompt for the next thread."
  ],
  "secret_handling": {
    "secrets_stored": false,
    "notes": "No secrets were added."
  }
}
```

## Canonical Thread Summary Model

New thread summaries are Markdown files, but dashboard consumers should parse them into this model. Legacy JSON thread summaries can be parsed into the same model with `source_format: "json"`.

```json
{
  "schema_version": "1.0.0",
  "thread_id": "thread-YYYYMMDD-HHMMSS-task-slug",
  "status": "done",
  "objective": "Brief task objective.",
  "linked_goal": {
    "goal_id": "main",
    "workstream_id": "protocol-setup"
  },
  "completed_work": [],
  "remaining_work": [],
  "blockers": [],
  "changed_files": [],
  "verification": [],
  "next_recommended_prompts": [],
  "source_format": "markdown"
}
```

## Migration Note for Older Reports

Dashboard readers must not delete or reject older reports only because they use legacy statuses or JSON thread summaries. Instead:

1. Parse all JSON files with a tolerant reader.
2. Normalize legacy statuses with this map:
   - `not_started` -> `todo`
   - `pending_verification` -> `needs_review`
   - `verified` -> `done`
   - `completed` -> `done`
   - `active` -> `in_progress`
   - `ready` -> `needs_review`
   - `complete` -> `done`
3. Preserve the original status in UI details when useful.
4. Treat missing optional fields as empty arrays or `undefined`.
5. Treat unknown extension fields as metadata, not parse failures.
6. Prefer canonical Markdown thread summaries, but accept the legacy JSON thread summary at `.agent-dashboard/threads/thread-20260516-063920-setup-dashboard.json`.

## Existing Report Warnings

No audited JSON report is unparseable. These compatibility warnings remain for dashboard consumers:

- `.agent-dashboard/runs/20260516-063920-setup-dashboard.json` uses legacy status `verified`; normalize it to `done`.
- `.agent-dashboard/threads/thread-20260516-063920-setup-dashboard.json` is a legacy JSON thread summary; parse it into the `ThreadSummary` model with `source_format: "json"`.
- `.agent-dashboard/threads/thread-index.json` is stale and does not list all newer Markdown thread summaries.
- `.agent-dashboard/goals/main.yaml` still uses legacy workstream statuses `verified` and `not_started`; normalize them for display.
- Some run reports include extension fields such as `audit_scope`, `findings`, `actual_thread_work_summary`, and `conflict_check`; dashboard readers should retain but not require them.

## Validation Notes

- New run reports should use canonical statuses only.
- `done` requires verification evidence.
- `verification.status` must be `passed`, `failed`, or `not_run`.
- File paths should be repository-relative.
- Do not include secrets or raw sensitive values.
