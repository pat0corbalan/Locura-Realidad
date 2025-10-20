"use client"

import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  User,
  CreditCard,
  MapPin,
  Package,
  Truck,
  Send,
  X,
} from "lucide-react"

import { useCart } from "@/contexts/cart-context" // 👈 IMPORTANTE

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const [nombre, setNombre] = React.useState("")
  const [apellido, setApellido] = React.useState("")
  const [pago, setPago] = React.useState("Efectivo")
  const [retira, setRetira] = React.useState("Coordinar entrega")
  const [direccionEnvio, setDireccionEnvio] = React.useState("")
  const [aclaracion, setAclaracion] = React.useState("")

  const { state } = useCart() // 👈 accedemos al carrito

  const handleEnviarWhatsapp = () => {
    const productosTexto = state.items
      .map((item) => {
        const sizeText = item.size ? ` - Talle: ${item.size}` : "";
        return `- ${item.name}${sizeText} (x${item.quantity})`
      })
      .join("\n")

    const mensaje = `¡Hola! Me gustaría realizar un pedido con los siguientes datos:

👤 Nombre y Apellido: ${nombre} ${apellido}
💳 Método de pago: ${pago}
📦 Entrega o envío: ${retira}
${retira === "Coordinar envio" ? `🏠 Dirección de entrega: ${direccionEnvio}` : ""}

🛍️ Productos:
${productosTexto}

📝 Aclaraciones:
${aclaracion ? aclaracion : "Ninguna"}

Quedo atento/a a la confirmación. ¡Muchas gracias!
    `

    const url = `https://wa.me/543855227041?text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank")
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" />
      <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full p-7 bg-white rounded-xl shadow-2xl -translate-x-1/2 -translate-y-1/2 z-[1001]">
        <Dialog.Title className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
          <ShoppingCart size={28} /> Completa tus datos
        </Dialog.Title>

        <div className="flex flex-col space-y-5">
          {/* Nombre */}
          <label className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Nombre"
              className="border border-gray-300 rounded-lg px-10 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>

          {/* Apellido */}
          <label className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Apellido"
              className="border border-gray-300 rounded-lg px-10 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
            />
          </label>

          {/* Método de pago */}
          <label className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={pago}
              onChange={(e) => setPago(e.target.value)}
              className="border border-gray-300 rounded-lg px-10 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Mercado pago">Mercado Pago</option>
            </select>
          </label>

          {/* Envío o retiro */}
          <label className="relative">
            {retira === "Coordinar entrega" ? (
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            ) : (
              <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            )}
            <select
              value={retira}
              onChange={(e) => setRetira(e.target.value)}
              className="border border-gray-300 rounded-lg px-10 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
            >
              <option value="Coordinar entrega">Coordinar entrega</option>
              <option value="Coordinar envio">Coordinar envio</option>
            </select>
          </label>

          {/* Dirección de envío (condicional) */}
          {retira === "Coordinar envio" && (
            <label className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Dirección de envío"
                className="border border-gray-300 rounded-lg px-10 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
                value={direccionEnvio}
                onChange={(e) => setDireccionEnvio(e.target.value)}
              />
            </label>
          )}

          {/* Aclaración */}
          <label className="relative">
            <Send className="absolute left-3 top-3 text-gray-400" size={20} />
            <textarea
              placeholder="¿Desea agregar alguna aclaración?"
              className="border border-gray-300 rounded-lg px-10 pt-10 pb-3 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
              rows={3}
              value={aclaracion}
              onChange={(e) => setAclaracion(e.target.value)}
            />
          </label>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleEnviarWhatsapp} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition flex items-center gap-2">
              <Send size={20} /> Enviar a Whatsapp
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-3 rounded-lg transition flex items-center gap-2"
            >
              <X size={20} /> Cerrar
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}