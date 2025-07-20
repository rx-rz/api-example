FROM node:23-alpine AS base

RUN npm install -g pnpm

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build

FROM base AS runtime
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=build --chown=hono:nodejs /app/dist ./dist
COPY --from=build --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=hono:nodejs /app/package.json ./package.json

USER hono
EXPOSE 3000

CMD ["node", "dist/index.js"]