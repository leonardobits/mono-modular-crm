# Multi-stage Dockerfile for Render deployment
# Supports both Next.js frontend and NestJS backend
# Use build argument APP to specify which service to build: frontend or backend

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable

# Install turbo globally
RUN npm install -g turbo

WORKDIR /app

# Copy root package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for all apps and packages
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/*/package.json ./packages/*/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build argument to specify which app to build
ARG APP
ENV APP=${APP}

# Build the specified app
RUN turbo run build --filter=${APP}

# Production stage for backend
FROM node:20-alpine AS backend-prod
RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built backend
COPY --from=base /app/apps/backend/dist ./apps/backend/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Use node directly for better performance
CMD ["node", "apps/backend/dist/main"]

# Production stage for frontend
FROM node:20-alpine AS frontend-prod
RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built frontend
COPY --from=base /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=base /app/apps/frontend/public ./apps/frontend/public
COPY --from=base /app/apps/frontend/package.json ./apps/frontend/

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "--filter", "frontend", "start"]

# Final stage - dynamically choose based on APP argument
FROM backend-prod AS final-backend
FROM frontend-prod AS final-frontend

# Default to backend if no APP specified
FROM final-${APP:-backend} AS final

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD if [ "${APP}" = "frontend" ]; then \
        curl -f http://localhost:3000/api/health || exit 1; \
      else \
        curl -f http://localhost:3001/health || exit 1; \
      fi