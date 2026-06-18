# Archived Documentation

These documents were written during earlier development phases. They are preserved for reference but are **outdated** — the codebase has since changed and these no longer accurately describe the current state.

## What's here and why it was archived

### planning/ — Early project plans (superseded by ROADMAP.md)

| File                                    | Status     | Why archived                                                                                          |
| --------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `DEEP_DIVE.md`                          | Outdated   | Pre-v2 schema codebase walkthrough. Describes old `@air/*` package names, v1 skill format.            |
| `FUTURE_PLAN.md`                        | Outdated   | Expo-inspired vision doc. Good ideas (CLI↔dashboard sync) but written before current architecture.    |
| `prd.md`                                | Outdated   | "Agent-executable" PRD with phase-by-phase checklists. Most phases completed or restructured.         |
| `REBUILD_PLAN.md`                       | Outdated   | "Rename CLI from air to skillspace" — already done. Foundation cleanup completed.                     |
| `SKILLSPACE_FUNCTIONAL_REQUIREMENTS.md` | Reference  | Human-readable functional requirements. Still useful as a requirements source but not a living doc.   |
| `TASK.MD`                               | Superseded | The v2 schema blueprint (Persona/Agent/MCP paradigm shift). Already implemented in `packages/schema`. |
| `TECHNICAL_AUDIT.md`                    | Superseded | Snapshot audit from June 2026. Issues listed have since been fixed (auth config, dummy data removal). |
| `technical_debt_and_roadmap.md`         | Reference  | Technical debt ledger. Some items resolved, some still valid. Check before starting work.             |

### book/ — AI-generated comprehensive guide (outdated)

25 chapters covering the entire codebase. Well-written but describes the project before the v2 schema migration, dummy data cleanup, and GitHub integration planning. Worth keeping as a writing reference, not as accurate documentation.

### guides/ — Development guidelines

| File                    | Status    | Why archived                                                                                       |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| `AI_GUIDELINES.md`      | Reference | Defines the SkillSpace ontology (MCP vs Skill vs Agent). Core definitions are accurate and useful. |
| `CLI_COMMANDS.md`       | Outdated  | Malformed output, pre-v2 command list.                                                             |
| `USER_PERSONA_TESTS.md` | Reference | QA persona tests. Useful for UX validation.                                                        |

### design/ — UI design references

| File             | Status      | Why archived                                                                  |
| ---------------- | ----------- | ----------------------------------------------------------------------------- |
| `SKILL.md`       | Tool config | Hallmark skill definition — used by the ZCode agent plugin, not project docs. |
| `inspiration.md` | Reference   | Aesthetic breakdowns of reference UIs (Better Auth, etc.).                    |
| `pages.md`       | Reference   | Page-specific UI pattern wireframes.                                          |

---

**Current documentation lives in the root `docs/` directory and `README.md`.**
