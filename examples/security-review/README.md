# security-review

> Analyze code for security vulnerabilities using OWASP Top 10

## Installation

```bash
skillspace install security-review
```

## Usage

```bash
# Review a single file
skillspace run security-review --input ./src/auth.ts

# Review with a specific model
skillspace run security-review --input ./src/api.js --model ollama/llama3.2

# Save output to file
skillspace run security-review --input ./src --output report.json
```

## What it does

This skill analyzes source code for security vulnerabilities based on the
OWASP Top 10 categories:

- **Injection** — SQL, NoSQL, OS command injection
- **Broken Authentication** — Weak credentials, session management
- **Sensitive Data Exposure** — Hardcoded secrets, weak encryption
- **XSS** — Cross-site scripting vulnerabilities
- **Broken Access Control** — Missing authorization checks

## Output Format

Returns JSON with:
- `vulnerabilities[]` — Array of found issues with severity, category, and fixes
- `summary` — Human-readable summary
- `score` — Security score (0-100, higher is better)

## Permissions

This skill requires `filesystem.read` to read source code files.
