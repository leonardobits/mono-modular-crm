export const appConfig = {
  name: 'CRM System',
  description: 'A modern CRM system with WhatsApp integration',
  version: '1.0.0',
  defaultLocale: 'en',
  supportedLocales: ['en', 'pt-BR', 'es'] as const,
  defaultTheme: 'system',
  supportedThemes: ['light', 'dark', 'system'] as const,
  api: {
    timeout: 30000,
    retries: 3,
  },
  websocket: {
    reconnectAttempts: 5,
    reconnectInterval: 3000,
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
} as const;

export type AppConfig = typeof appConfig; 