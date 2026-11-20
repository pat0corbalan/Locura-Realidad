"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Camera, Package, MapPin, LayoutDashboard, Menu, X, Ticket,
  LogOut, Images, ExternalLink, Music2,
} from "lucide-react";

const navigation = [
  { label: "Resumen", items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }] },
  { label: "Contenido", items: [
    { name: "Eventos y reservas", href: "/admin/reservas", icon: Ticket },
    { name: "Tours", href: "/admin/tours", icon: MapPin },
    { name: "Productos", href: "/admin/productos", icon: Package },
  ]},
  { label: "Multimedia", items: [
    { name: "Galería de fotos", href: "/admin/fotos", icon: Camera },
    { name: "Álbumes", href: "/admin/albums", icon: Images },
  ]},
];

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <>
      <button
        type="button"
        className="admin-mobile-toggle"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X size={19} /> : <Menu size={19} />}
      </button>

      <div className="admin-sidebar-backdrop" data-open={isOpen} onClick={() => setIsOpen(false)} />

      <aside className="admin-sidebar" data-open={isOpen}>
        <Link href="/admin" className="admin-brand" onClick={() => setIsOpen(false)}>
          <span className="admin-brand-mark"><Music2 size={22} strokeWidth={2.5} /></span>
          <span>
            <span className="admin-brand-name block">LOCURA <span className="text-red-400">&amp;</span> REALIDAD</span>
            <span className="admin-brand-sub block">Panel de administración</span>
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto" aria-label="Navegación del administrador">
          {navigation.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="admin-nav-label">{group.label}</p>
              {group.items.map((item) => {
                const active = item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="admin-nav-link"
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{item.name}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-red-400" />}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" target="_blank" rel="noreferrer" className="admin-nav-link mb-2">
            <ExternalLink size={16} />
            <span>Ver sitio web</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="admin-nav-link w-full text-left hover:!border-red-500/20 hover:!bg-red-500/10 hover:!text-red-300 disabled:opacity-50"
          >
            <LogOut size={16} />
            <span>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</span>
          </button>
          <div className="admin-profile mt-3">
            <div className="admin-profile-avatar">LR</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">Locura &amp; Realidad</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Administrador</p>
            </div>
            <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.5)]" />
          </div>
          <p className="px-2 pt-3 text-center text-[9px] tracking-[.16em] text-muted-foreground/60">ADMIN CONSOLE · V2.0</p>
        </div>
      </aside>
    </>
  );
}
