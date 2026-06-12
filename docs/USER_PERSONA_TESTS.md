# User Persona Tests — SkillSpace

5 different personality profiles try SkillSpace for the first time. Each reveals different issues.

---

## Persona 1: "Grumpy Open Source Veteran" — Dev (35, senior, skeptical)

**Profile:** Has contributed to 200+ OSS projects. Hates marketing fluff. Will close the tab in 10 seconds if the README doesn't convince him. Judges projects by code quality, not design.

### First Impression (landing page)
- Sees "Install AI capabilities like npm packages" — thinks "okay, another prompt manager"
- Terminal demo looks nice but has no actual output shown — "what does it actually do?"
- Scrolls down, sees "How it works" — "good, shows actual commands"
- Sees "Trending Skills" section with "No skills published yet" — "empty registry, useless"
- Checks GitHub link — "last commit was recent, good sign"
- **Verdict:** "Interesting concept but nothing to actually use yet. Bookmark it, check back in 6 months."

### What would make him stay
- A working skill he can actually install and run in 30 seconds
- The README showing a real example, not hypothetical
- Seeing the actual code quality of the runtime

### Frustrations
1. "No skills in the registry — why would I install a package manager with no packages?"
2. "The README says 'npm for AI' but there's nothing to install"
3. "I can't even try it without setting up a database"
4. "The examples are in the repo but not in the registry — can I install them?"

### Contribution path
- Would contribute if he found a real bug
- Would write a skill if the publish flow worked end-to-end
- Would review PRs if the code quality was good

---

## Persona 2: "Indie Hacker / Builder" — Priya (28, solo dev, pragmatic)

**Profile:** Building a SaaS product. Uses AI daily. Has 50+ prompts saved in Notion. Hates copy-pasting prompts between tools. Wants things that work NOW.

### First Impression
- "npm for AI" — "yes, exactly what I need"
- Tries to install: `npm install -g skillspace` — doesn't work (it's a pnpm monorepo, no published binary)
- "Okay, let me clone and build it"
- Runs `pnpm install` — works
- Runs `pnpm build` — works
- Tries `air --help` — "command not found"
- **Verdict:** "I can't even use this without building from source. Dead end."

### What would make her stay
- `npm install -g @skillspace/cli` — installable from npm
- A "Quick Start" that takes 2 minutes, not 20
- One skill she can install and run immediately

### Frustrations
1. "No npm package published — I have to build from source"
2. "Even if I build it, I need a running registry server to install from"
3. "The playground is frontend-only, no actual API calls"
4. "I can't even test this without a database"
5. "The create page has a 'Publish' button that does nothing"

### Contribution path
- Would publish a skill if the CLI worked
- Would write a tutorial if the quick start was clear
- Would sponsor if the product solved her real problem

---

## Persona 3: "AI/ML Engineer" — Marcus (32, enterprise, methodical)

**Profile:** Works at a fintech company. Needs to standardize how his team uses AI. Cares about security, auditability, reproducibility. Will read the entire docs before trying anything.

### First Impression
- Reads the PRD — "well thought out, good architecture"
- Checks the security model — "permissions are declared, enforced at runtime — good"
- Looks at the schema — "v2 persona model is clean"
- Tries to find deployment docs — "no deployment guide"
- Tries to find self-hosting docs — "no Docker instructions that work"
- **Verdict:** "Good architecture, incomplete execution. Can't use in production."

### What would make him stay
- Self-hosting guide with Docker Compose
- Audit logging that actually works
- SSO integration that works

### Frustrations
1. "No self-hosting documentation — just a Dockerfile that doesn't work"
2. "BetterAuth secret defaults — what about production?"
3. "No audit trail for who ran what"
4. "The permission system exists in code but isn't enforced in the registry UI"
5. "No way to see who installed what and when"

### Contribution path
- Would write enterprise integration docs
- Would contribute SSO/OIDC provider
- Would submit security audit findings

---

## Persona 4: "Curious Beginner" — Alex (22, student, enthusiastic)

**Profile:** Learning about AI. Wants to build cool things. Follows AI Twitter. Heard about MCP and prompt engineering. Wants to try everything.

### First Impression
- "This looks cool! AI package manager!"
- Clicks "Browse Registry" — empty
- Clicks "Documentation" — reads the book chapters
- "Wow, 24 chapters of documentation — this is serious"
- Tries to install — can't figure out how
- "Wait, do I need a database? I just want to try it"
- **Verdict:** "I want to like this but I can't figure out how to start"

### What would make him stay
- A 5-minute video tutorial
- Skills that work without any setup
- A playground that actually runs skills

### Frustrations
1. "I don't know what PostgreSQL is or how to set it up"
2. "The docs are long but don't tell me how to start in 5 minutes"
3. "I installed the CLI but it says 'no registry configured'"
4. "I can't even see what skills exist without a running server"
5. "The examples in the repo aren't installable"

### Contribution path
- Would write beginner tutorials
- Would create example skills
- Would report UX issues

---

## Persona 5: "CTO / Decision Maker" — Sarah (40, VP Engineering, strategic)

**Profile:** Evaluating tools for her team of 30 engineers. Needs to justify the decision. Cares about: team productivity, vendor lock-in, cost, maintenance burden.

### First Impression
- "AI skill management — interesting, let me evaluate"
- Checks GitHub stars — "not many yet"
- Checks activity — "recent commits, active development"
- Tries to find pricing — "free? How do they sustain?"
- Tries to find enterprise features — "SSO mentioned but not implemented"
- **Verdict:** "Not ready for enterprise. Interesting for个人 use."

### What would make her adopt it
- Case study from a real team using it
- Enterprise features (SSO, audit, RBAC) working
- SLA and support options

### Frustrations
1. "No case studies or testimonials from real teams"
2. "Enterprise features are listed in the roadmap but not built"
3. "No pricing page — is this a hobby project or a business?"
4. "I can't demo this to my team without a working registry"
5. "No integration with our existing tools (GitHub, Slack, etc.)"

### Contribution path
- Would sponsor if it solved a real problem
- Would recommend if it was production-ready
- Would contribute enterprise features

---

## Cross-Persona Summary

| Issue | Grumpy | Builder | Engineer | Beginner | CTO |
|-------|--------|---------|----------|----------|-----|
| No published CLI binary | x | x | | x | |
| No working registry | x | x | x | x | x |
| Can't install skills | x | x | | x | |
| No self-hosting docs | | | x | | x |
| Empty registry | x | | | x | |
| Create page broken | | x | | | |
| No 5-minute quickstart | | x | | x | |
| Playground doesn't work | | x | | x | |
| No audit logging | | | x | | x |

## Top 5 Fixes (Ordered by Impact)

1. **Publish CLI to npm** — `npm install -g @skillspace/cli` (or `air`)
2. **Working playground** — at least show skill content, even if no API execution
3. **Seed the registry** — import the 10 example skills into the database
4. **Fix create/publish flow** — wire up the frontend to the real API
5. **5-minute quickstart** — README with copy-pasteable commands that work

## Sandboxing & Security Considerations

### What users expect
- Skills can read files, make network calls, execute code
- Without sandboxing, a malicious skill could: delete files, exfiltrate data, install malware
- The permission system exists but needs to be enforced at the UI level too

### What needs to be built
1. **Permission prompts** — when a skill requests filesystem.write, show a confirmation
2. **Execution sandbox** — skills run in isolated contexts with limited permissions
3. **Network filtering** — block skills from accessing localhost, private IPs
4. **Filesystem scoping** — skills can only read/write declared paths
5. **Audit logging** — every execution is logged with what was accessed
6. **Skill scanning** — detect prompt injection patterns at publish time
