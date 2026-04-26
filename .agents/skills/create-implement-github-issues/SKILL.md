---
name: create-implement-github-issues
description: 'Prompt for creating GitHub issues based on a given issues list. This will help in organizing and tracking the work needed.'
---

Add issues neatly based on the provided `issues-checklist.md` list. Make sure to include a clear title, a detailed description, and appropriate labels for each issue. Also review `project-plan.md`. use github mcp to implement the issues or/and use `gh` CLI.

make sure `issues-checklist.md` is provided and contains the necessary information to create the issues. If not, ask the user for more details about the issues they want to create.

If github issues already exist, implement them one by one, choosing which ones to implement based on priority and dependencies. Use the GitHub MCP (Model-Controller-Presenter) pattern or the `gh` CLI to manage the issues effectively. Understand each issue's requirements, description, and ensure they are implemented correctly, providing updates on the progress and any blockers encountered.