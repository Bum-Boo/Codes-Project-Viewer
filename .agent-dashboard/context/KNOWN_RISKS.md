# Known Risks

## Risk: Reports Drift from Actual Work

- Status: open
- Impact: Dashboard state may become unreliable.
- Mitigation: Require every thread to update run reports, thread summaries, `current-status.json`, and `latest.md` before finishing.

## Risk: Work Marked Done Without Verification

- Status: open
- Impact: Later threads may build on incomplete assumptions.
- Mitigation: Use the status taxonomy and require verification evidence for `verified`.

## Risk: Sensitive Data Added to Reports

- Status: open
- Impact: Secrets or private data could be exposed in project artifacts.
- Mitigation: Never store secrets, tokens, keys, cookies, credentials, or private personal data in dashboard files.

## Risk: Schema Changes Break Dashboard Consumers

- Status: open
- Impact: A visual dashboard or automation may fail to parse reports.
- Mitigation: Update `.agent-dashboard/protocol/report-schema.md` whenever report fields change.

## Risk: Parallel Threads Overwrite Shared Files

- Status: open
- Impact: Updates to status or thread index may be lost.
- Mitigation: Threads should read the latest dashboard state immediately before editing shared files and preserve existing entries.
