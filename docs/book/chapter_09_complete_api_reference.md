# Chapter 9: Complete API Reference

This chapter details the Next.js Registry REST API. The API serves as the backbone for discovery, package distribution, and analytics. It is designed to be highly scalable, serving `.skillpkg` files indirectly via object storage to minimize Node.js thread blocking.

---

## 1. API Overview

*   **Base URL:** `https://registry.skillspace.dev` (or your local `http://localhost:3000`)
*   **Content Type:** `application/json` for requests and responses, except where binary uploads are involved.
*   **Rate Limiting:** Public endpoints are rate-limited to 100 requests per minute per IP.
*   **Authentication:** Requires a standard JWT passed in the `Authorization: Bearer <token>` header for protected routes.

---

## 2. Authentication Endpoints

### `POST /api/auth/login`
**Description:** Authenticates a user and issues a JWT.
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```
**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "uuid-123",
    "username": "developer1"
  }
}
```

### `GET /api/auth/me`
**Description:** Returns the currently authenticated user details based on the JWT.
**Authentication:** Required.
**Response (200 OK):** Returns the `User` object.

---

## 3. Package Management Endpoints

### `GET /api/packages/:name`
**Description:** Retrieves metadata for a package and its latest version.
**Authentication:** None.
**Response (200 OK):**
```json
{
  "id": "uuid-456",
  "name": "security-review",
  "type": "skill",
  "description": "Reviews code for OWASP top 10 vulnerabilities.",
  "owner": "developer1",
  "latestVersion": {
    "version": "2.1.0",
    "manifest": { ... },
    "publishedAt": "2026-06-08T10:00:00Z"
  }
}
```

### `GET /api/packages/:name/versions`
**Description:** Retrieves a list of all published versions for a specific package.
**Response (200 OK):**
```json
[
  { "version": "2.1.0", "publishedAt": "..." },
  { "version": "2.0.0", "publishedAt": "...", "deprecated": true }
]
```

### `GET /api/packages/:name/:version/download`
**Description:** Retrieves the `.skillpkg` tarball for local installation.
**Performance Note:** Rather than streaming the file directly through the Node.js API process, this endpoint returns an HTTP 302 Redirect to a short-lived presigned URL on S3/Cloudflare R2.
**Response:**
`302 Found` with `Location: https://s3.amazonaws.com/skillspace/...`

---

## 4. Publishing Endpoints

### `POST /api/packages`
**Description:** Validates and publishes a new package or a new version of an existing package.
**Authentication:** Required.
**Content-Type:** `multipart/form-data`
**Payload:**
*   `manifest`: The parsed JSON representation of the `skill.yaml`.
*   `tarball`: The binary `.skillpkg` file.

**Backend Logic:**
1.  Validates the `manifest` against `@skillspace/schema`.
2.  Checks ownership: if the package name exists, ensures the JWT user is the owner or part of the Organization.
3.  Uploads the `tarball` to S3 and receives the `storagePath`.
4.  Computes the `sha256` checksum of the buffer.
5.  Inserts a new `PackageVersion` row in PostgreSQL.

**Error Responses:**
*   `400 Bad Request`: Validation failure (e.g., invalid semver, invalid schema).
*   `403 Forbidden`: User does not have permission to publish under this namespace.
*   `409 Conflict`: This specific version number has already been published.

---

## 5. Discovery & Analytics Endpoints

### `GET /api/search`
**Description:** Full-text search for capabilities in the registry.
**Query Parameters:**
*   `q` (string, required): The search term.
*   `type` (string, optional): Filter by `skill`, `agent`, `mcp`.
*   `limit` (integer, optional): Default 20.

**Response (200 OK):**
```json
{
  "results": [
    {
      "name": "security-review",
      "description": "Reviews code...",
      "downloads": 1542,
      "verified": true
    }
  ]
}
```

### `POST /api/analytics/log`
**Description:** An endpoint used by the SkillSpace Runtime telemetry client to log execution metrics.
**Authentication:** Optional (can be anonymous or tied to a JWT).
**Payload:**
```json
{
  "packageId": "security-review",
  "version": "2.1.0",
  "modelId": "anthropic/claude-3-5-sonnet",
  "durationMs": 4500,
  "status": "success"
}
```
**Response:** `202 Accepted`
