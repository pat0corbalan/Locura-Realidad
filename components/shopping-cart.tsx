"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export function ShoppingCartButton() {
  const { state } = useCart()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Carrito
          {state.itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary"
            >
              {state.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de Compras
          </SheetTitle>
          <SheetDescription>
            {state.itemCount === 0
              ? "Tu carrito está vacío"
              : `${state.itemCount} ${state.itemCount === 1 ? "artículo" : "artículos"} en tu carrito`}
          </SheetDescription>
        </SheetHeader>

        <ShoppingCartContent />
      </SheetContent>
    </Sheet>
  )
}

function ShoppingCartContent() {
  const { state, dispatch } = useCart()

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
        <p className="text-sm text-muted-foreground">Agrega algunos productos increíbles de nuestra tienda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-4">
          {state.items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-card-foreground truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-foreground">${item.price}</span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>

                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-foreground">Total:</span>
            <span className="text-2xl font-bold text-primary">${state.total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="lg">
              Proceder al Pago
            </Button>

            <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
              Vaciar Carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
