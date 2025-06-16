"use client";

// TODO: A proteção de rota foi desativada para fins de teste.
// Descomente o código abaixo quando a autenticação do backend estiver funcional.

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface AdminRouteGuardProps {
  children: ReactNode;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsChecking(false);
      
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (user && !['ADMIN', 'MANAGER'].includes(user.role)) {
        router.push("/login");
        return;
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default AdminRouteGuard; 