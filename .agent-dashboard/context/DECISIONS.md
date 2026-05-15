# Decisions

## D-001: Use `.agent-dashboard` as the Primary Progress Source

- Date: 2026-05-16
- Status: accepted
- Context: Multiple Codex threads need a shared state layer that does not depend on Git commits or pull requests.
- Decision: Store coordination state, reports, status, and handoff notes in `.agent-dashboard`.
- Consequence: Threads must update dashboard files directly after work.

## D-002: Use JSON for Machine-Readable Reports

- Date: 2026-05-16
- Status: accepted
- Context: A future dashboard needs predictable fields for completed work, remaining work, blockers, changed files, verification, and next prompts.
- Decision: Unique run reports and thread summaries use JSON.
- Consequence: Human summaries may exist in Markdown, but structured state must remain parseable.

## D-003: Verification Required Before Done

- Date: 2026-05-16
- Status: accepted
- Context: Threads may otherwise overstate completion.
- Decision: Work cannot be marked `verified` unless verification steps are recorded.
- Consequence: Unverified work must use `pending_verification`, `in_progress`, or `blocked`.
