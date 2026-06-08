# SkillSpace

**The Universal Runtime & Registry for AI Capabilities**

SkillSpace allows you to install, share, version, and execute AI skills, agents, and workflows. Stop rebuilding prompts from scratch. Ship AI features with the predictability of software packages.

## Overview

SkillSpace is built as a monorepo consisting of:
- **Registry (`apps/registry`)**: A Next.js 15 App Router web interface for discovering, managing, and analyzing published AI capabilities.
- **Runtime (`packages/runtime`)**: The core execution engine that translates and runs capabilities across multiple models (Claude, OpenAI, Gemini).
- **Schema (`packages/schema`)**: Shared Zod schemas for validation and type-safety across the platform.

## Quick Start

### Prerequisites
- Node.js (v18+)
- pnpm (v10)
- PostgreSQL (via Neon or local)

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Environment Variables:
   Copy `.env.example` to `.env.local` and fill in the required database and API keys.

3. Database Migrations:
   ```bash
   cd apps/registry
   npx prisma migrate deploy
   ```

4. Run the Dev Server:
   ```bash
   pnpm dev
   ```

## Registry Features

The registry is a Next.js application backed by Prisma and PostgreSQL.
- `/packages` - Browse published AI skills and workflows.
- `/search` - Global search across the registry.
- `/docs` - Documentation for publishing and integrating capabilities.
- `/analytics` - Real-time telemetry, execution logs, and usage charts.
- `/organization` - Manage team members and package allowlists.
- `/profile` - User dashboard and published packages.

## License

MIT
