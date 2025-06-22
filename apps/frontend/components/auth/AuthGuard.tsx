"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingBar } from "@/components/ui/loading-bar";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectIfAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = false,
  redirectIfAuth = false,
  redirectTo = "/users",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (redirectIfAuth && isAuthenticated) {
      router.push(redirectTo);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    requireAuth,
    redirectIfAuth,
    redirectTo,
    router,
  ]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (redirectIfAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
