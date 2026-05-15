# Handoff

## Current State

The project coordination protocol is initialized and `AGENTS.md` contains the controlling session start, end-of-task reporting, status, done criteria, conflict, and security rules for future Codex threads.

The dashboard schema has now been standardized in `.agent-dashboard/protocol/report-schema.md`. It defines TypeScript-compatible schemas for project config, current status, goals, milestones, tasks, run reports, thread summaries, verification checks, blockers, and decisions. `.agent-dashboard/protocol/status-taxonomy.md` now matches the canonical `AGENTS.md` statuses and includes a legacy migration map.

The reporting system is now prepared for future mobile sync at the planning level. `docs/mobile-sync-plan.md` defines the desktop viewer as the local parser and future sync agent, a future cloud backend such as Supabase as the remote store, and the first mobile app as read-only. `.agent-dashboard/protocol/sync-safety-rules.md` defines redaction, private mode, append-only run sync, derived current-status handling, and first-version mobile write restrictions.

The project directory is now initialized as a Git repository. Remote `origin` is connected to `https://github.com/Bum-Boo/Codes-Project-Viewer.git`, branch `main` tracks `origin/main`, and initial commit `399e0306d80318be83cf92a3d2df6d0de754dc49` was pushed successfully.

The consolidated project state remains `needs_review` because no parser, cloud backend, or mobile app has been implemented and the placeholder-task blocker is still open. The dashboard app should normalize legacy reports instead of deleting or rejecting them.

## What the Next Thread Should Do First

1. Read `AGENTS.md`.
2. Follow the Session Start Protocol in `AGENTS.md`.
3. Identify the linked goal, milestone, or workstream before editing files.
4. Review the 3 to 5 most recent run reports for overlapping work.
5. Preserve existing run and thread entries when updating shared state.

## Recommended Next Work

- Build or update the dashboard parser using the TypeScript-compatible schemas in `.agent-dashboard/protocol/report-schema.md`.
- Add parser support for `.agent-dashboard/protocol/sync-safety-rules.md` before implementing any cloud sync.
- Normalize legacy statuses in dashboard display without rewriting old reports automatically.
- Replace the placeholder task body with the actual narrow task before asking a thread to implement it.
- Replace starter context with the actual product brief.
- Pull from `origin/main` before future work if another thread or machine may have pushed changes.

## Migration Notes

- New reports must use canonical statuses: `todo`, `in_progress`, `partial`, `blocked`, `needs_review`, `done`, and `abandoned`.
- Older reports may use `verified`, `completed`, `not_started`, `pending_verification`, `active`, `ready`, or `complete`; normalize them using `report-schema.md`.
- The legacy JSON thread summary should be parsed into the `ThreadSummary` model with `source_format: "json"`.
- Unknown report fields should be retained as metadata.

## Mobile Sync Notes

- Local `.agent-dashboard` files remain the source.
- Desktop viewer should be the only sync writer in the first version.
- Mobile should be read-only first.
- Append-only runs are safe to sync.
- `current-status.json` should be treated as derived or last-known state in cloud sync.
- Never sync secrets, raw env files, tokens, credentials, cookies, private keys, or raw long logs.
- Per-project private mode must be available before cloud sync is enabled.

## Notes for Future Threads

- Create a new run report for every task, even if no code changes are made.
- Create a new Markdown thread summary for every Codex thread.
- Never mark a work item `done` without recording implementation, verification, documentation, and dashboard reporting evidence.
- Do not store secrets or long raw logs in `.agent-dashboard`.
- If no implementation task is supplied, record the attempt as `blocked` or `partial` rather than inventing completed work.
