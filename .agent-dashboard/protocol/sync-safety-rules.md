# Sync Safety Rules

These rules apply to any future dashboard sync implementation. They prepare the reporting system for mobile sync without implementing cloud sync.

## Authority Model

- Local `.agent-dashboard` files are the project source.
- The desktop viewer is the local parser and future sync agent.
- A future cloud backend such as Supabase may store redacted snapshots and append-only records.
- The first mobile app version must be read-only.
- Mobile must not overwrite desktop or repository state.

## Allowed Sync Entities

Future sync payloads may include redacted, normalized versions of:

- `users`
- `devices`
- `projects`
- `goals`
- `runs`
- `reports`
- `blockers`
- `notifications`

## Redaction Requirements

Never sync:

- Secrets.
- Raw environment files.
- Tokens.
- Credentials.
- Cookies.
- Private keys.
- Raw long logs.

Required handling:

- Summarize logs instead of syncing raw logs.
- Mask suspicious credential-like values.
- Exclude files that are not part of `.agent-dashboard` unless explicitly allowlisted.
- Provide per-project private mode that disables cloud sync.
- Record that redaction happened without storing the sensitive value.

## Conflict Rules

- Append-only run reports are safe to sync when `run_id` and filename are unique.
- Cloud sync should preserve original run reports as immutable records.
- `current-status.json` should be treated as derived or last-known state.
- The desktop viewer may derive current status from goals, blockers, reports, and recent runs.
- Mobile clients must not update `current-status.json` in the first version.
- Mobile clients must not resolve blockers or mark work `done` in the first version.
- If cloud state and local state disagree, local `.agent-dashboard` remains authoritative.
- Conflicts should be displayed as warnings until the desktop viewer uploads a new safe snapshot.

## Parser Rules

- Parse dashboard data using `.agent-dashboard/protocol/report-schema.md`.
- Normalize legacy statuses before sync.
- Preserve original report files and original status values for auditability.
- Treat unknown report fields as metadata.
- Reject or quarantine unparseable records from sync, but do not delete local files.

## Notification Rules

Notifications may be generated for:

- New blockers.
- New run reports.
- Failed verification checks.
- Status moving to `needs_review` or `blocked`.
- Sync conflicts detected by the desktop viewer.

Notifications must not include secrets, raw logs, tokens, or raw file contents.

## Private Mode

Each project must support a private mode flag before cloud sync is enabled.

When private mode is on:

- Do not upload project data.
- Do not upload run reports.
- Do not upload reports or blockers.
- Local dashboard parsing may still work.
- Mobile views should show no cloud-synced project data unless previously cached data is explicitly allowed by the user.

## First-Version Mobile Constraints

The first mobile sync version is read-only:

- Read project status.
- Read goals.
- Read runs.
- Read reports.
- Read blockers.
- Read notifications.

The first mobile sync version must not:

- Edit dashboard files.
- Upload run reports.
- Modify blockers.
- Modify goals.
- Modify `current-status.json`.
- Resolve conflicts.
