"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react"
import { Product } from "@/components/types/product"

interface CartItem extends Product {
  quantity: number
  size: string // talle seleccionado
  id: string // ID único en el carrito: _id + size
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "HYDRATE"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: Product & { size: string } }
  | { type: "REMOVE_ITEM"; payload: string } // id
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

const STORAGE_KEY = "lyr-cart-v1"

/**
 * El reducer solo maneja la lista de items. El total y la cantidad se
 * calculan a partir de ella (más abajo), así nunca pueden quedar
 * desincronizados como podía pasar al recalcularlos a mano en cada caso.
 */
function itemsReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.payload

    case "ADD_ITEM": {
      const id = `${action.payload._id}-${action.payload.size}`
      const exists = items.some((item) => item.id === id)
      if (exists) {
        return items.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...items, { ...action.payload, id, quantity: 1 }]
    }

    case "REMOVE_ITEM":
      return items.filter((item) => item.id !== action.payload)

    case "UPDATE_QUANTITY": {
      const quantity = Math.floor(action.payload.quantity)
      if (!Number.isFinite(quantity)) return items
      if (quantity <= 0) {
        return items.filter((item) => item.id !== action.payload.id)
      }
      return items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity } : item
      )
    }

    case "CLEAR_CART":
      return []

    default:
      return items
  }
}

// Valida lo que viene de localStorage (puede estar vacío, viejo o alterado)
function isValidItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false
  const item = value as Partial<CartItem>
  return (
    typeof item.id === "string" &&
    typeof item.size === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(itemsReducer, [])
  const [hydrated, setHydrated] = useState(false)

  // Recuperar el carrito guardado (se hace después de montar para no
  // causar diferencias entre el HTML del servidor y el del navegador)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", payload: parsed.filter(isValidItem) })
        }
      }
    } catch {
      // storage bloqueado o JSON dañado: se arranca con carrito vacío
    }
    setHydrated(true)
  }, [])

  // Guardar cada cambio (solo después de haber recuperado, para no pisar
  // el carrito guardado con uno vacío)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // sin espacio o modo privado: se ignora
    }
  }, [items, hydrated])

  const state = useMemo<CartState>(
    () => ({
      items,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [items]
  )

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}