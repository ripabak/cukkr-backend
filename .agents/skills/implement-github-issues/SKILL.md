---
name: implement-github-issues
description: 'Implement existing GitHub issues based on priority and dependencies, while reconciling status with issues-checklist.md and updating both sides.'
---

Implement existing GitHub issues in execution order and keep local tracking aligned.

Always require `issues-checklist.md` to compare local progress with current GitHub issue status.

Primary workflow:
1. Validate required files exist:
   - `issues-checklist.md` (required)
   - `project-plan.md` (recommended)
   - `implementation-plan.md` and/or `prd.md` (if available)
2. Compare local checklist status vs GitHub issue status/metadata.
3. Select issues to implement by:
   - Priority
   - Dependencies
   - Readiness to execute
4. Implement issues one-by-one.
   - Parallel work is allowed only for independent issues.
5. After each issue is implemented:
   - Update GitHub issue progress/status/comments
   - Update `issues-checklist.md` immediately with implementation state and references

Use GitHub MCP and/or `gh` CLI to manage issue metadata, progress, and cross-references.

If `issues-checklist.md` is missing or does not contain enough detail to proceed, ask the user for clarification first.
