# 🚀 Mono Modular CRM

Um CRM moderno e modular construído com arquitetura monorepo, permitindo escalabilidade e manutenção simplificada.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (v20.18.1 ou superior)
- [PNPM](https://pnpm.io/) (v10.8.2 ou superior)

> **Nota:** Se você ainda não tem o PNPM instalado, pode instalá-lo globalmente com:
>
> ```bash
> npm install -g pnpm@10.8.2
> ```

## ⚠️ Aviso sobre Docker

> **Atenção:** As configurações de Docker estão em desenvolvimento. Recomendamos usar o ambiente local para desenvolvimento até que a configuração esteja estável.

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone https://github.com/leonardobits/mono-modular-crm
cd mono-modular-crm
```

2. Instale as dependências:

```bash
pnpm install
```

3. Compile os schemas Zod, que são essenciais para o projeto:

```bash
pnpm --filter zod-schemas build
```

## 🚀 Como Executar

**Importante:** Antes de executar, copie o arquivo `.env.example` para `.env` e configure as variáveis necessárias:

```bash
cp .env.example .env
```

> ⚠️ As variáveis de ambiente contêm informações sensíveis e particulares do projeto. Não compartilhe seu arquivo `.env` e mantenha-o seguro.

### Desenvolvimento

Para iniciar o ambiente de desenvolvimento, usamos o Turborepo para gerenciar o monorepo. Você pode usar qualquer um dos comandos a seguir:

```bash
# Inicia todos os serviços em modo de desenvolvimento
pnpm dev

# O comando acima é um atalho para:
pnpm turbo dev
```

### Build

Para criar builds de produção:

```bash
pnpm build
```

## 🏗️ Estrutura do Projeto

```
mono-modular-crm/
├── apps/
│   ├── backend/    # API REST e serviços do backend
│   ├── frontend/   # Interface do usuário
│   └── supabase/   # Configurações e migrations do Supabase
├── packages/       # Pacotes compartilhados
└── package.json    # Configuração principal
```
