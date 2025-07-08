# Instruções para Deploy no Render

## Problema Resolvido ✅

O erro `"not found"` nos arquivos `package.json` e `pnpm-workspace.yaml` foi resolvido com:

1. **Criação do `.dockerignore`** na raiz do projeto
2. **Novo `Dockerfile`** otimizado na raiz do projeto
3. **Correção do contexto do build**

## Configuração no Render

### Para o Backend (API)

1. **Criar novo Web Service**
2. **Configurações:**
   - **Name**: `mono-crm-backend`
   - **Runtime**: `Docker`
   - **Build Command**: (deixar vazio)
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `./` (raiz do projeto)
   - **Docker Build Args**:
     ```
     APP=backend
     ```

3. **Variáveis de Ambiente**:
   ```
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Health Check Path**: `/health`

### Para o Frontend (App)

1. **Criar novo Web Service**
2. **Configurações:**
   - **Name**: `mono-crm-frontend`
   - **Runtime**: `Docker`
   - **Build Command**: (deixar vazio)
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `./` (raiz do projeto)
   - **Docker Build Args**:
     ```
     APP=frontend
     ```

3. **Variáveis de Ambiente**:
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_API_URL=https://your-backend-url.render.com
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Comandos para Deploy Local (teste)

```bash
# Testar build do backend
docker build --build-arg APP=backend -t mono-crm-backend .

# Testar build do frontend
docker build --build-arg APP=frontend -t mono-crm-frontend .

# Executar backend localmente
docker run -p 3001:3001 mono-crm-backend

# Executar frontend localmente
docker run -p 3000:3000 mono-crm-frontend
```

## Mudanças Implementadas

### 1. Novo `.dockerignore`
- Exclui arquivos desnecessários do contexto do build
- Força inclusão dos arquivos essenciais (`package.json`, `pnpm-lock.yaml`, etc.)
- Reduz o tamanho do contexto do build

### 2. Dockerfile Otimizado
- Movido para a raiz do projeto (contexto correto)
- Criação explícita da estrutura de diretórios
- Cópia ordenada dos arquivos
- Multi-stage build otimizado para produção
- Health checks apropriados

### 3. Build Args
- `APP=backend` para buildar o backend
- `APP=frontend` para buildar o frontend
- Default é `backend` se não especificado

## Verificação

Após o deploy, verifique:

1. **Backend**: `https://your-backend-url.render.com/health`
2. **Frontend**: `https://your-frontend-url.render.com`

## Logs de Debug

Se ainda houver problemas, verifique:

1. **Build Logs** no Render Dashboard
2. **Runtime Logs** após o deploy
3. **Health Check Status**

## Monitoramento

O health check irá verificar:
- Backend: `GET /health` na porta 3001
- Frontend: `GET /` na porta 3000

Se o health check falhar, o Render irá reiniciar o serviço automaticamente. 