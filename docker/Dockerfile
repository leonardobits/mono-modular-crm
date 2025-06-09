# 1. Estágio Base: Instala pnpm e turbo
FROM node:20-slim AS base
WORKDIR /app
RUN npm install -g pnpm turbo

# 2. Estágio de Dependências: Instala as dependências do monorepo
FROM base AS deps
WORKDIR /app

# Copia os arquivos de manifesto de dependências
COPY package.json pnpm-lock.yaml .npmrc ./
COPY pnpm-workspace.yaml ./
COPY turbo.json ./

# Copia os package.json de cada app e package para otimizar o cache
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
# Adicione aqui outros packages se eles tiverem seus próprios package.json
# COPY packages/some-package/package.json ./packages/some-package/

# Instala todas as dependências usando pnpm
RUN pnpm install --frozen-lockfile

# 3. Estágio de Build: Constrói as aplicações com Turborepo
FROM base AS builder
WORKDIR /app

# Copia as dependências já instaladas do estágio 'deps'
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/.npmrc ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/turbo.json ./
COPY --from=deps /app/package.json ./

# Copia todo o código fonte
COPY . .

# Executa o build de todas as aplicações e pacotes
# O Turborepo irá paralelizar e cachear o processo
RUN turbo run build --filter=backend --filter=frontend

# 4. Estágio Final do Backend: Cria a imagem de produção do NestJS
FROM node:20-slim AS backend
WORKDIR /app

# Define o ambiente para produção
ENV NODE_ENV=production

# Copia as dependências de produção do estágio de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/package.json ./

# Copia os artefatos de build do backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

EXPOSE 3001
CMD ["pnpm", "--filter", "backend", "start:prod"]

# 5. Estágio Final do Frontend: Cria a imagem de produção do Next.js
FROM node:20-slim AS frontend
WORKDIR /app

# Define o ambiente para produção
ENV NODE_ENV=production

# Copia o package.json do app frontend
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/package.json ./

# Copia as dependências de produção
COPY --from=builder /app/node_modules ./node_modules

# Copia os artefatos de build do frontend
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
CMD ["pnpm", "--filter", "frontend", "start"] 