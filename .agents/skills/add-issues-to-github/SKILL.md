---
name: add-issues-to-github
description: 'Create GitHub issues from local planning docs, compare local and GitHub state via issues-checklist.md, and keep both in sync.'
---

Create GitHub issues from local planning docs in a structured and traceable way.

Always require `issues-checklist.md` as the source of truth to compare local issue definitions with existing GitHub issues.

Primary workflow:
1. Validate required files exist:
   - `issues-checklist.md` (required)
   - `project-plan.md` (recommended)
   - `implementation-plan.md` and/or `prd.md` (if available)
2. Compare local checklist entries vs existing GitHub issues (via GitHub MCP and/or `gh` CLI).
3. Identify missing issues on GitHub and avoid duplicates.
4. Create missing issues with complete details:
   - Clear title
   - Problem context and scope
   - Acceptance criteria
   - Priority and dependency notes
   - Appropriate labels
5. Right after each creation, update `issues-checklist.md` with:
   - GitHub issue number
   - GitHub issue URL
   - Current status mapping (local vs GitHub)

If `issues-checklist.md` is missing or incomplete, ask the user for the required issue information before creating anything on GitHub.
