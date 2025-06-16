"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import AdminRouteGuard from "@/components/guards/AdminRouteGuard";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminRouteGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </AdminRouteGuard>
    </AuthProvider>
  );
} 