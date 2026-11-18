"use client"

import { useState } from "react"
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
  CheckCircle2,
  MessageCircle,
} from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const WHATSAPP_NUMBER = "543855227041"
const DESCUENTO_TRANSFERENCIA = 0.1 // "10% de descuento si abonás por transferencia"

const PAGOS = [
  { value: "Efectivo", label: "Efectivo" },
  { value: "Transferencia", label: "Transferencia bancaria (10% de descuento)" },
  { value: "Mercado Pago", label: "Mercado Pago" },
]

const ENTREGAS = [
  { value: "retiro", label: "Retiro en mano (a coordinar)" },
  { value: "envio", label: "Envío a domicilio (a coordinar)" },
]

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const fieldClass =
  "w-full rounded-lg border border-border bg-input py-3 pl-10 pr-3 text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary [color-scheme:dark]"
const labelClass = "mb-1 block text-sm font-medium text-foreground"
const iconClass =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [pago, setPago] = useState("Efectivo")
  const [entrega, setEntrega] = useState("retiro")
  const [direccionEnvio, setDireccionEnvio] = useState("")
  const [aclaracion, setAclaracion] = useState("")
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  const { state, dispatch } = useCart()

  const esEnvio = entrega === "envio"
  const descuento =
    pago === "Transferencia" ? Math.round(state.total * DESCUENTO_TRANSFERENCIA) : 0
  const totalFinal = state.total - descuento

  const formularioValido =
    state.items.length > 0 &&
    nombre.trim() !== "" &&
    apellido.trim() !== "" &&
    (!esEnvio || direccionEnvio.trim() !== "")

  const handleOpenChange = (next: boolean) => {
    if (!next) setWhatsappUrl(null)
    onOpenChange(next)
  }

  const handleEnviarWhatsapp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formularioValido) return

    const productos = state.items
      .map((item) => {
        const talle = item.size && item.size !== "Único" ? ` - ${item.size}` : ""
        return `- ${item.name}${talle} (x${item.quantity}): ${priceFormatter.format(item.price * item.quantity)}`
      })
      .join("\n")

    const mensaje = [
      "¡Hola! Me gustaría realizar un pedido con los siguientes datos:",
      "",
      `👤 Nombre y apellido: ${nombre.trim()} ${apellido.trim()}`,
      `💳 Método de pago: ${PAGOS.find((p) => p.value === pago)?.value ?? pago}`,
      `📦 Entrega: ${ENTREGAS.find((x) => x.value === entrega)?.label}`,
      ...(esEnvio ? [`🏠 Dirección de envío: ${direccionEnvio.trim()}`] : []),
      "",
      "🛍️ Productos:",
      productos,
      "",
      ...(descuento > 0
        ? [
            `Subtotal: ${priceFormatter.format(state.total)}`,
            `Descuento por transferencia (10%): -${priceFormatter.format(descuento)}`,
          ]
        : []),
      `💰 Total: ${priceFormatter.format(totalFinal)}`,
      "",
      `📝 Aclaraciones: ${aclaracion.trim() || "Ninguna"}`,
      "",
      "Quedo atento/a a la confirmación. ¡Muchas gracias!",
    ].join("\n")

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank", "noopener,noreferrer")
    setWhatsappUrl(url)
  }

  const finalizar = () => {
    dispatch({ type: "CLEAR_CART" })
    setNombre("")
    setApellido("")
    setDireccionEnvio("")
    setAclaracion("")
    handleOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[1001] max-h-[90dvh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-xl border-t-4 border-primary bg-card p-5 text-card-foreground shadow-2xl outline-none [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] sm:p-6">
          {whatsappUrl ? (
            /* ----------------------- CONFIRMACIÓN ----------------------- */
            <div className="text-center">
              <CheckCircle2
                className="mx-auto mb-4 h-14 w-14 text-primary"
                aria-hidden="true"
              />
              <Dialog.Title className="mb-2 text-2xl font-bold">
                ¡Pedido listo para enviar!
              </Dialog.Title>
              <Dialog.Description className="mb-6 text-muted-foreground">
                Terminá el pedido en la conversación de WhatsApp. Si no se abrió
                automáticamente, tocá el botón. Tu carrito se mantiene hasta que
                lo vacíes.
              </Dialog.Description>
              <div className="flex flex-col gap-3">
                <Button asChild className="py-6 text-lg font-bold">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2" size={20} aria-hidden="true" />
                    Abrir WhatsApp
                  </a>
                </Button>
                <Button variant="outline" onClick={finalizar}>
                  Ya lo envié: vaciar carrito
                </Button>
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            /* ------------------------ FORMULARIO ------------------------ */
            <form onSubmit={handleEnviarWhatsapp} noValidate>
              <Dialog.Title className="mb-3 flex items-center gap-2 text-2xl font-bold">
                <ShoppingCart className="text-primary" size={28} aria-hidden="true" />
                Completá tus datos
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Completá tus datos para enviar el pedido por WhatsApp.
              </Dialog.Description>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="checkout-nombre" className={labelClass}>
                      Nombre
                    </label>
                    <div className="relative">
                      <User className={iconClass} size={18} aria-hidden="true" />
                      <input
                        id="checkout-nombre"
                        type="text"
                        autoComplete="given-name"
                        required
                        className={fieldClass}
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="checkout-apellido" className={labelClass}>
                      Apellido
                    </label>
                    <div className="relative">
                      <User className={iconClass} size={18} aria-hidden="true" />
                      <input
                        id="checkout-apellido"
                        type="text"
                        autoComplete="family-name"
                        required
                        className={fieldClass}
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-pago" className={labelClass}>
                    Método de pago
                  </label>
                  <div className="relative">
                    <CreditCard className={iconClass} size={18} aria-hidden="true" />
                    <select
                      id="checkout-pago"
                      value={pago}
                      onChange={(e) => setPago(e.target.value)}
                      className={fieldClass}
                    >
                      {PAGOS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-entrega" className={labelClass}>
                    Entrega
                  </label>
                  <div className="relative">
                    {esEnvio ? (
                      <Truck className={iconClass} size={18} aria-hidden="true" />
                    ) : (
                      <Package className={iconClass} size={18} aria-hidden="true" />
                    )}
                    <select
                      id="checkout-entrega"
                      value={entrega}
                      onChange={(e) => setEntrega(e.target.value)}
                      className={fieldClass}
                    >
                      {ENTREGAS.map((x) => (
                        <option key={x.value} value={x.value}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {esEnvio && (
                  <div>
                    <label htmlFor="checkout-direccion" className={labelClass}>
                      Dirección de envío
                    </label>
                    <div className="relative">
                      <MapPin className={iconClass} size={18} aria-hidden="true" />
                      <input
                        id="checkout-direccion"
                        type="text"
                        autoComplete="street-address"
                        required
                        className={fieldClass}
                        value={direccionEnvio}
                        onChange={(e) => setDireccionEnvio(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="checkout-aclaracion" className={labelClass}>
                    Aclaraciones (opcional)
                  </label>
                  <textarea
                    id="checkout-aclaracion"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-input px-3 py-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
                    value={aclaracion}
                    onChange={(e) => setAclaracion(e.target.value)}
                  />
                </div>

                {/* Resumen */}
                <dl className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">
                      {state.itemCount} {state.itemCount === 1 ? "artículo" : "artículos"}
                    </dt>
                    <dd>{priceFormatter.format(state.total)}</dd>
                  </div>
                  {descuento > 0 && (
                    <div className="flex justify-between text-primary">
                      <dt>Descuento por transferencia</dt>
                      <dd>-{priceFormatter.format(descuento)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold">
                    <dt>Total</dt>
                    <dd>{priceFormatter.format(totalFinal)}</dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={!formularioValido}
                    className="flex items-center justify-center gap-2 py-5 text-lg font-bold"
                  >
                    <Send size={20} aria-hidden="true" /> Enviar pedido por WhatsApp
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}