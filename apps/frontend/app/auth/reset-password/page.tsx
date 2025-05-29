'use client';

import { useSearchParams } from 'next/navigation';
import { AuthForm } from '@/frontend/auth/components/auth-form';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Invalid or expired token
            </h1>
            <p className="text-sm text-muted-foreground">
              The password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <AuthForm
          type="reset-password"
          title="Reset password"
          description="Enter your new password below"
          onSubmit={async () => {}}
        />
      </div>
    </div>
  );
} 