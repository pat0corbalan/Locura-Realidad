"use client"

import React, { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { Send, Ticket, Bus, Mail, Phone, Landmark } from "lucide-react"
import { Tour } from "@/components/types/tour"

interface ReservaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tour: Tour | null
}

export function ReservaModal({ open, onOpenChange, tour }: ReservaModalProps) {
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [loading, setLoading] = useState(false)
  
  const esEvento = (tour as any)?.category?.toLowerCase().includes("evento") || (tour as any)?.type === "ticket";

  const handleEnviarWhatsapp = async () => {
    setLoading(true);
    const tipoServicio = esEvento ? "ENTRADA QR" : "TOUR/VIAJE";

    try {
      // 1. GUARDAR EN MONGOOSE
      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          apellido,
          email,
          telefono,
          tour_title: tour?.title,
          tipo: esEvento ? 'ticket' : 'tour',
          estado: 'pendiente'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Error al guardar");

      // 2. CONSTRUIR MENSAJE
      const emojiServicio = esEvento ? "🎫" : "🚌";
      const shortId = data._id ? data._id.slice(-6).toUpperCase() : "S/N";

      const mensaje = [
        "🔥 *NUEVA SOLICITUD - LOCURA Y REALIDAD* 🔥",
        `🆔 *REF:* #${shortId}`,
        "",
        `${emojiServicio} *Servicio:* ${tipoServicio}`,
        `📌 *Item:* ${tour?.title ?? "No especificado"}`,
        "",
        `👤 *Cliente:* ${nombre} ${apellido}`,
        `📧 *Email:* ${email}`,
        `📱 *WhatsApp:* ${telefono}`,
        "💳 *Forma de pago:* Transferencia Bancaria",
        "",
        esEvento 
          ? "📩 _Hola! Me gustaría recibir los datos de CBU/Alias para transferir y obtener mi QR._" 
          : "📍 _Hola! Solicito los datos de transferencia para reservar mi lugar en el tour._"
      ].join("\n");

      // 3. ABRIR WHATSAPP (FIX PARA CELULARES)
      const url = `https://wa.me/543855227041?text=${encodeURIComponent(mensaje)}`;
      
      // Intentamos abrir en pestaña nueva
      const win = window.open(url, "_blank");
      
      // Si 'win' es null o undefined, es que el celular bloqueó el pop-up
      if (!win || win.closed || typeof win.closed === 'undefined') {
        // Entonces redirigimos la pestaña actual (Esto siempre funciona en móviles)
        window.location.assign(url);
      }
      
      // Reset y cerrar con un delay para que el navegador no mate el proceso de apertura
      setTimeout(() => {
        onOpenChange(false);
        setNombre(""); setApellido(""); setEmail(""); setTelefono("");
      }, 1000);

    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al registrar tu reserva. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const formularioCompleto = nombre && apellido && email && telefono && !loading;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]" />
      <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-[90vw] p-7 bg-white rounded-xl shadow-2xl -translate-x-1/2 -translate-y-1/2 z-[1001] border-t-4 border-red-600 outline-none">
        
        <Dialog.Title className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
          {esEvento ? <Ticket className="text-red-600" size={28} /> : <Bus className="text-red-600" size={28} />}
          {esEvento ? "Comprar Entrada QR" : "Reserva tu Tour"}
        </Dialog.Title>

        {tour && (
          <div className="bg-gray-50 p-3 rounded-lg mb-6 border border-gray-100 text-center">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-widest text-gray-400">Seleccionado</p>
            <p className="text-lg font-bold text-red-600">{tour.title}</p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nombre"
              className="border border-gray-300 rounded-lg px-3 py-3 text-gray-700 focus:ring-2 focus:ring-red-400 outline-none bg-gray-50"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Apellido"
              className="border border-gray-300 rounded-lg px-3 py-3 text-gray-700 focus:ring-2 focus:ring-red-400 outline-none bg-gray-50"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email (donde recibirás el QR)"
              className="border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-gray-700 focus:ring-2 focus:ring-red-400 outline-none w-full bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="tel"
              placeholder="WhatsApp de contacto"
              className="border border-gray-300 rounded-lg pl-10 pr-3 py-3 text-gray-700 focus:ring-2 focus:ring-red-400 outline-none w-full bg-gray-50"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="bg-red-50 p-3 rounded-lg flex items-center gap-3 border border-red-100">
            <Landmark className="text-red-600" size={20} />
            <p className="text-[11px] text-red-800 leading-tight">
              Al enviar, los datos se registrarán en nuestro sistema y te contactaremos por WhatsApp para la transferencia.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              onClick={handleEnviarWhatsapp}
              disabled={!formularioCompleto}
              className="bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Send size={20} /> 
              {loading ? "Procesando..." : (esEvento ? "Pedir mi Entrada QR" : "Enviar Reserva")}
            </Button>
            
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 text-sm font-medium transition py-2"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}