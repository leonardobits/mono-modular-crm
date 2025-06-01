'use client';

import Link from 'next/link';
import { AuthForm } from '@/frontend/auth/components/auth-form';

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <AuthForm
          type="login"
          title="Welcome back"
          description="Enter your email to sign in to your account"
          onSubmit={async () => {}}
        >
          <div className="flex flex-col space-y-2 text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </AuthForm>
      </div>
    </div>
  );
} 