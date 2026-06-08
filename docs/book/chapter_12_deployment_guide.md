# Chapter 12: Deployment Guide

This chapter details the deployment architecture for the SkillSpace ecosystem. Because the SkillSpace Runtime (SSR) is executed locally by users via the CLI, "deployment" primarily refers to the hosting of the **Next.js Registry Server** and its backing data stores.

---

## 1. Deployment Architecture

The production environment consists of three primary layers:

1.  **The Application Layer (Next.js):** A serverless or containerized deployment of `apps/registry`. This handles all API requests (`/api/packages`, `/api/auth`) and serves the web dashboard.
2.  **The Database Layer (PostgreSQL):** A managed relational database storing the Prisma schema (Users, Packages, Versions, Executions).
3.  **The Object Storage Layer (S3/R2):** A highly available blob store holding the immutable `.skillpkg` tarballs. 

```mermaid
graph TD
    Client[CLI / User Browser]
    
    subgraph "Hosting Platform (e.g., Vercel / AWS ECS)"
        NextJS[Next.js App Router]
    end
    
    subgraph "Managed Services"
        DB[(PostgreSQL)]
        BlobStorage[(S3 / Cloudflare R2)]
    end

    Client -->|API Requests & Web Traffic| NextJS
    NextJS -->|Read/Write Metadata| DB
    NextJS -->|Generate Presigned URLs| BlobStorage
    Client -->|Direct Tarball Download| BlobStorage
```

---

## 2. Infrastructure Requirements

To deploy the Registry Server, you need:
*   A Node.js runtime environment (Vercel, AWS ECS, Google Cloud Run, or a basic VPS running Docker).
*   A PostgreSQL instance (Neon DB, AWS RDS, Supabase).
*   An S3-compatible object storage bucket (AWS S3, Cloudflare R2, MinIO).

---

## 3. Docker / Containerization

The monorepo provides a `Dockerfile` for containerizing the Next.js registry application. 

### Multi-Stage Dockerfile Overview
The `Dockerfile` employs a multi-stage build using Turborepo's pruning feature to keep the final image extremely small.
1.  **Prune Stage:** `turbo prune --scope=registry` isolates only the files required by `apps/registry`.
2.  **Builder Stage:** Runs `pnpm install`, generates the Prisma client (`npx prisma generate`), and executes the Next.js build step (`pnpm run build`).
3.  **Runner Stage:** A minimal Node.js Alpine image that copies the standalone build output (`.next/standalone`) and the `public` folder, setting the `PORT` to 3000.

### Running the Container
```bash
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your_secure_secret" \
  -e S3_BUCKET="skillspace-packages" \
  -e AWS_ACCESS_KEY_ID="xxx" \
  -e AWS_SECRET_ACCESS_KEY="xxx" \
  skillspace-registry:latest
```

---

## 4. Continuous Deployment Pipeline (CI/CD)

The standard deployment pipeline handles code promotion from GitHub to production.

1.  **Trigger:** A merge to the `main` branch.
2.  **Test:** The CI pipeline runs `pnpm test:e2e` to ensure no regressions.
3.  **Database Migration:** The pipeline runs `npx prisma migrate deploy`. This applies any pending schema changes sequentially. *Crucially, this step must succeed before the application is deployed to ensure the DB schema matches the Prisma Client.*
4.  **Build & Deploy:** The Docker image is built and pushed to a registry (e.g., ECR), or the Vercel builder kicks off the serverless deployment.

---

## 5. Scaling Considerations

*   **Stateless Application Layer:** The Next.js application is 100% stateless. Sessions are managed via JWTs. You can scale horizontally to hundreds of instances without issue.
*   **Database Connections:** Because Prisma establishes persistent TCP connections, horizontal scaling can exhaust PostgreSQL connection limits. In production, you must use a connection pooler (like `PgBouncer` or Prisma Accelerate).
*   **Bandwidth Offloading:** `.skillpkg` files can be megabytes in size. The Next.js API never serves these files directly. It generates a short-lived presigned URL and returns an HTTP 302 Redirect. The CLI then downloads the file directly from S3/R2, completely offloading bandwidth from the Node.js instances.

---

## 6. Runbook: Common Operations

### Deploying a Database Migration
```bash
# 1. Generate migration locally
npx prisma migrate dev --name add_allowlist_table

# 2. Commit the generated .sql file
git add prisma/migrations && git commit -m "chore: add allowlist"

# 3. In production, the CI runs:
npx prisma migrate deploy
```

### Rotating the JWT Secret
If the `JWT_SECRET` is compromised:
1.  Generate a new 64-character secure string.
2.  Update the environment variable in your hosting provider.
3.  Restart the Next.js application.
*Warning: This will instantly invalidate all existing CLI sessions. Users will need to run `skillspace login` again.*
