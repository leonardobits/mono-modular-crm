# 🚀 Mono Modular CRM

Um CRM moderno e modular construído com arquitetura monorepo, permitindo escalabilidade e manutenção simplificada.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [PNPM](https://pnpm.io/) (versão 10.8.0 ou superior)

## ⚠️ Aviso sobre Docker

> **Atenção:** As configurações de Docker deste projeto ainda estão em fase de desenvolvimento e ajustes. Isso significa que podem ocorrer erros ou comportamentos inesperados ao utilizar os containers neste momento.
>
> Estamos trabalhando para garantir uma experiência estável e padronizada em ambientes Docker, mas recomendamos, por enquanto, que utilize o ambiente local para desenvolvimento sempre que possível.
>
> Assim que a configuração estiver madura, este aviso será removido e a documentação será atualizada com instruções detalhadas para uso em produção e desenvolvimento via Docker.

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

### Desenvolvimento

Para iniciar o ambiente de desenvolvimento, usamos o Turborepo para gerenciar o monorepo. Você pode usar qualquer um dos comandos a seguir:

```bash
# Inicia todos os serviços em modo de desenvolvimento
pnpm dev

# O comando acima é um atalho para:
pnpm turbo dev

# Para iniciar apenas o backend:
pnpm backend:dev
```

### Build

Para criar builds de produção:

```bash
# Build de todos os serviços
pnpm build

# Build apenas do backend
pnpm backend:build
```

## 📦 Scripts Disponíveis

- `pnpm dev` - Inicia o ambiente de desenvolvimento
- `pnpm build` - Cria builds de produção
- `pnpm lint` - Executa a verificação de código
- `pnpm format` - Formata o código usando Prettier
- `pnpm clean` - Limpa os arquivos de build e node_modules
- `pnpm backend:dev` - Inicia apenas o backend em modo de desenvolvimento
- `pnpm backend:build` - Cria build apenas do backend

## 🏗️ Estrutura do Projeto

```
mono-modular-crm/
├── apps/           # Aplicações principais
├── packages/       # Pacotes compartilhados
└── package.json    # Configuração principal
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request
