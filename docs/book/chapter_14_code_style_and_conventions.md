# Chapter 14: Code Style and Conventions

This chapter outlines the strict coding standards enforced across the SkillSpace monorepo. Because this project spans a Next.js frontend, a Node.js CLI, and low-level runtime modules, consistency is essential for maintainability.

---

## 1. TypeScript Rules

SkillSpace uses TypeScript exclusively. We run with `strict: true` in our `tsconfig.json`.

*   **No `any`:** The use of `any` is strictly prohibited. If a type is unknown (e.g., parsing a raw API response), use `unknown` and validate it using a Zod schema before operating on it.
*   **Explicit Return Types:** All exported functions and methods must have explicit return types. This prevents the TypeScript compiler from wasting cycles inferring types across package boundaries and acts as a contract.
    ```typescript
    // BAD
    export const executeSkill = async (skill) => { ... }
    
    // GOOD
    export async function executeSkill(skill: Skill): Promise<ExecutionResult> { ... }
    ```
*   **Interface over Type:** Prefer `interface` for object shapes unless you need intersection or union types. Interfaces are easier for the TS compiler to cache and extend.

---

## 2. Naming Conventions

*   **Files:** `kebab-case.ts` for all files (e.g., `permission-enforcer.ts`), except for files that export a single primary class, which may use `PascalCase.ts` (e.g., `McpRegistry.ts`).
*   **Classes and Types:** `PascalCase`.
*   **Functions and Variables:** `camelCase`.
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_STEPS = 10`).
*   **Boolean Variables:** Must be prefixed with `is`, `has`, `should`, or `can` (e.g., `isStreaming`, `hasPermission`).

---

## 3. Zod and Schema Validation

Whenever data crosses a boundary (HTTP request, reading from disk, receiving LLM output), it must be parsed using Zod.

*   Do not use type assertions (`as Type`) to bypass validation.
*   When defining a Zod schema, immediately export its inferred type:
    ```typescript
    export const SkillSchema = z.object({ ... });
    export type Skill = z.infer<typeof SkillSchema>;
    ```

---

## 4. Asynchronous Code

*   **Never use `.then()` / `.catch()`:** Always use `async` / `await`.
*   **Parallelization:** If you have multiple independent async operations, use `Promise.all()` to execute them concurrently rather than sequentially `await`ing each one.
*   **Loops:** Use `for...of` loops with `await` when operations must happen sequentially (e.g., executing a chain of LLM prompts).

---

## 5. Linting and Formatting

We use `ESLint` and `Prettier`. Do not debate formatting in code reviews; let the tools handle it.
*   Indentation: 2 spaces.
*   Semicolons: Always required.
*   Quotes: Single quotes for strings, double quotes for JSX/TSX.
*   Trailing Commas: `all` (helps keep git diffs clean).

Before submitting a Pull Request, you must run:
```bash
pnpm run lint
pnpm run format
```
If these fail in CI, your PR will be automatically rejected.
