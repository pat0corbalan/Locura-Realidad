"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Camera, 
  Package, 
  MapPin, 
  Users, 
  LayoutDashboard, 
  Menu, 
  X, 
  Ticket,
  LogOut
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    // Esta es la nueva sección para gestionar lo que llega del Modal
    name: "Eventos", 
    href: "/admin/reservas",
    icon: Ticket,
  },
  {
    name: "Fotos",
    href: "/admin/fotos",
    icon: Camera,
  },
  {
    name: "Productos",
    href: "/admin/productos",
    icon: Package,
  },
  {
    name: "Tours",
    href: "/admin/tours",
    icon: MapPin,
  },
  {
    name: "Album",
    href: "/admin/albums",
    icon: Users,
  },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } finally {
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-card text-card-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="h-full flex flex-col bg-background"> {/* Cambié container por un div flex para mejor control */}
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-foreground text-rock-shadow">
              Locura{" "}
              <span
                className="text-black"
                style={{
                  textShadow:
                    "0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 40px #ff0000",
                }}
              >
                &amp;
              </span>{" "}
              Realidad
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-primary-foreground" : "text-primary")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-3 border-t border-sidebar-border bg-card/30 p-4">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
            <p className="text-center text-xs font-medium text-muted-foreground">
              Locura & Realidad Admin v1.2
            </p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}
    </>
  )
}