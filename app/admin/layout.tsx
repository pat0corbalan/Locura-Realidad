import type React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Toaster } from "sonner";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth";
import "./globals.css";

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
    <div className="admin-shell dark min-h-screen">
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <main className="admin-content" role="main" aria-label="Contenido principal">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  );
}
