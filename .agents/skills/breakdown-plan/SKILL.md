---
name: breakdown-plan
description: 'Issue Planning prompt that generates GitHub issues breakdown with Epic > Feature > Story/Enabler > Test hierarchy, dependencies, and priorities.'
---

# GitHub Issue Planning Prompt

## Goal

Act as a senior Project Manager with expertise in Agile methodology. Your task is to take the complete set of feature artifacts (PRD, technical breakdown, implementation plan) and generate a comprehensive GitHub issues breakdown with dependency linking and priority assignment.

## Agile Work Item Hierarchy

- **Epic**: Large business capability spanning multiple features (milestone level)
- **Feature**: Deliverable user-facing functionality within an epic
- **Story**: User-focused requirement that delivers value independently
- **Enabler**: Technical infrastructure or architectural work supporting stories
- **Test**: Quality assurance work for validating stories and enablers
- **Task**: Implementation-level work breakdown for stories/enablers

### Core Principles

- **INVEST Criteria**: Independent, Negotiable, Valuable, Estimable, Small, Testable
- **Definition of Ready**: Clear acceptance criteria before work begins
- **Definition of Done**: Quality gates and completion criteria
- **Dependency Management**: Clear blocking relationships and critical path identification

## Input Requirements

Before using this prompt, ensure you have the complete feature artifacts:

1. **Feature PRD**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}.md`
2. **Implementation Plan**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/implementation-plan.md`

## Output Format

Create one deliverable:

- **Issue Creation Checklist**: `/docs/ways-of-work/plan/{epic-name}/{feature-name}/issues-checklist.md`

### GitHub Issues Breakdown

##### Epic Issue Template

```markdown
# Epic: {Epic Name}

## Description

{Epic summary from PRD}

## Business Value

- **Primary Goal**: {Main business objective}
- **User Impact**: {How users will benefit}

## Acceptance Criteria

- [ ] {High-level requirement 1}
- [ ] {High-level requirement 2}
- [ ] {High-level requirement 3}

## Features in this Epic

- [ ] #{feature-issue-number} - {Feature Name}

## Definition of Done

- [ ] All feature stories completed
- [ ] Integration tests passing
- [ ] Lint and format checks passing

## Labels

`epic`, `{priority-level}`

## Estimate

{Epic-level t-shirt size: XS, S, M, L, XL, XXL}
```

##### Feature Issue Template

```markdown
# Feature: {Feature Name}

## Description

{Feature summary from PRD}

## User Stories in this Feature

- [ ] #{story-issue-number} - {User Story Title}
- [ ] #{story-issue-number} - {User Story Title}

## Technical Enablers

- [ ] #{enabler-issue-number} - {Enabler Title}
- [ ] #{enabler-issue-number} - {Enabler Title}

## Dependencies

**Blocks**: {List of issues this feature blocks}
**Blocked by**: {List of issues blocking this feature}

## Acceptance Criteria

- [ ] {Feature-level requirement 1}
- [ ] {Feature-level requirement 2}

## Definition of Done

- [ ] All user stories delivered
- [ ] Technical enablers completed
- [ ] Integration tests passing
- [ ] Lint and format checks passing

## Labels

`feature`, `{priority-level}`, `{component-name}`

## Epic

#{epic-issue-number}

## Estimate

{T-shirt size: XS, S, M, L, XL}
```

##### User Story Issue Template

```markdown
# User Story: {Story Title}

## Story Statement

As a **{user type}**, I want **{goal}** so that **{benefit}**.

## Acceptance Criteria

- [ ] {Specific testable requirement 1}
- [ ] {Specific testable requirement 2}
- [ ] {Specific testable requirement 3}

## Technical Tasks

- [ ] {Implementation task}
- [ ] {Integration task}

## Dependencies

**Blocked by**: {Dependencies that must be completed first}

## Definition of Done

- [ ] Acceptance criteria met
- [ ] Code review approved
- [ ] Unit tests written and passing
- [ ] Integration tests passing

## Labels

`user-story`, `{priority-level}`, `{component-name}`

## Feature

#{feature-issue-number}

## Estimate

{Story points: 1, 2, 3, 5, 8}
```

##### Technical Enabler Issue Template

```markdown
# Technical Enabler: {Enabler Title}

## Description

{Technical work required to support user stories}

## Technical Requirements

- [ ] {Technical requirement 1}
- [ ] {Technical requirement 2}

## User Stories Enabled

- #{story-issue-number} - {Story title}
- #{story-issue-number} - {Story title}

## Acceptance Criteria

- [ ] {Technical validation 1}
- [ ] {Technical validation 2}

## Definition of Done

- [ ] Implementation completed
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Code review approved

## Labels

`enabler`, `{priority-level}`, `{component-name}`

## Feature

#{feature-issue-number}

## Estimate

{Story points: 1, 2, 3, 5, 8}
```

### Priority Matrix

| Priority | Criteria                        | Label               |
| -------- | ------------------------------- | ------------------- |
| P0       | Critical path, blocking release | `priority-critical` |
| P1       | Core functionality, user-facing | `priority-high`     |
| P2       | Important but not blocking      | `priority-medium`   |
| P3       | Nice to have, technical debt    | `priority-low`      |

### Estimation Guidelines

#### Story Point Scale (Fibonacci)

- **1 point**: Simple change, <4 hours
- **2 points**: Small feature, <1 day
- **3 points**: Medium feature, 1-2 days
- **5 points**: Large feature, 3-5 days
- **8 points**: Complex feature, 1-2 weeks
- **13+ points**: Epic-level work, needs breakdown

#### T-Shirt Sizing (Epics/Features)

- **XS**: 1-2 story points total
- **S**: 3-8 story points total
- **M**: 8-20 story points total
- **L**: 20-40 story points total
- **XL**: 40+ story points total (consider breaking down)

### Dependency Types

- **Blocks**: Work that cannot proceed until this is complete
- **Related**: Work that shares context but not blocking
- **Prerequisite**: Required infrastructure or setup work
- **Parallel**: Work that can proceed simultaneously

## Issue Creation Checklist

The output checklist at `/docs/ways-of-work/plan/{epic-name}/{feature-name}/issues-checklist.md` must include:

#### Epic Level

- [ ] **Epic issue** with description and acceptance criteria
- [ ] **Epic labels applied**: `epic` + priority label

#### Feature Level

- [ ] **Feature issue** linking to parent epic
- [ ] **Dependencies identified** and documented
- [ ] **Estimation** using t-shirt sizing

#### Story/Enabler Level

- [ ] **User stories** following INVEST criteria
- [ ] **Technical enablers** identified and prioritized
- [ ] **Story point estimates** using Fibonacci scale
- [ ] **Dependencies mapped** between stories and enablers
- [ ] **Acceptance criteria** with testable requirements