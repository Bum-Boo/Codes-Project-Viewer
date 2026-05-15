# Project Brief

## Purpose

This repository is configured for multi-thread Codex coordination. The `.agent-dashboard` directory is the shared progress source for project state, thread activity, verification, and handoff information.

## Current Scope

The initial scope is protocol setup, not application feature development. Future threads should replace this starter brief with details about the actual product, users, runtime, and delivery goals.

## Operating Model

Multiple Codex threads may work independently. Each thread must read shared state before working and write a structured report afterward so later threads can continue without relying on memory, Git history, or chat context alone.

## Reporting Expectations

Each report should include:

- Completed work
- Remaining work
- Blockers
- Changed files
- Verification performed
- Next recommended prompts

## Constraints

- `.agent-dashboard` is the primary progress source.
- Do not store secrets in reports.
- Do not mark work done unless verified.
- Keep reports concise, factual, and structured.
