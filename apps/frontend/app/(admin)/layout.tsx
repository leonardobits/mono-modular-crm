"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { InboxProvider } from "@/contexts/InboxContext";
import { AppSidebar } from "@/components/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <InboxProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </InboxProvider>
    </AuthProvider>
  );
}
