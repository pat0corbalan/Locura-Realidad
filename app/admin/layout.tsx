// app/admin/layout.tsx
import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="md:ml-64">
        <main className="p-6 md:p-8" role="main" aria-label="Contenido principal">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}