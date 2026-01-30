# Build stage
FROM node:25-alpine AS builder
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copy workspace config
COPY pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/convex/package.json ./packages/convex/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source files
COPY packages/shared ./packages/shared
COPY packages/convex ./packages/convex
COPY apps/web ./apps/web
COPY tsconfig.base.json ./

# Build arguments for environment
ARG VITE_CONVEX_URL
ARG VITE_APP_NAME
ARG VITE_BASE_URL
ARG VITE_USE_HASH_ROUTE

ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_USE_HASH_ROUTE=$VITE_USE_HASH_ROUTE

# Build packages first, then web
RUN pnpm --filter @despachante/shared build || true
RUN pnpm --filter @despachante/web build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Support dynamic PORT from Railway
RUN printf '#!/bin/sh\nif [ -n "$PORT" ]; then\n    sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/conf.d/default.conf\nfi\n' > /docker-entrypoint.d/99-dynamic-port.sh && \
    chmod +x /docker-entrypoint.d/99-dynamic-port.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
