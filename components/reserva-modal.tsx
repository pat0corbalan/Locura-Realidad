"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  Send,
  Ticket,
  Bus,
  Mail,
  Phone,
  Landmark,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

export type ReservaTipo = "tour" | "ticket";

export interface ReservaItem {
  title: string;
  tipo: ReservaTipo;
}

interface ReservaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReservaItem | null;
}

const WHATSAPP_NUMBER = "543855227041";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-lg border border-border bg-input px-3 py-3 text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60";
const labelClass = "mb-1 block text-sm font-medium text-foreground";

const EMPTY_FORM = { nombre: "", apellido: "", email: "", telefono: "" };

export function ReservaModal({ open, onOpenChange, item }: ReservaModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ url: string; ref: string } | null>(
    null
  );

  const esEvento = item?.tipo === "ticket";

  const setField =
    (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const telefonoDigitos = form.telefono.replace(/\D/g, "");
  const formularioValido =
    form.nombre.trim() &&
    form.apellido.trim() &&
    EMAIL_RE.test(form.email.trim()) &&
    telefonoDigitos.length >= 8;

  const handleOpenChange = (next: boolean) => {
    if (loading && !next) return; // no cerrar mientras se envía
    if (!next) {
      setForm(EMPTY_FORM);
      setError(null);
      setEnviado(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !formularioValido || loading) return;

    setLoading(true);
    setError(null);

    const datos = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
    };

    try {
      // 1. Guardar la reserva
      const response = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...datos,
          tour_title: item.title,
          tipo: item.tipo,
          estado: "pendiente",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error("No se pudo guardar la reserva.");

      // 2. Armar el mensaje de WhatsApp
      const ref = data._id ? String(data._id).slice(-6).toUpperCase() : "S/N";
      const mensaje = [
        "🔥 *NUEVA SOLICITUD - LOCURA Y REALIDAD* 🔥",
        `🆔 *REF:* #${ref}`,
        "",
        `${esEvento ? "🎫" : "🚌"} *Servicio:* ${esEvento ? "ENTRADA QR" : "TOUR/VIAJE"}`,
        `📌 *Item:* ${item.title}`,
        "",
        `👤 *Cliente:* ${datos.nombre} ${datos.apellido}`,
        `📧 *Email:* ${datos.email}`,
        `📱 *WhatsApp:* ${datos.telefono}`,
        "💳 *Forma de pago:* Transferencia bancaria",
        "",
        esEvento
          ? "📩 _Hola! Me gustaría recibir los datos de CBU/Alias para transferir y obtener mi QR._"
          : "📍 _Hola! Solicito los datos de transferencia para reservar mi lugar en el viaje._",
      ].join("\n");

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;

      // 3. Intentar abrir WhatsApp. En celulares el bloqueador de pop-ups
      //    puede impedirlo (la apertura ocurre después de un await), por eso
      //    la pantalla de confirmación siempre ofrece un botón para abrirlo.
      window.open(url, "_blank", "noopener,noreferrer");
      setEnviado({ url, ref });
    } catch (err) {
      console.error("Error al registrar la reserva:", err);
      setError(
        "No pudimos registrar tu solicitud. Revisá tu conexión e intentá de nuevo, o escribinos directamente por WhatsApp."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[1001] max-h-[90dvh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-xl border-t-4 border-primary bg-card p-5 text-card-foreground shadow-2xl outline-none [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] sm:p-6">
          {enviado ? (
            /* ----------------------- CONFIRMACIÓN ----------------------- */
            <div className="text-center">
              <CheckCircle2
                className="mx-auto mb-4 h-14 w-14 text-primary"
                aria-hidden="true"
              />
              <Dialog.Title className="mb-2 text-2xl font-bold">
                ¡Solicitud registrada!
              </Dialog.Title>
              <Dialog.Description className="mb-6 text-muted-foreground">
                Tu referencia es{" "}
                <span className="font-bold text-foreground">#{enviado.ref}</span>.
                Seguí la conversación por WhatsApp para recibir los datos de
                transferencia. Si no se abrió automáticamente, tocá el botón.
              </Dialog.Description>
              <div className="flex flex-col gap-3">
                <Button asChild className="py-6 text-lg font-bold">
                  <a href={enviado.url} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2" size={20} aria-hidden="true" />
                    Abrir WhatsApp
                  </a>
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
            <form onSubmit={handleSubmit} noValidate>
              <Dialog.Title className="mb-3 flex items-center gap-2 text-2xl font-bold">
                {esEvento ? (
                  <Ticket className="text-primary" size={28} aria-hidden="true" />
                ) : (
                  <Bus className="text-primary" size={28} aria-hidden="true" />
                )}
                {esEvento ? "Comprar entrada QR" : "Reservá tu lugar"}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                Completá tus datos y seguimos por WhatsApp.
              </Dialog.Description>

              {item && (
                <div className="mb-4 rounded-lg border border-border bg-muted/50 p-2 text-center">
                  <p className="text-xs text-muted-foreground">Seleccionaste</p>
                  <p className="text-lg font-bold text-primary">{item.title}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reserva-nombre" className={labelClass}>
                      Nombre
                    </label>
                    <input
                      id="reserva-nombre"
                      name="nombre"
                      type="text"
                      autoComplete="given-name"
                      required
                      className={inputClass}
                      value={form.nombre}
                      onChange={setField("nombre")}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="reserva-apellido" className={labelClass}>
                      Apellido
                    </label>
                    <input
                      id="reserva-apellido"
                      name="apellido"
                      type="text"
                      autoComplete="family-name"
                      required
                      className={inputClass}
                      value={form.apellido}
                      onChange={setField("apellido")}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reserva-email" className={labelClass}>
                    Email{esEvento ? " (acá te enviamos el QR)" : ""}
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                      aria-hidden="true"
                    />
                    <input
                      id="reserva-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      className={`${inputClass} pl-10`}
                      value={form.email}
                      onChange={setField("email")}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reserva-telefono" className={labelClass}>
                    WhatsApp de contacto
                  </label>
                  <div className="relative">
                    <Phone
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                      aria-hidden="true"
                    />
                    <input
                      id="reserva-telefono"
                      name="telefono"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="Con código de área. Ej: 385 1234567"
                      required
                      className={`${inputClass} pl-10`}
                      value={form.telefono}
                      onChange={setField("telefono")}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/10 p-3">
                  <Landmark
                    className="shrink-0 text-primary"
                    size={20}
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-snug text-foreground/80">
                    Al enviar, registramos tus datos y te contactamos por
                    WhatsApp con los datos de transferencia.
                  </p>
                </div>

                {error && (
                  <p role="alert" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={!formularioValido || loading}
                    className="flex items-center justify-center gap-2 py-5 text-lg font-bold shadow-lg"
                  >
                    <Send size={20} aria-hidden="true" />
                    {loading
                      ? "Enviando..."
                      : esEvento
                        ? "Pedir mi entrada QR"
                        : "Enviar reserva"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    disabled={loading}
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
  );
}