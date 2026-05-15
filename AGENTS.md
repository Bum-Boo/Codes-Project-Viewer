# Agent Operating Protocol

This repository uses `.agent-dashboard` as the primary project coordination and progress source. Git commits, branches, and pull requests may provide useful context, but they are not sufficient as the only evidence of progress.

## Session Start Protocol

Before editing files, every Codex thread must:

1. Read `.agent-dashboard/current-status.json`.
2. Read `.agent-dashboard/context/PROJECT_BRIEF.md`.
3. Read `.agent-dashboard/context/HANDOFF.md`.
4. Read `.agent-dashboard/goals/main.yaml`.
5. Read the 3 to 5 most recent `.agent-dashboard/runs/*.json` files. If fewer than 3 exist, read all available run reports.
6. Identify the linked goal, milestone, or workstream before editing files.
7. Check recent runs for overlapping work and file ownership conflicts.

If required dashboard files are missing or invalid, repair the dashboard protocol before continuing with feature work.

## End-of-Task Reporting Protocol

After working, every Codex thread must:

1. Create a unique run report at `.agent-dashboard/runs/{timestamp}_{task-slug}.json`.
2. Create a unique thread summary at `.agent-dashboard/threads/{timestamp}_{task-slug}.md`.
3. Update `.agent-dashboard/context/HANDOFF.md`.
4. Update `.agent-dashboard/reports/latest.md`.
5. Update `.agent-dashboard/current-status.json` only if there is no conflict with recent runs.
6. Keep existing run reports and thread summaries intact.

Run reports and thread summaries must be concise, factual, and structured. Include completed work, remaining work, blockers, changed files, verification performed, and next recommended prompts.

## Status Definitions

- `todo`: Work is known and has not started.
- `in_progress`: Work has started and is actively being changed.
- `partial`: Some work is complete, but the intended scope is not finished.
- `blocked`: Work cannot continue until a dependency, decision, access issue, or conflict is resolved.
- `needs_review`: Work is complete enough for review, but should not be treated as final.
- `done`: Work meets all done criteria and has verification evidence.
- `abandoned`: Work was intentionally stopped and should not be continued without a new decision.

Use these statuses consistently in dashboard reports. If another dashboard file contains older status values, prefer the definitions in this file for future reports and note any migration separately.

## Done Criteria

Do not mark a task `done` unless all of the following are true:

- `implemented`: The requested change or deliverable exists.
- `verified`: Relevant checks, tests, inspections, or validations were performed and recorded.
- `documented`: User-facing or maintainer-facing notes were updated when the change affects future work.
- `dashboard report updated`: The run report, thread summary, latest report, and handoff were updated.

If any criterion is missing, use `partial`, `needs_review`, or `blocked` instead of `done`.

## Conflict Rules

- Avoid multiple threads modifying the same files.
- If recent runs indicate overlapping work, narrow the scope or report the conflict before editing.
- Do not overwrite another thread's run report or thread summary.
- When updating shared files such as `current-status.json`, `HANDOFF.md`, or `latest.md`, preserve existing entries unless they are factually obsolete.
- If a conflict cannot be resolved safely, stop and report the blocker in the run report.

## Security Rules

- Do not store secrets in `.agent-dashboard`.
- Do not paste raw credentials, tokens, cookies, private keys, or session material.
- Summarize logs instead of pasting long raw logs.
- If secret material appears in a command output or file, describe only that secret material was found and omitted. Do not quote it.

## Verification Rule

Never mark work as `done` unless it was verified. If verification was not possible, mark the work as `partial`, `needs_review`, or `blocked` and state the reason.
