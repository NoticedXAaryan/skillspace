# Chapter 11: Testing Strategy

This chapter outlines the testing philosophy and infrastructure used to maintain the reliability of the SkillSpace monorepo. Because SkillSpace manages both local code execution and remote network interactions, the testing pyramid is heavily skewed toward comprehensive integration tests.

---

## 1. Testing Philosophy

The monorepo employs a strict testing hierarchy:
1.  **Schema Tests (100% Coverage):** The `@skillspace/schema` package contains Zod validators. Because this package forms the boundary between external inputs (manifests, API responses) and internal logic, every schema edge case must be unit-tested.
2.  **Adapter Tests:** The Model Adapter Layer (MAL) must be tested against frozen HTTP fixtures to ensure that `system` prompts and `mcpServer` schemas are mapped correctly to the Anthropic/OpenAI specifications.
3.  **Executor Integration Tests:** The `Executor` is tested using mocked HTTP networks to simulate rate limits, timeouts, and successful tool-call loops without spending real API credits.
4.  **CLI End-to-End (E2E) Tests:** A full suite that compiles the Bun CLI, stands up a local registry, and physically executes `install`, `run`, and `publish` commands in temporary directories.

---

## 2. Unit Tests (Jest)

Unit tests are co-located with their source files using the `*.test.ts` naming convention. 

**Running Unit Tests:**
```bash
# Run all unit tests across the monorepo
pnpm run test

# Run tests for a specific package
pnpm run test --filter @skillspace/schema
```

### Example: Schema Testing
In `packages/schema/src/skill.schema.test.ts`, we validate the strictness of the kebab-case regex:
```typescript
test('rejects invalid skill names', () => {
  const result = validateSkill({ ...validBase, name: 'My Invalid Name' });
  expect(result.success).toBe(false);
  expect(result.errors.message).toContain('kebab-case');
});
```

---

## 3. Integration Tests & Mocking

Testing the `Executor` (`packages/runtime/src/executor.test.ts`) is notoriously difficult because it relies on external LLM APIs and local filesystems.

**Network Mocking:**
We use tools like `nock` or native `fetch` intercepts to simulate the LLM. 
For example, to test the exponential backoff mechanism:
1.  Mock the OpenAI endpoint to return `429 Too Many Requests` on the first two calls.
2.  Mock it to return `200 OK` on the third call.
3.  Assert that `Executor.run()` succeeds and that the total execution time was greater than the backoff wait duration.

**Filesystem Mocking:**
We use `memfs` or temporary directories (`fs.mkdtempSync`) to simulate `~/.skillspace/registry` cache hits.

---

## 4. End-to-End (E2E) CLI Testing

The E2E suite is located in the root `e2e/` directory. It uses `jest` to orchestrate shell commands against the compiled `apps/cli` binary.

**Running E2E Tests:**
```bash
pnpm run test:e2e
```

**The E2E Workflow:**
1.  **Setup:** The Jest `beforeAll` hook spawns a local Next.js instance on a random port. It initializes a test PostgreSQL database using `prisma db push`.
2.  **Auth Flow:** It executes `skillspace login` using a test JWT.
3.  **Publish Flow:** It `cd`s into a fixture directory (`e2e/fixtures/test-skill`), runs `skillspace publish`, and asserts the registry API responds with `200 OK`.
4.  **Install Flow:** It creates a fresh temp directory, runs `skillspace install test-skill`, and asserts that the `.skillpkg` is unpacked into the mock `~/.skillspace` cache and the `skillspace.lock` file is generated.
5.  **Execution Flow:** It runs `skillspace run test-skill --input "hello"`. The registry API is instructed to return a hardcoded LLM response. The test asserts that the stdout matches the expected output.
6.  **Teardown:** The mock database is dropped, and child processes are killed.

---

## 5. Continuous Integration (CI)

Our CI pipeline is defined in `.github/workflows/test-workflow.yaml`. 
On every pull request to `main`:
1.  The `pnpm build` task runs via Turborepo.
2.  `pnpm run lint` and `pnpm run format:check` ensure code style consistency.
3.  `pnpm run test` executes all unit tests.
4.  If unit tests pass, the E2E suite is executed against an ephemeral PostgreSQL database provided by GitHub Actions services.
