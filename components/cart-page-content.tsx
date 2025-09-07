"use client"

import { MerchandiseStore } from "@/components/merchandise-store"
import { useCart } from "@/contexts/cart-context"

export function CartPageContent() {
  const { dispatch } = useCart()

  const handleAddToCart = (product: any) => {
    // Obtener el talle seleccionado o fallback a "M"
    const size = product.selectedSize || "M"

    if (!product._id) {
      console.error("Producto sin _id:", product)
      return
    }

    // Crear un id único combinando el id original y el talle
    const id = `${product._id}-${size}`

    const cartItem = {
      ...product,
      size, // tamaño normalizado (puedes renombrar según tu tipo de carrito)
      id,
    }

    dispatch({ type: "ADD_ITEM", payload: cartItem })
  }

  return <MerchandiseStore onAddToCart={handleAddToCart} />
}
