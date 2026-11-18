"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingCart, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

interface AddedDetail {
  name: string
  option?: string
}

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

/**
 * - Botón flotante con cantidad y total: visible apenas hay algo en el carrito.
 * - Aviso "Agregado al carrito" con botón "Ver carrito" cada vez que se agrega algo.
 *
 * Escucha el evento "cart:added" que dispara CartPageContent.
 */
export function CartFloatingButton({ onOpen }: { onOpen: () => void }) {
  const { state } = useCart()
  const [toast, setToast] = useState<AddedDetail | null>(null)
  const [bump, setBump] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const bumpTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const onAdded = (e: Event) => {
      setToast((e as CustomEvent<AddedDetail>).detail)
      setBump(true)

      clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setToast(null), 5000)
      clearTimeout(bumpTimer.current)
      bumpTimer.current = setTimeout(() => setBump(false), 350)
    }

    window.addEventListener("cart:added", onAdded)
    return () => {
      window.removeEventListener("cart:added", onAdded)
      clearTimeout(toastTimer.current)
      clearTimeout(bumpTimer.current)
    }
  }, [])

  const handleOpen = () => {
    setToast(null)
    onOpen()
  }

  const count = state.itemCount

  return (
    <>
      {/* Aviso (abajo, centrado): por encima de los diálogos para que se vea al agregar desde el detalle */}
      {toast && (
        <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-[1100] w-[min(20rem,calc(100vw-2.5rem))] -translate-x-1/2">
          <div
            role="status"
            className="rounded-xl border border-primary/40 bg-card p-3 shadow-2xl duration-300 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Agregado al carrito
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {toast.name}
                  {toast.option ? ` · ${toast.option}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Cerrar aviso"
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <Button size="sm" className="mt-3 w-full" onClick={handleOpen}>
              Ver carrito ({count})
            </Button>
          </div>
        </div>
      )}

      {/* Botón flotante (abajo, centrado: libre del reproductor de Spotify y de WhatsApp) */}
      {count > 0 && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label={`Abrir carrito, ${count} ${count === 1 ? "artículo" : "artículos"}, total ${priceFormatter.format(state.total)}`}
          className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-primary py-3 pl-4 pr-5 text-primary-foreground shadow-lg transition-transform duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:animate-rock-glow ${
            bump ? "scale-110" : ""
          }`}
        >
          <span className="relative">
            <ShoppingCart className="h-6 w-6" aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-black"
            >
              {count}
            </span>
          </span>
          <span className="font-bold">{priceFormatter.format(state.total)}</span>
        </button>
      )}
    </>
  )
}