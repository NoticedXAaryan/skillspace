# Registry API Reference

**Status:** Accurate as of 2026-06-17 · Base URL: `https://<your-registry>/api`

All routes return a standard envelope (except auth and download):

```ts
// success
{ success: true, data: T, meta?: { page, limit, total } }
// error
{ success: false, error: string, details?: object }
```

## Authentication

Two flows, both handled by `getUserFromRequest`:

- **Browser** — BetterAuth session cookie (set by `/api/auth/*`).
- **CLI** — `Authorization: Bearer <token>` header, where the token is a valid
  `Session.token`.

Authenticated routes below are marked 🔒.

---

## Packages

### `GET /api/packages`

List packages. Public. Rate-limited 100/min/IP.

| Query          | Default   | Notes                                                    |
| -------------- | --------- | -------------------------------------------------------- |
| `type`         | —         | `skill` \| `agent` \| `workflow` \| `mcp` \| `knowledge` |
| `sort`         | `popular` | `popular` \| `recent` \| `name`                          |
| `q` / `search` | —         | Case-insensitive name/description match                  |
| `page`         | `1`       |                                                          |
| `limit`        | `20`      | Max 100                                                  |

### `POST /api/packages` 🔒

Publish a new package (file upload) or version. Rate-limited 15/min/IP.
Multipart form: `file` + `metadata` (JSON). Runs prompt-injection firewall on
skill personas. Enforces scope ownership and storage quota.

### `GET /api/packages/:name`

Package metadata + latest version. Public.

### `GET /api/packages/:name/versions`

All versions of a package. Public.

### `GET /api/packages/:name/:version/download`

Download a package version. Public (unless the package is private). Increments
the download counter. Returns the package bytes with `X-Checksum` header.

> **Planned (Phase 1):** when `githubUrl` is set, this returns a 302 redirect to
> `raw.githubusercontent.com` instead of streaming from S3.

### `POST /api/packages/:name/publish` 🔒

Publish a new version of an existing package from YAML (web dashboard flow).
Validates semver strictly increments, computes SHA-256 checksum, checks quota,
writes atomically. Owner-only.

### `POST /api/packages/link-github` 🔒

Link a package to a GitHub repo. Sets `githubUrl` / `githubPath` / `githubBranch`.

---

## Search

### `GET /api/search`

| Query           | Default   |
| --------------- | --------- |
| `q`             | required  |
| `type`          | —         |
| `page`, `limit` | `1`, `20` |

Returns packages with author, downloads, tags, latest version, verified flag.

---

## v1 SDK endpoints

Public, envelope-wrapped endpoints used by the TypeScript/Python SDKs.

### `GET /api/v1/packages?q=&limit=`

### `GET /api/v1/users?username=&limit=`

---

## Organizations

### `GET /api/orgs` 🔒

List orgs the user belongs to.

### `POST /api/orgs` 🔒

Create an org. Body: `{ name, slug }`. Slug must not collide with an existing org
**or** user username.

### `GET /api/orgs/:slug/members` 🔒

### `POST /api/orgs/:slug/invites` 🔒

### `POST /api/orgs/invites/accept` 🔒

---

## Account & profile

### `GET /api/profile` 🔒

The authenticated user's profile.

### `POST /api/settings` 🔒

Update user settings.

### `POST /api/onboarding` 🔒

Save onboarding state.

---

## Execution & telemetry

### `POST /api/execution/remote` 🔒

Remote execution from the CLI/dashboard. Streams results.

### `POST /api/execution/log` 🔒

Record an execution log entry.

### `POST /api/telemetry` 🔒

Batch telemetry upload.

### `GET /api/analytics`

Aggregate ecosystem metrics (package count, executions, contributors, monthly
breakdown, type distribution). Public.

---

## Playground

### `POST /api/playground/run` 🔒

Run a skill in the playground. Streams tokens via server-sent events.

---

## Streaming

### `GET /api/stream/cli` 🔒

### `GET /api/stream/execution` 🔒

Real-time event streams for the dashboard.

---

## Auth (BetterAuth)

### `POST /api/auth/:action`

Full BetterAuth surface: sign-up, sign-in, sign-out, session refresh, GitHub
OAuth callback, 2FA enable/verify. See
[better-auth docs](https://www.better-auth.com/docs) for the request shapes.

---

## Health

### `GET /api/health`

Returns `{ status: "ok" }`. Used by uptime checks and Vercel cron.

---

## Benchmarks

### `POST /api/benchmarks` 🔒

Submit a benchmark result for a package version.

---

## Rate limits

| Scope          | Limit          |
| -------------- | -------------- |
| All `GET`      | 100 / min / IP |
| `POST` publish | 15 / min / IP  |

`429` responses include guidance to retry later.

---

## Planned routes (Phase 1)

| Route                                                | Purpose                                          |
| ---------------------------------------------------- | ------------------------------------------------ |
| `POST /api/webhooks/github`                          | Re-index a package when its repo is pushed to    |
| `POST /api/packages` with `{ github: "owner/repo" }` | Publish from a GitHub URL instead of file upload |
