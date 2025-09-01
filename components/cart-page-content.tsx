"use client"

import { MerchandiseStore } from "@/components/merchandise-store"
import { useCart } from "@/contexts/cart-context"

export function CartPageContent() {
  const { dispatch } = useCart()

  const handleAddToCart = (product: any) => {
    dispatch({ type: "ADD_ITEM", payload: product })
  }

  return <MerchandiseStore onAddToCart={handleAddToCart} />
}
