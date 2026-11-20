
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  Command,
  LayoutDashboard,
} from "lucide-react"

const sectionNames: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/albums": "Álbumes",
  "/admin/fotos": "Fotografías",
  "/admin/productos": "Productos",
  "/admin/reservas": "Reservas",
  "/admin/tours": "Tours y eventos",
}

export function AdminTopbar() {
  const pathname = usePathname()

  const currentSection =
    sectionNames[pathname] ||
    Object.entries(sectionNames).find(
      ([path]) => path !== "/admin" && pathname.startsWith(`${path}/`)
    )?.[1] ||
    "Administración"

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#080808]/85 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60">
          <LayoutDashboard size={17} />
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden text-white/35 sm:inline">
            Administración
          </span>

          <ChevronRight
            size={14}
            className="hidden text-white/20 sm:block"
          />

          <span className="truncate font-semibold text-white">
            {currentSection}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] text-white/45 md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          Panel de control
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-3.5 text-xs font-semibold text-white/75 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
        >
          Ver sitio
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </header>
  )
}

export default AdminTopbar
