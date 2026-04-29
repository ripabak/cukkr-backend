# Execute As Needed

**Epic:** [Cukkr Step 2 - Backend Surface Completion & Contract Consolidation](./epic.md)
**Checklist Source:** [execution-order-checklist.md](./execution-order-checklist.md)
**Purpose:** Reusable execution prompt for an agent to choose the next unblocked Step 2 work, generate missing implementation plans when needed, implement one or more features, and update the checklist in place.

---

## Reusable Prompt

Use the prompt below whenever you want the agent to continue Step 2 execution autonomously.

```md
You are executing the next available Step 2 backend work from this epic folder.

Primary tracking source:
- `docs/ways-of-work/plan/cukkr-step-2-backend-surface-completion/execution-order-checklist.md`

Feature source documents:
- `docs/ways-of-work/plan/cukkr-step-2-backend-surface-completion/<feature-name>/prd.md`
- `docs/ways-of-work/plan/cukkr-step-2-backend-surface-completion/<feature-name>/implementation-plan.md`

Required behavior:

1. Read `execution-order-checklist.md` first.
2. Determine which features are still unfinished:
   - `PRD Generated = [x]`
   - `Implementation Plan Generated = [ ]` or `Implemented = [ ]`
3. Determine which unfinished features are currently unblocked:
   - Work from the earliest phase first.
   - A feature is unblocked only if every dependency listed in the checklist already has `Implemented = [x]`.
   - If multiple features in the same phase are independent and do not depend on each other, you may choose several in the same run.
4. Select the best next unit of work automatically:
   - Prefer the earliest unblocked feature(s).
   - Prefer critical foundation work before dependent work.
   - Prefer multiple independent features only when they can be executed safely without creating unnecessary merge or validation risk.
5. For each selected feature:
   - Read the feature `prd.md`.
   - If `Implementation Plan Generated = [ ]`, generate `implementation-plan.md` first by using the `breakdown-feature-implementation` skill.
   - Immediately update `execution-order-checklist.md` and mark `Implementation Plan Generated = [x]` after the file is created successfully.
   - Implement the feature in the codebase.
   - Add or update tests.
   - Run the narrowest relevant validation.
6. After all selected features have passed their focused validation, run the full repository test suite:
   - `bun test --env-file=.env`
   - This must run for the entire test suite, not only feature-specific tests.
7. After the full test suite passes:
   - run `git add` for the relevant changes,
   - create a commit using the repository commit convention,
   - push the commit to `origin dev`.
8. Only after focused validation, full-suite test execution, commit, and push all succeed, update `execution-order-checklist.md` and mark `Implemented = [x]` for each completed feature.
9. If no feature is currently unblocked for implementation, use the same run to generate missing implementation plans for the earliest valid features instead of stopping early.
10. Do not mark partial work as complete.
11. After all selected work is finished, report:
   - which feature(s) were selected,
   - why they were selected,
   - which checklist cells were updated,
   - which features remain blocked and by what dependency.

Checklist update rules:

- Never mark `PRD Generated = [x]` unless the feature PRD exists and is accepted.
- Never mark `Implementation Plan Generated = [x]` before the file exists at the correct feature path.
- Never mark `Implemented = [x]` before code, focused validation, full-suite test execution, `git add`, commit, and push are complete.
- If you implement multiple features in one run, update each row independently.

Implementation-plan rule:

- The implementation plan must be created at:
  `docs/ways-of-work/plan/cukkr-step-2-backend-surface-completion/<feature-name>/implementation-plan.md`
- Use the `breakdown-feature-implementation` skill and the feature `prd.md` as the main source.

Execution style:

- Be autonomous about feature selection.
- Respect dependency order from the checklist.
- You may execute several independent features in parallel when safe.
- Keep the checklist as the single source of truth for live progress.
- Treat full-suite test execution plus `git add` + commit + `git push origin dev` as part of the required completion flow for implementation runs.
```

---

## Recommended Trigger Sentence

If you want a short reusable command for future runs, use this:

```md
Execute Step 2 as needed using `execute_as_needed.md` and keep `execution-order-checklist.md` updated.
```