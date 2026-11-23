# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

FROM base AS build
RUN --mount=type=cache,target=/root/.npm npm ci -w @acme/shared -w @acme/api --include-workspace-root --ignore-scripts
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @acme/shared && npm run build -w @acme/api

FROM base AS prod-deps
RUN --mount=type=cache,target=/root/.npm npm ci -w @acme/shared -w @acme/api --omit=dev --ignore-scripts

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/package.json packages/shared/
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/dist apps/api/dist
COPY apps/api/migrations apps/api/migrations
USER node
EXPOSE 3001
CMD ["node", "--enable-source-maps", "apps/api/dist/main.js"]
