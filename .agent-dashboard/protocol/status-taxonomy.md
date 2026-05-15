# Status Taxonomy

Use the canonical statuses from `AGENTS.md` for all new dashboard writes.

## Canonical Work Statuses

- `todo`: Work is known and has not started.
- `in_progress`: Work has started and is actively being changed.
- `partial`: Some work is complete, but the intended scope is not finished.
- `blocked`: Work cannot continue until a dependency, decision, access issue, or conflict is resolved.
- `needs_review`: Work is complete enough for review, or the state is uncertain and should not be treated as final.
- `done`: Work meets done criteria and has verification evidence.
- `abandoned`: Work was intentionally stopped and should not be continued without a new decision.

## Verification Statuses

- `passed`: A check, inspection, parse, test, or validation succeeded.
- `failed`: A check, inspection, parse, test, or validation failed.
- `not_run`: A relevant check was not run, with a recorded reason.

## Legacy Status Migration

Older dashboard files may contain these statuses. Readers should normalize them without rewriting old reports automatically:

- `not_started` -> `todo`
- `pending_verification` -> `needs_review`
- `verified` -> `done`
- `completed` -> `done`
- `active` -> `in_progress`
- `ready` -> `needs_review`
- `complete` -> `done`

## Rules

- New reports must use canonical statuses only.
- Do not use `done` without verification evidence.
- Use `needs_review` when a status is uncertain.
- Use `partial` when some work is complete but the full requested scope is not.
- Use `blocked` when external input or a conflict prevents progress.
