"use client"

import React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { User, CreditCard, Package, Truck, MapPin, Send, X } from "lucide-react"
import { Tour } from "@/components/types/tour"

interface ReservaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tour: Tour | null
}

export function ReservaModal({ open, onOpenChange, tour }: ReservaModalProps) {
  const [nombre, setNombre] = React.useState("")
  const [apellido, setApellido] = React.useState("")
  const [pago, setPago] = React.useState("Efectivo")
  const [retira, setRetira] = React.useState("Retirar en local")
  const [direccionRetiro, setDireccionRetiro] = React.useState("")

  

    const handleEnviarWhatsapp = () => {
    const mensaje = `
    ¡Hola! Me gustaría reservar un tour con los siguientes detalles:

    🌟 Tour seleccionado: ${tour?.title ?? "No especificado"}
    👤 Nombre: ${nombre} ${apellido}
    💳 Método de pago: ${pago}
    ${retira === "Envío a domicilio" ? `📍 Dirección para entrega: ${direccionRetiro}` : ""}
    

    Quedo atento/a a la confirmación. ¡Muchas gracias!
    `
    const url = `https://wa.me/543855227041?text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank")
    }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" />
      <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-full p-7 bg-white rounded-xl shadow-2xl -translate-x-1/2 -translate-y-1/2 z-[1001]">
        <Dialog.Title className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
          <Send size={28} /> Reserva tu Tour
        </Dialog.Title>

        {tour && (
          <p className="text-lg font-semibold text-primary mb-6">
            Tour seleccionado: {tour.title}
          </p>
        )}

        <div className="flex flex-col space-y-5">
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

          <label className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={pago}
              onChange={(e) => setPago(e.target.value)}
              className="border border-gray-300 rounded-lg px-10 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition w-full"
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Mercado Pago">Mercado Pago</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={handleEnviarWhatsapp}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition flex items-center gap-2"
            >
              <Send size={20} /> Enviar Reserva
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
