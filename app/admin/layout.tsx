import type React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Toaster } from "sonner";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminToken(token);

  if (!session) redirect("/login");

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
