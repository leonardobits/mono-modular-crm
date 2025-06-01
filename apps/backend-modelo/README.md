# CRM Backend

This is the backend service for the CRM application, built with NestJS and TypeORM.

## Features

- Authentication with JWT
- Multitenancy support
- User management
- Conversation management
- WhatsApp integration via Evolution API
- WebSocket support for real-time updates

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- pnpm

## Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE crm;
```

2. Create a `.env` file in the root directory with the following content:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crm
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1d
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key
```

3. Install dependencies:
```bash
pnpm install
```

4. Start the development server:
```bash
pnpm start:dev
```

## API Endpoints

### Authentication
- POST `/auth/login` - Login with email and password

### Users
- GET `/users` - Get all users
- GET `/users/:id` - Get user by ID
- POST `/users` - Create new user
- PATCH `/users/:id` - Update user
- DELETE `/users/:id` - Delete user

### Tenants
- GET `/tenants` - Get all tenants
- GET `/tenants/:id` - Get tenant by ID
- POST `/tenants` - Create new tenant
- PATCH `/tenants/:id` - Update tenant
- DELETE `/tenants/:id` - Delete tenant

### Inboxes
- GET `/inboxes` - Get all inboxes
- GET `/inboxes/:id` - Get inbox by ID
- POST `/inboxes` - Create new inbox
- PATCH `/inboxes/:id` - Update inbox
- DELETE `/inboxes/:id` - Delete inbox

### Conversations
- GET `/conversations` - Get all conversations
- GET `/conversations/:id` - Get conversation by ID
- POST `/conversations` - Create new conversation
- PATCH `/conversations/:id` - Update conversation
- DELETE `/conversations/:id` - Delete conversation

## WebSocket Events

The application uses WebSocket for real-time updates. Connect to `ws://localhost:3000` to receive events.

### Events
- `message:new` - New message received
- `conversation:status` - Conversation status update
- `whatsapp:status` - WhatsApp connection status update 