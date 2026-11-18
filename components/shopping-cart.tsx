"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { Card, CardContent } from "./ui/card"
import { optimizeCloudinaryImage } from "@/utils/optimizeCloudinary"

interface ShoppingCartButtonProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckout: () => void
}

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function ShoppingCartButton({
  open,
  onOpenChange,
  onCheckout,
}: ShoppingCartButtonProps) {
  const { state } = useCart()

  const handleProceedToCheckout = () => {
    onOpenChange(false)
    onCheckout()
  }

  const handleContinueShopping = () => {
    onOpenChange(false)
    // Esperar a que el panel termine de cerrarse antes de desplazar la página
    setTimeout(
      () => document.getElementById("tienda")?.scrollIntoView({ behavior: "smooth" }),
      250
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative bg-transparent"
          aria-label={
            state.itemCount > 0
              ? `Carrito, ${state.itemCount} ${state.itemCount === 1 ? "artículo" : "artículos"}`
              : "Carrito"
          }
        >
          <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
          Carrito
          {state.itemCount > 0 && (
            <Badge
              aria-hidden="true"
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-xs"
            >
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            Carrito de compras
          </SheetTitle>
          <SheetDescription>
            {state.itemCount === 0
              ? "Tu carrito está vacío"
              : `${state.itemCount} ${state.itemCount === 1 ? "artículo" : "artículos"} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        <ShoppingCartContent
          onProceedToCheckout={handleProceedToCheckout}
          onContinueShopping={handleContinueShopping}
        />
      </SheetContent>
    </Sheet>
  )
}

function ShoppingCartContent({
  onProceedToCheckout,
  onContinueShopping,
}: {
  onProceedToCheckout: () => void
  onContinueShopping: () => void
}) {
  const { state, dispatch } = useCart()
  const [confirmClear, setConfirmClear] = useState(false)

  // La confirmación para vaciar se cancela sola a los 3 segundos
  useEffect(() => {
    if (!confirmClear) return
    const t = setTimeout(() => setConfirmClear(false), 3000)
    return () => clearTimeout(t)
  }, [confirmClear])

  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })

  const removeItem = (id: string) =>
    dispatch({ type: "REMOVE_ITEM", payload: id })

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      return
    }
    dispatch({ type: "CLEAR_CART" })
    setConfirmClear(false)
  }

  if (state.items.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
        <ShoppingCart
          className="mb-4 h-16 w-16 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="mb-1 font-medium text-foreground">Tu carrito está vacío</p>
        <p className="mb-6 text-sm text-muted-foreground">
          Sumá remeras y más desde nuestra tienda.
        </p>
        <Button variant="outline" onClick={onContinueShopping}>
          Ver la tienda
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
      <div className="flex-1 overflow-y-auto py-4 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
        <ul className="space-y-4">
          {state.items.map((item) => {
            const talle =
              item.size && item.size !== "Único" ? item.size : null

            return (
              <li key={item.id}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={
                          item.image
                            ? optimizeCloudinaryImage(item.image, {
                                width: 200,
                                quality: "auto:eco",
                                crop: "fill",
                                format: "webp",
                              })
                            : "/placeholder.svg"
                        }
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-md object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-medium text-card-foreground">
                          {item.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {[item.category, talle].filter(Boolean).join(" · ")}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-bold text-foreground">
                            {priceFormatter.format(item.price * item.quantity)}
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              aria-label={`Quitar una unidad de ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" aria-hidden="true" />
                            </Button>

                            <span
                              className="w-8 text-center text-sm font-medium"
                              aria-label={`Cantidad: ${item.quantity}`}
                            >
                              {item.quantity}
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              aria-label={`Agregar una unidad de ${item.name}`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" aria-hidden="true" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              aria-label={`Eliminar ${item.name} del carrito`}
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Resumen */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-2xl font-bold text-primary">
                {priceFormatter.format(state.total)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              La entrega o el envío se coordinan por WhatsApp.
            </p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="lg" onClick={onProceedToCheckout}>
              Finalizar pedido
            </Button>

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleClear}
            >
              {confirmClear ? "¿Seguro? Tocá de nuevo para vaciar" : "Vaciar carrito"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}