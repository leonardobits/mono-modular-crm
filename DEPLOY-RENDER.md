# 🚀 Deploy no Render - Mono Modular CRM

## 🔧 Problema Resolvido ✅

O erro `"not found"` nos arquivos `package.json` e `pnpm-workspace.yaml` foi corrigido:

1. ✅ **Dockerfile otimizado** movido para a raiz do projeto
2. ✅ **`.dockerignore` simplificado** para incluir arquivos essenciais
3. ✅ **Contexto do build corrigido** para encontrar todos os arquivos necessários
4. ✅ **Push realizado** - commit `e088747` disponível no repositório

## 🛠️ Configuração no Render

### 📊 Backend (API NestJS)

1. **Criar Web Service**:
   - **Name**: `mono-crm-backend`
   - **Runtime**: `Docker`
   - **Branch**: `main`
   - **Build Command**: *(deixar vazio)*
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `./` (raiz do projeto)

2. **Build Arguments**:
   ```
   APP=backend
   ```

3. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   
   # Supabase
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_KEY=sua_chave_servico
   
   # JWT
   JWT_SECRET=sua_chave_jwt_secreta
   ```

4. **Health Check Path**: `/health`

### 🌐 Frontend (Next.js)

1. **Criar Web Service**:
   - **Name**: `mono-crm-frontend`
   - **Runtime**: `Docker`
   - **Branch**: `main`
   - **Build Command**: *(deixar vazio)*
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `./` (raiz do projeto)

2. **Build Arguments**:
   ```
   APP=frontend
   ```

3. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3000
   
   # API
   NEXT_PUBLIC_API_URL=https://mono-crm-backend.onrender.com
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

## 🧪 Teste Local

Para testar o build localmente:

```bash
# Backend
docker build --build-arg APP=backend -t mono-crm-backend .
docker run -p 3001:3001 mono-crm-backend

# Frontend
docker build --build-arg APP=frontend -t mono-crm-frontend .
docker run -p 3000:3000 mono-crm-frontend
```

## 📝 Estrutura do Dockerfile

```dockerfile
# Multi-stage build otimizado
FROM node:20-alpine AS base
# ... instalar dependências e buildar

FROM node:20-alpine AS backend-prod
# ... preparar produção backend

FROM node:20-alpine AS frontend-prod
# ... preparar produção frontend

FROM final-${APP} AS final
# ... escolher app baseado no build arg
```

## 🔍 Verificação

Após o deploy:

1. **Backend**: `https://mono-crm-backend.onrender.com/health`
2. **Frontend**: `https://mono-crm-frontend.onrender.com`

## 🐛 Troubleshooting

### Se o build falhar:

1. **Verificar logs** no Render Dashboard
2. **Confirmar build args** estão configurados corretamente
3. **Verificar environment variables** estão definidas
4. **Dockerfile Path** deve ser `./Dockerfile`
5. **Docker Context** deve ser `./`

### Se o health check falhar:

1. **Backend**: Verificar endpoint `/health` existe
2. **Frontend**: Verificar se a porta 3000 está respondendo
3. **Logs**: Verificar runtime logs no Render

## 📊 Monitoramento

O health check verifica:
- **Backend**: `GET /health` na porta 3001
- **Frontend**: `GET /` na porta 3000

Se falhar, o Render reinicia automaticamente o serviço.

## 🔄 Próximos Passos

1. **Criar os dois serviços** no Render
2. **Configurar as variáveis de ambiente** 
3. **Aguardar o build** (pode demorar alguns minutos)
4. **Verificar os health checks**
5. **Testar as aplicações**

## 🎯 Resultado Esperado

- **Backend**: API funcionando em `https://mono-crm-backend.onrender.com`
- **Frontend**: App funcionando em `https://mono-crm-frontend.onrender.com`
- **Health checks**: Ambos verdes no dashboard
- **Logs**: Sem erros de runtime

---

🚀 **Pronto para deployment!** As correções foram aplicadas e o código está no repositório. 