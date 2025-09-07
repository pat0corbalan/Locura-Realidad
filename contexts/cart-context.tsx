"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import { Product } from "@/components/types/product"

interface CartItem extends Product {
  quantity: number
  size: string // talla seleccionada
  id: string   // ID único en el carrito: _id + size
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product & { size: string } }
  | { type: "REMOVE_ITEM"; payload: string } // id
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const incomingItem: CartItem = {
        ...action.payload,
        id: `${action.payload._id}-${action.payload.size}`, // ID único
        quantity: 1,
      }

      const existingItem = state.items.find(
        (item) => item.id === incomingItem.id
      )

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === incomingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )

        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      } else {
        const newItems = [...state.items, incomingItem]
        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        }
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      )

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }
    }

    case "CLEAR_CART":
      return {
        items: [],
        total: 0,
        itemCount: 0,
      }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
  })

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
