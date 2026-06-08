# SkillSpace: A Complete Technical Guide

*From First Principles to Production*

---

**About This Book**

This book is the definitive, exhaustive guide to the SkillSpace project. Built from the ground up to solve the persistent issues of prompt drift, platform lock-in, and discoverability in AI development, SkillSpace represents a fundamental shift in how teams package and distribute AI capabilities. 

This guide meticulously dissects every facet of the codebase, leaving no stone unturned. Whether you are debugging the Model Adapter Layer, extending the CLI with new subcommands, or deploying the Next.js Registry Server for your enterprise, this book serves as your authoritative reference.

**Who This Book Is For**

*   **New Team Members:** To rapidly onboard and understand the architecture, data flow, and development environment.
*   **Senior Engineers:** As a deep-dive reference for extending core systems like the SkillSpace Runtime (SSR) or the execution sandbox.
*   **Open-Source Contributors:** To understand the coding conventions, testing strategies, and the pull request lifecycle.
*   **Enterprise Administrators:** For understanding the deployment architecture, PostgreSQL schema migrations, and security boundaries.

**How This Book Is Organized**

This book is divided into meticulously detailed chapters spanning the entire monorepo:

*   **Part I — Foundations (Chapters 1-4):** The core problem statement, environment setup, architecture, and the complete data model.
*   **Part II — Feature Deep Dives (Chapters 5-8):** Extensive breakdowns of the SkillSpace Runtime, Model Adapter Layer, MCP Integration, and the Next.js Registry.
*   **Part III — The CLI Deep Dive (Chapters 9-10):** A microscopic look at every single CLI command (`init`, `login`, `install`, `run`, etc.), exploring their exact execution paths and edge cases.
*   **Part IV — API Reference (Chapter 11):** The complete REST API specification for the Registry Server.
*   **Part V — Configuration & Operations (Chapters 12-15):** Exhaustive details on environment variables, testing strategies, deployment, and security models.
*   **Part VI — Developer Guide (Chapters 16-17):** Code style, file organization conventions, and contribution workflows.
*   **Part VII — Internals & Advanced Topics (Chapters 18-20):** Performance tuning, error handling (including firewall blocks), and a file-by-file source code tour.
*   **Part VIII — Reference (Chapters 21-23):** Complete dependency tables, script lists, and troubleshooting guides.

**Conventions Used in This Book**

*   `# Chapter N: Title` for chapters.
*   Triple-backtick fenced code blocks with language tags for all code snippets.
*   > **Note:** Important architectural context or design rationale.
*   > **Warning:** Critical security implications or potential pitfalls.
*   File paths are specified relative to the repository root (e.g., `packages/runtime/src/executor.ts`).

---

## Table of Contents

1. [Chapter 1: The Project — What It Is and Why It Exists](./chapter_01_the_project.md)
2. [Chapter 2: Getting Started — Your Development Environment](./chapter_02_getting_started.md)
3. [Chapter 3: Architecture Deep Dive](./chapter_03_architecture_deep_dive.md)
4. [Chapter 4: The Data Model](./chapter_04_the_data_model.md)
5. [Chapter 5: Skill Execution and Runtime](./chapter_05_skill_execution_and_runtime.md)
6. [Chapter 6: MCP Integration](./chapter_06_mcp_integration.md)
7. [Chapter 7: Registry and Package Management](./chapter_07_registry_and_package_management.md)
8. [Chapter 8: CLI Commands Deep Dive (init, login, install, run) ](./chapter_08_cli_commands_deep_dive.md)
9. [Chapter 9: Complete API Reference](./chapter_09_complete_api_reference.md)
10. [Chapter 10: Configuration Reference](./chapter_10_configuration_reference.md)
11. [Chapter 11: Testing Strategy](./chapter_11_testing_strategy.md)
12. [Chapter 12: Deployment Guide](./chapter_12_deployment_guide.md)
13. [Chapter 13: Security Guide](./chapter_13_security_guide.md)
14. [Chapter 14: Code Style and Conventions](./chapter_14_code_style_and_conventions.md)
15. [Chapter 15: Contributing to This Project](./chapter_15_contributing.md)
16. [Chapter 16: Performance Guide](./chapter_16_performance_guide.md)
17. [Chapter 17: Error Handling and Resilience](./chapter_17_error_handling_and_resilience.md)
18. [Chapter 18: Module-by-Module Source Code Tour](./chapter_18_module_by_module_source_code_tour.md)
19. [Chapter 19: Complete Dependency Reference](./chapter_19_dependency_reference.md)
20. [Chapter 20: Scripts and Tooling Reference](./chapter_20_scripts_and_tooling.md)
21. [Chapter 21: Troubleshooting Guide](./chapter_21_troubleshooting.md)

---
