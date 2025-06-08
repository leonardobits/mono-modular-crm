"use client";

// TODO: A proteção de rota foi desativada para fins de teste.
// Descomente o código abaixo quando a autenticação do backend estiver funcional.

import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface AdminRouteGuardProps {
  children: ReactNode;
}

const AdminRouteGuard = ({ children }: AdminRouteGuardProps) => {
  // const { user, isAuthenticated } = useAuth();
  // const router = useRouter();
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   // Prevent flicker by waiting for auth state to be confirmed
  //   if (isAuthenticated !== null) {
  //     setIsLoading(false);
  //   }

  //   if (!isAuthenticated) {
  //     router.push("/login");
  //     return;
  //   }

  //   if (user?.role !== "admin") {
  //     router.push("/unauthorized"); // Or some other page
  //     return;
  //   }
  // }, [user, isAuthenticated, router]);

  // if (isLoading || !isAuthenticated || user?.role !== "admin") {
  //   // You can return a loader component here
  //   return <div>Loading...</div>;
  // }

  return <>{children}</>;
};

export default AdminRouteGuard; 