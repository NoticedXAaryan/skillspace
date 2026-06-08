# Chapter 7: Registry and Package Management

This chapter details how SkillSpace operates as a package manager. Just as `npm` revolutionized JavaScript by creating a centralized registry and localized cache (`node_modules`), SkillSpace manages AI capabilities through its Next.js Registry and local `~/.skillspace/registry/`.

---

## 1. Feature Overview

The package management lifecycle involves four main actions:
1.  **Publishing:** Zipping a capability directory into a `.skillpkg` tarball and pushing it to the PostgreSQL/Next.js backend.
2.  **Resolution:** Searching the registry API to find the exact, latest compatible version of a requested capability.
3.  **Installation:** Downloading the `.skillpkg`, extracting it to `~/.skillspace`, and verifying its cryptographic checksum.
4.  **Locking:** Writing the exact resolved version and checksum to a local `skillspace.lock` file.

---

## 2. The Local Cache (`packages/runtime/src/cache.ts`)

The `SkillCache` class acts as the local filesystem manager for all downloaded capabilities. 

### Structure
When a package is installed, it is unpacked into the global user directory:
```text
~/.skillspace/registry/
├── security-review@1.0.0/
│   ├── skill.yaml
│   └── tests/
├── security-review@1.1.0/
│   ├── skill.yaml
│   └── knowledge/
└── code-analyzer@2.0.1/
    └── agent.yaml
```

### Deterministic Integrity
Before the CLI unpacks a downloaded `.skillpkg`, it computes a checksum.
```typescript
computeChecksum(files: Map<string, Buffer>): string {
  const hash = crypto.createHash('sha256');
  const sortedKeys = [...files.keys()].sort();
  for (const key of sortedKeys) {
    hash.update(key);
    hash.update(files.get(key)!);
  }
  return `sha256:${hash.digest('hex')}`;
}
```
If the computed checksum does not match the checksum reported by the Registry API, installation halts instantly. This prevents supply-chain attacks where a package is intercepted and modified in transit.

---

## 3. The Install Process (`apps/cli/src/commands/install.ts`)

When a developer runs `skillspace install <pkg>`, a complex recursive resolution process begins:

1.  **API Query:** The CLI queries the Registry Server (`GET /api/packages/<pkg>`).
2.  **Version Resolution:** If no version is specified, the CLI defaults to the latest version.
3.  **Download:** It fetches the `.skillpkg` via a presigned S3/R2 URL.
4.  **Extraction & Verification:** The tarball is extracted in-memory, the checksum is verified, and the files are written to the cache via `cache.installPackage()`.
5.  **Recursive Dependencies (Agents):** 
    *   If the manifest is an `agent.yaml` (rather than a `skill.yaml`), the CLI parses the `skills` array.
    *   For every skill listed as a dependency, the installer calls itself recursively: `installRecursively(skillDep.name, skillDep.version)`.
6.  **Lockfile Generation:** A `skillspace.lock` file is generated or updated in the *current working directory*.

### The Lockfile (`skillspace.lock`)
Similar to `package-lock.json`, this file ensures environmental reproducibility.
```yaml
version: 1
generated: 2026-06-08T12:00:00Z
skills:
  security-review:
    version: 2.1.0
    resolved: "https://registry.skillspace.dev/skills/security-review/-/security-review-2.1.0.skillpkg"
    checksum: "sha256:abc123..."
```
If a team member checks this file into `git`, another developer can run `skillspace install` with zero arguments. The CLI will bypass the resolution API and fetch the exact checksums specified in the lockfile.

---

## 4. The Registry Backend (`apps/registry`)

The central repository logic is housed in a Next.js App Router application. 

### Database Schema (Prisma)
As detailed in Chapter 4, the PostgreSQL database tracks `Package` and `PackageVersion`. 
Because the `.skillpkg` tarballs can be large, they are **not** stored in the database. 
1.  The database stores the `manifest` (a stringified JSON of `skill.yaml`) for rapid search and indexing.
2.  The database stores a `storagePath` pointing to an S3 bucket (or Cloudflare R2).

### Upload & Publish Lifecycle
1.  The user runs `skillspace publish`. The CLI validates the local `skill.yaml`.
2.  The CLI compresses the directory into a `.skillpkg` buffer.
3.  The CLI sends a `POST /api/packages` request containing the buffer and a JWT authentication token.
4.  The Next.js backend intercepts the upload, validates the user's JWT, and ensures the user owns the package namespace.
5.  The backend streams the `.skillpkg` to S3.
6.  The backend inserts a new row into the `PackageVersion` table.

---

## 5. Security & Isolation

*   **Multi-Registry Support:** The `getRegistries()` function allows the CLI to query multiple endpoints. This is critical for enterprise use-cases (Phase 3) where an organization may want to query an internal registry before falling back to the public `skillspace.dev` registry.
*   **Package Allowlisting:** Handled at the database layer. If a user is part of an Enterprise Organization, the registry can intercept download requests and reject them if the package is not on the `PackageAllowlist` table.
