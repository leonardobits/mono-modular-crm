# Ambiente de Desenvolvimento com Docker

Guia para configurar e executar o projeto com Docker.

## 1. Configuração do Ambiente

Crie um arquivo docker/.env com o seguinte conteúdo:


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
DATABASE_URL="postgresql://\:\@db:5432/\"
NEXT_PUBLIC_SUPABASE_URL=\
NEXT_PUBLIC_SUPABASE_ANON_KEY=\


## 2. Iniciando o Ambiente

Na raiz do projeto, execute: docker-compose -f docker/docker-compose.yml up --build

## 3. Acessando os Serviços

-   **Frontend**: [http://localhost:3000](http://localhost:3000)
-   **Backend**: [http://localhost:3001](http://localhost:3001)
-   **Supabase Studio**: [http://localhost:54321](http://localhost:54321)
