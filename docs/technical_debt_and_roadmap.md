# SkillSpace Ecosystem: Technical Debt & V2 Roadmap

This document serves as a persistent ledger of architectural limitations, technical debt, and planned improvements for the SkillSpace ecosystem. It ensures future AI agents or developers have immediate context on what needs to be upgraded for scale.

## 1. CLI Packager (`apps/cli/src/utils/packager.ts`)
**Current State (V1):**
- Uses `fs.readFileSync()` and `zlib.gzipSync()` to bundle directories.
- Converts binary contents to Base64 strings inside a JSON array before gzipping.

**The Limitation:**
- **Memory Bottleneck:** Because it loads the entire project directory into RAM simultaneously, attempting to publish a project with massive files (e.g., 2GB+ machine learning models, large video datasets) will cause the Node.js V8 engine to crash with an Out-Of-Memory (OOM) or `ERR_STRING_TOO_LONG` exception.

**V2 Improvement Plan:**
- Rewrite the packaging logic to use Node.js `Streams` and the native `tar` package (which is already listed in dependencies).
- Stream the files directly from disk into a compressed `.tar.gz` archive and pipe it directly to the HTTP upload request, bypassing RAM limitations entirely.

## 2. Memory MCP Server (`packages/memory-mcp`)
**Current State (V1):**
- Uses `better-sqlite3` with Full-Text Search (FTS5).

**The Limitation:**
- **Recall Degradation:** FTS5 relies strictly on exact keyword matching (BM25 token frequency). It has zero semantic understanding. If an agent saves a note about "car", it will not retrieve it if the user later searches for "automobile". 
- Recall quality is excellent for structured data but begins to severely degrade once the database exceeds ~2,000 memories.

**V2 Improvement Plan:**
- Introduce Vector Embeddings. Either mount a tiny local ONNX embedding model (via `@xenova/transformers`) or allow passing an API key to embed strings before storing them in a `sqlite-vss` vector column. This allows true semantic matching at scale.

## 3. Registry Security & Trust Model (The "Malware" Elephant in the Room)
**Current State (V1):**
- Any logged-in user can publish arbitrary scripts to the registry via `air publish`.
- There is no automated malware scanning or source-code provenance linking.

**The Limitation (Vulnerability):**
- **Supply Chain Attacks:** A malicious hacker could publish hundreds of packages containing malware. If a user runs `air run malicious/agent`, they could theoretically be compromised if the agent tricks the user into granting it filesystem/terminal permissions.

**V2 Improvement Plan:**
- **GitHub Provenance (The "Verified Source" Model):** Force public packages to link to a public GitHub repository. The registry backend will verify that the `.skillpkg` being published exactly matches the code in the public GitHub branch (using OIDC tokens, similar to npm provenance). This guarantees transparency so the community can audit the code.
- **The SkillSpace Sandbox:** Unlike `npm` (which can run malicious `postinstall` bash scripts the second you download it), the `@skillspace/runtime` must enforce a strict sandbox. An agent cannot read the filesystem or run a bash command unless the user explicitly accepts a permission prompt in the CLI (e.g., *"Agent 'malicious/tool' is requesting to run `rm -rf /` - Allow? [y/N]"*).
- **Verified Namespaces:** Implement a verified checkmark system on the registry for known, trusted developers/organizations.
