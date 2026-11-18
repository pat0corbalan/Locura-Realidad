"use client"

import { useCallback } from "react"
import { MerchandiseStore } from "@/components/merchandise-store"
import { useCart } from "@/contexts/cart-context"

export function CartPageContent() {
  const { dispatch } = useCart()

  // Sigue en `any` hasta tipar el producto con components/types/product.ts
  const handleAddToCart = useCallback(
    (product: any) => {
      if (!product?._id) {
        console.error("Producto sin _id:", product)
        return
      }

      // La tienda ya exige elegir talle (o manda "Único" si no tiene talles).
      // El fallback es solo una red de seguridad; ya no se asume "M".
      const { selectedSize, ...rest } = product
      const size: string = selectedSize || "Único"

      dispatch({
        type: "ADD_ITEM",
        payload: { ...rest, size },
      })

      // Lo escucha CartFloatingButton para mostrar el aviso "Agregado al carrito"
      window.dispatchEvent(
        new CustomEvent("cart:added", {
          detail: {
            name: product.name,
            option: size === "Único" ? undefined : size,
          },
        })
      )
    },
    [dispatch]
  )

  return <MerchandiseStore onAddToCart={handleAddToCart} />
}