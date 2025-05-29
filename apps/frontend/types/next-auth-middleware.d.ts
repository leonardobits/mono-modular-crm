import { NextRequest } from 'next/server';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/middleware' {
  interface NextAuthMiddlewareOptions {
    callbacks?: {
      authorized?: (params: { token: JWT | null; req: NextRequest }) => boolean;
    };
  }
} 