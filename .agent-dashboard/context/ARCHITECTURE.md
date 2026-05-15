# Architecture

## Dashboard Layout

```text
.agent-dashboard/
  project.yaml                 Project-level protocol metadata
  current-status.json          Current machine-readable state
  goals/main.yaml              Goal tracking and success criteria
  context/                     Human-readable project context
  threads/thread-index.json    Registry of thread summaries
  threads/thread-*.json        One summary per Codex thread
  runs/*.json                  One structured report per run/task
  reports/latest.md            Latest human-readable project summary
  reports/completion-summary.md Goal-level completion summary
  protocol/                    Reporting rules, schema, and status taxonomy
```

## Data Flow

1. A thread starts by reading `project.yaml`, `current-status.json`, `goals/main.yaml`, context files, the thread index, and the latest report.
2. The thread performs scoped work.
3. The thread writes a unique run report under `runs/`.
4. The thread writes a unique summary under `threads/`.
5. The thread updates `thread-index.json`, `current-status.json`, and `reports/latest.md`.
6. If goal progress changed, the thread updates `reports/completion-summary.md`.

## Dashboard Consumption

A dashboard can read:

- `current-status.json` for current state, blockers, completed work, remaining work, changed files, verification, and next prompts.
- `threads/thread-index.json` for thread-level history.
- `runs/*.json` for task-level reports.
- `goals/main.yaml` for success criteria and workstream status.

## Source of Truth

Git metadata is optional context. The dashboard must not require commits, branches, or pull requests to determine project progress.
