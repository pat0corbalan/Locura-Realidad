"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, ShoppingBag, Users, ShoppingCart, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Tours", href: "/admin/tours", icon: Calendar },
  { name: "Productos", href: "/admin/products", icon: ShoppingBag },
  { name: "Reservas", href: "/admin/bookings", icon: Users },
  { name: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
  { name: "Configuración", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Locura y Realidad</h2>
        <p className="text-sm text-gray-600">Panel de Admin</p>
      </div>
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-red-100 text-red-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
