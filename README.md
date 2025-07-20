# 🧹 Hono API Backend Template

This is a structured, TypeScript-first API backend built on [Hono](https://hono.dev).

## ✨ Highlights

  * ⚡️ Lightweight [Hono](https://hono.dev) router (Express-like, super fast)
  * 🧾 [JSend](https://github.com/omniti-labs/jsend) spec for consistent API responses
  * 🧠 [Zod](https://zod.dev) for validation
  * 🔐 [BetterAuth](https://github.com/theodo/better-auth) (modular auth flows) + Drizzle adapter
  * 🗃️ PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)
  * ☁️ Cloudflare R2 (S3-compatible) for file uploads
  * 🧱 Redis-backed rate limiting via [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible)
  * 🪵 [Pino](https://getpino.io) logging (with `pino-pretty` in dev)
  * 🔍 [Vitest](https://vitest.dev) + [Testcontainers](https://www.testcontainers.org/) for test automation

-----

## 🛠️ Setup

Follow these steps to get the API backend running locally:

### 1\. **Prerequisites**

Make sure you have the following installed:

  * **Node.js**: LTS version recommended.
  * **pnpm**: For package management. If you don't have it, install with `npm install -g pnpm`.
  * **Docker**: Required to run PostgreSQL and Redis containers.

### 2\. **Clone the Repository**

```bash
git clone <your-repository-url>
cd api-backend # Or whatever your project folder is named
```

### 3\. **Install Dependencies**

Install all project dependencies using pnpm:

```bash
pnpm install
```

### 4\. **Environment Configuration**

Create a `.env.development` file in the root of the project, next to `compose.yml`. This file will contain your environment variables. Here's an example structure:

```env
PORT=8000
DATABASE_URL="postgresql://api_example_user:api_example_password@localhost:5433/zya"
REDIS_URL="redis://localhost:6379"

# Cloudflare R2 (S3-compatible) credentials
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_BUCKET_NAME="your_cloudflare_bucket_name"
CLOUDFLARE_ACCESS_KEY_ID="your_cloudflare_access_key_id"
CLOUDFLARE_SECRET_ACCESS_KEY="your_cloudflare_secret_access_key"

# BetterAuth secret (generate a strong, random string)
AUTH_SECRET="a_very_secret_key_for_auth"
```

  * **`DATABASE_URL`**: This URL connects to your PostgreSQL database. The credentials `api_example_user` and `api_example_password` match the Docker Compose setup.
  * **`AUTH_SECRET`**: Important for BetterAuth. Generate a strong, random string for production.

### 5\. **Start Docker Containers**

Use Docker Compose to spin up the PostgreSQL and Redis services. These are essential for the application to run.

```bash
docker-compose -f compose.yml up -d
```

This command starts the containers in detached mode (`-d`). You can check their status with `docker-compose -f compose.yml ps`.

### 6\. **Run Database Migrations**

Once your PostgreSQL container is up, apply the database migrations to set up the schema:

```bash
pnpm db:migrate
```

### 7\. **Start the Development Server**

You can now start the API backend in development mode:

```bash
pnpm dev
```

The API should now be running on `http://localhost:8000` (or the `PORT` you configured in `.env.development`).

-----

## 🗂️ Project Structure

```
src/
├── api/                  # Modular route definitions
│   ├── auth/             # Auth-specific routes, services, handlers
│   ├── storage/          # R2 upload/download endpoints
│   └── middleware/       # Custom Hono middleware
├── cache/                # Redis client
├── db/                   # Drizzle schema + instance
├── domain/               # Business domain types (decoupled from DB)
├── lib/                  # Common helpers (auth, env, logger)
├── rate-limiter/         # Redis-backed limiter logic
├── utils/                # Route/URL utils
└── index.ts              # Entry point
```

> **Domain Layer** abstracts the database types:
> You map raw `drizzle-orm` values into safe business representations.

-----

## 🚀 Scripts

```json
"dev": "tsx watch src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"db:generate": "pnpm drizzle-kit generate",
"db:migrate": "pnpm drizzle-kit migrate",
"db:studio": "pnpm drizzle-kit studio",
"test": "vitest",
"test:watch": "vitest --watch",
"test:coverage": "vitest --coverage"
```

-----

## 📁 Environment Setup

```env
PORT=8000
DATABASE_URL=postgres://...
REDIS_URL=redis://...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
AUTH_SECRET=...
```

-----

## 📃 Reserved Username Flow

> `domain/reserved-username.domain.ts`

```ts
export type ReservedUsername = {
  username: string;
  reservedAt: Date;
  reservationToken: string;
};
```

> `db/reserved-username.repository.ts`

```ts
export const getReservedUsernameInDB = async ({ username }) => { /* ... */ };
export const insertReservedUsernameInDB = async ({ username, reservationToken }) => { /* ... */ };
export const updateReservedUsernameInDB = async ({ username, reservationToken }) => { /* ... */ };
```

This decouples domain logic from your DB — change your DB schema freely while keeping the rest of the app stable.

-----

## 📦 Cloudflare R2 Presigned Uploads

Example service:

```ts
export const getPresignedUploadUrlService = ({ key, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(storageClient, command, { expiresIn: 3600 });
};
```

Use like:

```json
{
  "key": "/profile-pics/abc.jpg",
  "contentType": "image/jpeg"
}
```

-----

## 🔬 Testing Setup

Uses:

  * [`vitest`](https://www.google.com/search?q=%5Bhttps://vitest.dev%5D\(https://vitest.dev\)) — fast, Vite-native test runner
  * [`@vitest/coverage-v8`](https://www.google.com/search?q=%5Bhttps://vitest.dev/guide/coverage.html%5D\(https://vitest.dev/guide/coverage.html\)) — coverage via native V8
  * [`testcontainers`](https://www.google.com/search?q=%5Bhttps://www.testcontainers.org/%5D\(https://www.testcontainers.org/\)) — spin up isolated PostgreSQL and Redis for full E2E tests

> `vitest.config.ts`

```ts
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
    },
  },
});
```

Example test:

```ts
describe("GET /health", () => {
  it("returns 200", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });
});
```

-----

## ✅ Conventions

### 1\. **Request Validation**

Always validate user input using `zod` before it hits your services.

```ts
const schema = z.object({ username: z.string().min(3) });
const parsed = schema.parse(c.req.valid("form"));
```

### 2\. **Typed Function Signatures**

Use destructured objects for all service and DB function parameters:

```ts
export const reserveUsername = async ({ username, reservationToken }: { username: string; reservationToken: string }) => { /* ... */ };
```

### 3\. **JSend Responses**

Follow the JSend format:

```json
{
  "status": "success",
  "data": { "user": { "id": 1 } }
}
```

```json
{
  "status": "fail",
  "data": { "username": "already taken" }
}
```

```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

### 4\. **Domain \> Repository \> Service \> Handler \> Routes**

Every feature should follow this split:

  * **Domain** = type definitions for business logic
  * **Repository** = raw DB queries
  * **Service** = high-level business actions
  * **Handler** = http handlers
  * **Routes** = http routes

### 5\. **Error Handling**

Use `http-errors-enhanced` for rich error metadata and control flow.

```ts
import { Unauthorized } from "http-errors-enhanced";
throw new Unauthorized("Invalid credentials");
```

-----

## 🔗 Useful Links

  * [Hono](https://hono.dev)
  * [BetterAuth](https://www.npmjs.com/package/better-auth)
  * [Drizzle ORM](https://orm.drizzle.team)
  * [Zod](https://zod.dev)
  * [JSend Spec](https://github.com/omniti-labs/jsend)
  * [Vitest](https://vitest.dev)
  * [Testcontainers](https://www.testcontainers.org/)
  * [Cloudflare R2](https://developers.cloudflare.com/r2/)
  * [Pino](https://getpino.io)

-----

## ✉️ Contact

Twitter — [@rxrz](https://twitter.com/_rxrz)