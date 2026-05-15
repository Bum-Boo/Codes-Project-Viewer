# Reporting Rules

## Primary Rule

`.agent-dashboard` is the primary project progress source. Do not rely on Git commits, branches, or pull requests as the only evidence of progress.

## Before Working

Each Codex thread must read:

1. `AGENTS.md`
2. `.agent-dashboard/project.yaml`
3. `.agent-dashboard/current-status.json`
4. `.agent-dashboard/goals/main.yaml`
5. `.agent-dashboard/context/PROJECT_BRIEF.md`
6. `.agent-dashboard/context/ARCHITECTURE.md`
7. `.agent-dashboard/context/DECISIONS.md`
8. `.agent-dashboard/context/KNOWN_RISKS.md`
9. `.agent-dashboard/context/HANDOFF.md`
10. `.agent-dashboard/threads/thread-index.json`
11. `.agent-dashboard/reports/latest.md`

## After Working

Each Codex thread must create:

- One unique run report in `.agent-dashboard/runs/`
- One unique thread summary in `.agent-dashboard/threads/`

Each Codex thread must update:

- `.agent-dashboard/current-status.json`
- `.agent-dashboard/threads/thread-index.json`
- `.agent-dashboard/reports/latest.md`
- `.agent-dashboard/reports/completion-summary.md` when goal completion changes

## Required Report Fields

Reports must include:

- Run or thread id
- Task or objective
- Status
- Completed work
- Remaining work
- Blockers
- Changed files
- Verification
- Next recommended prompts

## Verification

Use `verified` only when checks were performed and recorded. If checks were skipped, failed, or could not run, use `pending_verification` or `blocked`.

## Secret Handling

Never store secrets in reports. This includes API keys, passwords, tokens, private keys, session cookies, credentials, or sensitive personal data.

## Concision

Reports should be short enough to scan quickly while still including all required fields. Prefer structured lists over long narrative text.
