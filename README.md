# 🧹 Hono API Backend — Modular, Typed, and Scalable

This is a structured, TypeScript-first API backend built on [Hono](https://hono.dev). It embraces clarity, modular design, and practical tooling — ideal for teams or solo devs building real-world backends.

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

---

## 🗂️ Project Structure

```
src/
├── api/                  # Modular route definitions
│   ├── auth/             # Auth-specific routes, services, handlers
│   ├── storage/          # R2 upload/download endpoints
│   └── middleware/       # Custom Hono middleware
├── cache/                # Redis client
├── db/                   # Drizzle schema + instance
├── domain/               # Business domain types (decoupled from DB)
├── lib/                  # Common helpers (auth, env, logger)
├── rate-limiter/         # Redis-backed limiter logic
├── utils/                # Route/URL utils
└── index.ts              # Entry point
```

> **Domain Layer** abstracts the database types:
> You map raw `drizzle-orm` values into safe business representations.

---

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

---

## 📁 Environment Setup

```env
PORT=8000
DATABASE_URL=postgres://...
REDIS_URL=redis://...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_BUCKET_NAME=...
CLOUDFLARE_ACCESS_KEY_ID=...
CLOUDFLARE_SECRET_ACCESS_KEY=...
```

---

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
export const getReservedUsernameInDB = async ({ username }) => { ... };
export const insertReservedUsernameInDB = async ({ username, reservationToken }) => { ... };
export const updateReservedUsernameInDB = async ({ username, reservationToken }) => { ... };
```

This decouples domain logic from your DB — change your DB schema freely while keeping the rest of the app stable.

---

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

---

## 🔬 Testing Setup

Uses:

* [`vitest`](https://vitest.dev) — fast, Vite-native test runner
* [`@vitest/coverage-v8`](https://vitest.dev/guide/coverage.html) — coverage via native V8
* [`testcontainers`](https://www.testcontainers.org/) — spin up isolated PostgreSQL and Redis for full E2E tests

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

---

## ✅ Conventions

### 1. **Request Validation**

Always validate user input using `zod` before it hits your services.

```ts
const schema = z.object({ username: z.string().min(3) });
const parsed = schema.parse(c.req.valid("form"));
```

### 2. **Typed Function Signatures**

Use destructured objects for all service and DB function parameters:

```ts
export const reserveUsername = async ({ username, reservationToken }: { username: string; reservationToken: string }) => { ... };
```

### 3. **JSend Responses**

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

### 4. **Domain > Repository > Service**

Every feature should follow this split:

* **Domain** = type definitions for business logic
* **Repository** = raw DB queries
* **Service** = high-level business actions

### 5. **Error Handling**

Use `http-errors-enhanced` for rich error metadata and control flow.

```ts
import { Unauthorized } from "http-errors-enhanced";
throw new Unauthorized("Invalid credentials");
```

---

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

---

## ✉️ Contact

Temiloluwa — [@temi\_codes](https://twitter.com/temi_codes)
# api-example
