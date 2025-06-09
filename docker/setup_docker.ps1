# Define o conteúdo de cada arquivo em uma variável

$dockerfileContent = @"
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

# Instala todas as dependências usando pnpm
RUN pnpm install --frozen-lockfile

# 3. Estágio de Build: Constrói as aplicações com Turborepo
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY --from=deps /app/.npmrc ./
COPY --from=deps /app/pnpm-workspace.yaml ./
COPY --from=deps /app/turbo.json ./
COPY --from=deps /app/package.json ./
COPY . .

RUN turbo run build --filter=backend --filter=frontend

# 4. Estágio Final do Backend: Cria a imagem de produção do NestJS
FROM node:20-slim AS backend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
EXPOSE 3001
CMD ["pnpm", "--filter", "backend", "start:prod"]

# 5. Estágio Final do Frontend: Cria a imagem de produção do Next.js
FROM node:20-slim AS frontend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
EXPOSE 3000
CMD ["pnpm", "--filter", "frontend", "start"]
"@

$composeContent = @"
version: '3.8'

services:
  db:
    image: supabase/postgres:15.1.0.118
    restart: unless-stopped
    volumes:
      - ./supabase/db_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=\${POSTGRES_USER}
      - POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
      - POSTGRES_DB=\${POSTGRES_DB}
    networks:
      - supabase_network
    healthcheck:
      test: [ "CMD-SHELL", "pg_isready -U `$$`POSTGRES_USER -d `$$`POSTGRES_DB" ]
      interval: 10s
      timeout: 5s
      retries: 5

  auth:
    image: supabase/gotrue:v2.128.1
    restart: unless-stopped
    depends_on:
      db: { condition: service_healthy }
    environment:
      - GOTRUE_OPERATOR_TOKEN=\${SUPABASE_SERVICE_ROLE_KEY}
      - GOTRUE_DATABASE_URL=postgres://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}
      - GOTRUE_JWT_SECRET=\${SUPABASE_JWT_SECRET}
      - GOTRUE_SITE_URL=\${SUPABASE_URL}
      - GOTRUE_SMTP_HOST=mailhog
      - GOTRUE_SMTP_PORT=1025
    networks:
      - supabase_network

  rest:
    image: postgrest/postgrest:v11.2.2
    restart: unless-stopped
    depends_on:
      db: { condition: service_healthy }
    environment:
      - PGRST_DB_URI=postgres://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}
      - PGRST_DB_SCHEMAS=public,storage
      - PGRST_DB_ANON_ROLE=\${SUPABASE_ANON_KEY}
      - PGRST_JWT_SECRET=\${SUPABASE_JWT_SECRET}
    networks:
      - supabase_network

  studio:
    image: supabase/studio:20240112
    restart: unless-stopped
    ports: [ "54321:54321" ]
    environment:
      - SUPABASE_URL=http://localhost:8000
      - SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_DB_HOST=db
      - SUPABASE_DB_USER=\${POSTGRES_USER}
      - SUPABASE_DB_PASSWORD=\${POSTGRES_PASSWORD}
    networks:
      - supabase_network

  mailhog:
    image: mailhog/mailhog
    ports: [ "8025:8025" ]
    networks:
      - supabase_network

  backend:
    build:
      context: ..
      dockerfile: Dockerfile
      target: backend
    ports: [ "3001:3001" ]
    env_file: [ .env ]
    depends_on:
      db: { condition: service_healthy }
    networks:
      - supabase_network

  frontend:
    build:
      context: ..
      dockerfile: Dockerfile
      target: frontend
    ports: [ "3000:3000" ]
    env_file: [ .env ]
    depends_on: [ backend ]
    networks:
      - supabase_network

networks:
  supabase_network:
    driver: bridge
"@

$readmeContent = @"
# Ambiente de Desenvolvimento com Docker

Guia para configurar e executar o projeto com Docker.

## 1. Configuração do Ambiente

Crie um arquivo `docker/.env` com o seguinte conteúdo:

`
# --- Variáveis do Banco de Dados PostgreSQL ---
POSTGRES_USER=supabase
POSTGRES_PASSWORD=thisIsASecurePassword123
POSTGRES_DB=postgres

# --- Variáveis do Supabase ---
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.M--ACd9B9x-Xfsgh3bC1hXhr3pkKO4_1j4T-QSP_d-w
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
SUPABASE_URL=http://localhost:8000

# --- Variáveis da Aplicação ---
DATABASE_URL="postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@db:5432/\${POSTGRES_DB}"
NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_ANON_KEY}
`

## 2. Iniciando o Ambiente

Na raiz do projeto, execute: `docker-compose -f docker/docker-compose.yml up --build`

## 3. Acessando os Serviços

-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:3001](http://localhost:3001)
-   **Supabase Studio**: [http://localhost:54321](http://localhost:54321)
"@

# Cria os arquivos
Set-Content -Path "Dockerfile" -Value $dockerfileContent
Set-Content -Path "docker/docker-compose.yml" -Value $composeContent
Set-Content -Path "docker/README.md" -Value $readmeContent

Write-Output "Arquivos Docker criados com sucesso." 