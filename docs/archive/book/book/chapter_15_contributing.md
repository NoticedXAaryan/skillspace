# Chapter 15: Contributing to This Project

We welcome contributions to SkillSpace! Whether you are fixing a bug in the CLI, adding a new Model Adapter for a localized LLM, or improving the Next.js Registry UI, this chapter outlines the workflow.

---

## 1. The Pull Request Workflow

1.  **Fork and Branch:** Fork the repository and create a new branch off `main`. Name your branch using the format `type/feature-name` (e.g., `feat/ollama-adapter` or `fix/jwt-parsing`).
2.  **Develop:** Follow the setup guide in Chapter 2 to get your local environment running.
3.  **Test Locally:** Run `pnpm run test` and `pnpm run test:e2e` to ensure your changes didn't break existing functionality.
4.  **Lint:** Run `pnpm run lint`.
5.  **Commit:** We use [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages must follow this format, as they are used to automatically generate Changelogs and determine semantic version bumps.
    *   `feat: add support for groq models`
    *   `fix(cli): resolve checksum mismatch on windows`
    *   `docs: update chapter 15`
6.  **Push and PR:** Push your branch and open a Pull Request against `main`. Fill out the provided PR template completely.

---

## 2. Adding a New Model Adapter

A common contribution is adding support for a new LLM provider. To do this:

1.  **Create the Adapter:** Create a new file in `packages/runtime/src/adapters/` (e.g., `groq.ts`).
2.  **Implement the Interface:** Your class must implement the `ModelAdapter` interface, specifically the `execute()` and `executeStream()` methods.
3.  **Map MCP Tools:** You must write the logic to map SkillSpace's agnostic tool schema into the specific JSON format required by your provider's API.
4.  **Register the Adapter:** Add your new adapter to the `AdapterRegistry` inside `packages/runtime/src/adapters/registry.ts`.
5.  **Write Tests:** Create `groq.test.ts` and write tests using mocked HTTP responses to prove the adapter formats payloads correctly.

---

## 3. Modifying the Schema

Changing `packages/schema/src/skill.schema.ts` is the most dangerous operation in the codebase, as it can break backward compatibility for all previously published `.skillpkg` files.

If you must change the schema:
1.  **Additions:** Adding an optional field is safe.
2.  **Deprecations:** Do not remove fields. Mark them as deprecated in the TypeScript types and handle them gracefully in the runtime.
3.  **Breaking Changes:** If a breaking change is absolutely necessary, it requires a major version bump of the entire `@skillspace/schema` package and a coordinated migration script for the Registry database. Discuss this in a GitHub Issue *before* writing code.

---

## 4. Code Review Expectations

When your PR is reviewed by a maintainer, expect scrutiny on:
*   **Type Safety:** Are you using `unknown` and Zod instead of `any`?
*   **Error Handling:** Are network requests wrapped in `try/catch` and retried using the `callWithRetry` utility?
*   **Security:** Does this change bypass the `PermissionEnforcer` or the `LocalModelScreener`?
*   **Performance:** Does this change introduce synchronous blocking operations (`fs.readFileSync`) in the main execution loop instead of async equivalents?
