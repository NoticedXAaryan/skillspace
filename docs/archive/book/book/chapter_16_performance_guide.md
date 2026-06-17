# Chapter 16: Performance Guide

SkillSpace is designed to be highly responsive. When a user runs `skillspace run`, they expect immediate streaming output, regardless of the complexity of the underlying skill. This chapter details the performance optimizations embedded in the architecture.

---

## 1. Turborepo Caching

Because SkillSpace is a monorepo, build times could easily exceed several minutes. We use Turborepo to eliminate redundant work.

*   **Task Caching:** When you run `pnpm run build` or `pnpm run test`, Turborepo hashes the input files. If the files haven't changed since the last run, it instantly restores the output from the local cache (`node_modules/.cache/turbo`) instead of recompiling.
*   **Remote Caching:** In CI, Turborepo is connected to a remote cache (like Vercel). If Developer A builds the project, and Developer B pulls their branch, Developer B's build will complete in milliseconds by downloading the cached artifacts.

---

## 2. Registry Performance (Next.js)

The Registry Server is designed to handle thousands of concurrent `install` requests without breaking a sweat.

### Database Indexing
The `apps/registry/prisma/schema.prisma` includes critical indices:
```prisma
@@index([name, version])
@@index([ownerId])
```
When the CLI requests a specific package version, the database performs a sub-millisecond index lookup rather than a full table scan.

### Bandwidth Offloading
As mentioned in Chapter 7, the Next.js server **never** serves the binary `.skillpkg` files directly. It acts purely as a metadata and auth layer.
When an install is requested, Next.js generates an AWS S3 Presigned URL and issues an HTTP 302 Redirect. The CLI then downloads the megabyte-sized tarball directly from Amazon's edge network, completely bypassing the Node.js event loop.

---

## 3. Runtime Performance (SSR)

The `packages/runtime` is optimized to reduce latency before the first LLM token is printed.

### Zero-Overhead Resolution
When `skillspace run <pkg>` is executed, the `SkillResolver` does not make a network request to the registry. It looks exclusively in `~/.skillspace/registry/`. This offline-first approach guarantees sub-millisecond resolution times.

### Streaming by Default
Unless the skill requires MCP tool calls, the `Executor` uses `runStream()`. This utilizes the HTTP `ReadableStream` API to process chunks as they arrive over the TCP socket, yielding them instantly to the CLI.

### Async I/O
The runtime strictly avoids synchronous filesystem operations (e.g., `fs.readFileSync`) during execution, opting for `fs.promises.readFile`. This ensures that a skill reading a large local file doesn't block the Node.js event loop, which is critical if the runtime is embedded in a highly concurrent server environment via the `@skillspace/sdk-ts`.

---

## 4. MCP Performance

MCP introduces IPC (Inter-Process Communication) overhead.

*   **Connection Pooling:** If a skill loops and calls the same MCP server multiple times, the `McpRegistry` does *not* spawn a new `stdio` process for each call. It spawns the process once during initialization and maintains the `stdin`/`stdout` streams open for the duration of the skill execution.
*   **Fast Teardown:** When execution completes, `mcpRegistry.disconnectAll()` sends a `SIGTERM` to gracefully and rapidly kill the child processes, freeing up OS resources immediately.
