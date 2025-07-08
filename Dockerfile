# Multi-stage Dockerfile para deployment no Render
# Suporta tanto o frontend Next.js quanto o backend NestJS
# Use build argument APP para especificar qual serviço buildar: frontend ou backend

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl
RUN corepack enable

# Instalar turbo globalmente
RUN npm install -g turbo

WORKDIR /app

# Copiar arquivos de configuração da raiz
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Criar estrutura de diretórios
RUN mkdir -p apps/backend apps/frontend packages/zod-schemas

# Copiar package.json de todos os apps e packages
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/zod-schemas/package.json ./packages/zod-schemas/

# Instalar TODAS as dependências (incluindo dev) para o build
RUN pnpm install --frozen-lockfile

# Copiar todo o código fonte
COPY . .

# Build argument para especificar qual app buildar
ARG APP=backend
ENV APP=${APP}

# Buildar o app especificado
RUN turbo run build --filter=${APP}

# Estágio de produção para backend
FROM node:20-alpine AS backend-prod
RUN apk add --no-cache libc6-compat curl
RUN corepack enable

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Criar estrutura de diretórios
RUN mkdir -p apps/backend packages/zod-schemas

# Copiar package.json necessários
COPY apps/backend/package.json ./apps/backend/
COPY packages/zod-schemas/package.json ./packages/zod-schemas/

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar backend buildado
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/packages/zod-schemas/dist ./packages/zod-schemas/dist

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Usar node diretamente para melhor performance
CMD ["node", "apps/backend/dist/main"]

# Estágio de produção para frontend
FROM node:20-alpine AS frontend-prod
RUN apk add --no-cache libc6-compat curl
RUN corepack enable

WORKDIR /app

# Copiar arquivos de configuração
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Criar estrutura de diretórios
RUN mkdir -p apps/frontend packages/zod-schemas

# Copiar package.json necessários
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/zod-schemas/package.json ./packages/zod-schemas/

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar frontend buildado
COPY --from=base /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=base /app/apps/frontend/public ./apps/frontend/public
COPY --from=base /app/apps/frontend/next.config.js ./apps/frontend/
COPY --from=base /app/apps/frontend/next.config.ts ./apps/frontend/
COPY --from=base /app/packages/zod-schemas/dist ./packages/zod-schemas/dist

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "--filter", "frontend", "start"]

# Estágio final usando argumentos condicionais simples
ARG APP=backend

# Usar backend como padrão
FROM backend-prod AS final

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD if [ "${APP}" = "frontend" ]; then \
        curl -f http://localhost:3000 || exit 1; \
      else \
        curl -f http://localhost:3001/health || exit 1; \
      fi 