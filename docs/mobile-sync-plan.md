# Mobile Sync Plan

## Scope

This document prepares the dashboard reporting system for future mobile sync. It does not implement cloud sync, a backend, a mobile app, authentication, or any data transport.

## Source of Truth

Local project `.agent-dashboard` files remain the source for project coordination state.

The dashboard parser should read:

- `.agent-dashboard/project.yaml`
- `.agent-dashboard/current-status.json`
- `.agent-dashboard/goals/*.yaml`
- `.agent-dashboard/runs/*.json`
- `.agent-dashboard/reports/*.md`
- `.agent-dashboard/threads/*.md`
- `.agent-dashboard/protocol/*.md`

The parser should normalize legacy statuses using `.agent-dashboard/protocol/report-schema.md` and keep original report files unchanged.

## Desktop Viewer Role

The desktop viewer should be the local parser and sync agent.

Responsibilities:

- Parse local `.agent-dashboard` files.
- Normalize legacy report fields for display and sync.
- Apply redaction before any network transfer.
- Respect per-project private mode.
- Upload only safe, normalized sync payloads in future sync versions.
- Treat local append-only run reports as the most reliable progress history.

The desktop viewer should be the only writer to cloud sync state in the first sync version. Mobile clients should not write project state back to the desktop or repository.

## Future Cloud Backend

A future backend such as Supabase can store redacted dashboard snapshots and append-only run history for mobile access.

Candidate backend responsibilities:

- User authentication and authorization.
- Device registration.
- Project membership and access control.
- Versioned sync snapshots.
- Append-only run and blocker records.
- Notification fan-out.
- Audit timestamps for upload and read events.

No Supabase project, schema, API, or credentials are implemented by this plan.

## Mobile App Role

The first mobile app version should be read-only.

Allowed:

- View project status.
- View goals and workstreams.
- View recent runs and reports.
- View blockers.
- Receive notifications.

Not allowed in the first version:

- Editing `.agent-dashboard` state.
- Resolving conflicts.
- Marking work done.
- Updating `current-status.json`.
- Uploading reports back to the desktop.

## Sync Entities

Future sync payloads should be organized around these entities:

- `users`: Account identity and access boundaries.
- `devices`: Registered desktop and mobile clients.
- `projects`: Project metadata, private mode, and dashboard identity.
- `goals`: Goal and workstream state from `.agent-dashboard/goals`.
- `runs`: Append-only run reports from `.agent-dashboard/runs`.
- `reports`: Human-readable summaries from `.agent-dashboard/reports`.
- `blockers`: Current blockers derived from status, runs, and reports.
- `notifications`: Mobile-safe alerts generated from changes such as new blockers or completed runs.

## Redaction Rules

Never sync:

- Secrets.
- Raw `.env` files.
- Tokens.
- Credentials.
- Cookies.
- Private keys.
- Raw long logs.

Always:

- Summarize logs before sync.
- Strip or mask values that look like credentials.
- Allow per-project private mode that disables cloud sync entirely.
- Store only dashboard-safe summaries and metadata.

## Conflict Handling

Append-only runs are safe to sync because each run report has a unique filename and run id.

`current-status.json` should be treated as derived or last-known state in cloud sync. The dashboard app can compute current status from recent runs, blockers, goals, and reports, then compare that derived state to the local `current-status.json`.

For the first mobile sync version:

- Mobile must not overwrite desktop state.
- Mobile must not write back to local `.agent-dashboard` files.
- Desktop remains authoritative for uploads.
- Cloud stores synced snapshots and append-only records, not repository truth.
- Conflicts should be shown as read-only warnings.

## Suggested Sync Flow

1. Desktop viewer parses local `.agent-dashboard`.
2. Desktop viewer normalizes legacy statuses.
3. Desktop viewer applies redaction and private-mode checks.
4. Desktop viewer uploads a snapshot and append-only run/report records.
5. Cloud backend stores the safe payload.
6. Mobile app reads the safe payload.
7. Mobile app displays status, goals, runs, reports, blockers, and notifications.

## Non-Goals

- No cloud sync implementation in this repository yet.
- No Supabase schema or migration yet.
- No mobile write path.
- No secret scanning beyond documented sync safety requirements.
- No replacement for local `.agent-dashboard` files as the source of truth.
