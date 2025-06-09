# Ambiente de Desenvolvimento com Docker

Guia para configurar e executar o projeto com Docker.

## 1. Configuração do Ambiente

Crie um arquivo docker/.env com o seguinte conteúdo:


# --- Variáveis do Banco de Dados PostgreSQL ---
POSTGRES_USER=SEU_USUARIO_POSTGRES
POSTGRES_PASSWORD=SUA_SENHA_FORTE_AQUI
POSTGRES_DB=SEU_BANCO_DE_DADOS

# --- Variáveis do Supabase ---
SUPABASE_ANON_KEY=COLOQUE_SUA_SUPABASE_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=COLOQUE_SUA_SUPABASE_SERVICE_ROLE_KEY_AQUI
SUPABASE_JWT_SECRET=COLOQUE_UM_JWT_SECRET_FORTE_AQUI
SUPABASE_URL=http://localhost:8000

# --- Variáveis da Aplicação ---
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}


## 2. Iniciando o Ambiente

Na raiz do projeto, execute: docker-compose -f docker/docker-compose.yml up --build

## 3. Acessando os Serviços

-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:3001](http://localhost:3001)
-   **Supabase Studio**: [http://localhost:54321](http://localhost:54321)
