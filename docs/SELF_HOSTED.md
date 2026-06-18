# Self-Hosting SkillSpace

SkillSpace is designed to be easily self-hostable. We provide a `docker-compose.yml` file that spins up the Registry, a PostgreSQL database, and MinIO for S3-compatible storage.

## Requirements

- Docker
- Docker Compose

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/skillspace/skillspace.git
   cd skillspace
   ```

2. Start the services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Initialize the database schema:
   ```bash
   # From your host machine where you have Node.js and pnpm installed
   pnpm install
   pnpm --filter @skillspace/database db:push
   ```
   *(Note: Alternatively, you can run the migration command directly inside a node container).*

4. Access the Registry:
   Open your browser and navigate to `http://localhost:3000`.

## Configuration

The default `docker-compose.yml` uses local development secrets. For a production deployment, you must update the following environment variables in `docker-compose.yml`:

- `BETTER_AUTH_SECRET`: Generate a secure random string (e.g., `openssl rand -hex 32`).
- `BETTER_AUTH_URL`: The public URL where your registry will be accessible.
- `NEXT_PUBLIC_APP_URL`: The public URL where your registry will be accessible.
- `POSTGRES_PASSWORD`: A strong password for the PostgreSQL database.
- `MINIO_ROOT_PASSWORD`: A strong password for the MinIO admin user.

### Connecting the CLI

To configure the `skillspace` CLI to use your self-hosted registry:

```bash
skillspace config set registry_url http://localhost:3000
```

You can verify your configuration by running `skillspace doctor`.
