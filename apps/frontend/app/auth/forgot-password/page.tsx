'use client';

import Link from 'next/link';
import { AuthForm } from '@/frontend/auth/components/auth-form';

export default function ForgotPasswordPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <AuthForm
          type="forgot-password"
          title="Forgot password"
          description="Enter your email address and we'll send you a link to reset your password"
          onSubmit={async () => {}}
        >
          <div className="flex flex-col space-y-2 text-center text-sm">
            <div className="text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </AuthForm>
      </div>
    </div>
  );
} 