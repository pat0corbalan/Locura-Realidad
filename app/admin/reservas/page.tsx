
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  MapPin,
  Ticket,
  Users,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  Clock3,
  X,
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronDown,
  Filter,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

type Evento = {
  _id: string
  titulo: string
  lugar: string
  precio: number
  fecha: string
  descripcion?: string
  imagenUrl?: string
  activo: boolean
}

type Reserva = {
  _id: string
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  tour_title?: string
  tipo?: string
  estado?: string
  fecha?: string
  createdAt?: string
  [key: string]: unknown
}

type EventoForm = {
  titulo: string
  lugar: string
  precio: string
  fecha: string
  descripcion: string
  imagenUrl: string
}

const EMPTY_FORM: EventoForm = {
  titulo: "",
  lugar: "",
  precio: "",
  fecha: "",
  descripcion: "",
  imagenUrl: "",
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#111113] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-2 focus:ring-red-500/10"

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"

function formatDate(value?: string) {
  if (!value) return "Sin fecha"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Fecha inválida"

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatDateTime(value?: string) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getReservationStatus(estado?: string) {
  const value = (estado || "pendiente").toLowerCase()

  if (["aprobada", "aprobado", "confirmada", "confirmado"].includes(value)) {
    return {
      label: "Aprobada",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    }
  }

  if (["rechazada", "rechazado", "cancelada", "cancelado"].includes(value)) {
    return {
      label: "Rechazada",
      className: "border-red-500/20 bg-red-500/10 text-red-400",
    }
  }

  return {
    label: "Pendiente",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  }
}

function getEventDateInput(value?: string) {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16)
}

export default function ReservasAdminPage() {
  const [activeTab, setActiveTab] = useState<"eventos" | "reservas">("eventos")

  const [eventos, setEventos] = useState<Evento[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState<"todos" | "activos" | "inactivos">("todos")
  const [reservationFilter, setReservationFilter] = useState("todos")

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null)
  const [eventForm, setEventForm] = useState<EventoForm>(EMPTY_FORM)
  const [savingEvent, setSavingEvent] = useState(false)
  const [eventFormError, setEventFormError] = useState("")

  const [selectedQr, setSelectedQr] = useState<Reserva | null>(null)
  const [updatingReservation, setUpdatingReservation] = useState<string | null>(null)
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null)

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 3500)
  }

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    setError("")

    try {
      const [eventsResponse, reservationsResponse] = await Promise.all([
        fetch("/api/eventos?admin=1", { cache: "no-store" }),
        fetch("/api/reservas", { cache: "no-store" }),
      ])

      if (!eventsResponse.ok) {
        throw new Error("No se pudieron cargar los eventos.")
      }

      if (!reservationsResponse.ok) {
        throw new Error("No se pudieron cargar las reservas.")
      }

      const [eventsData, reservationsData] = await Promise.all([
        eventsResponse.json(),
        reservationsResponse.json(),
      ])

      setEventos(Array.isArray(eventsData) ? eventsData : [])
      setReservas(Array.isArray(reservationsData) ? reservationsData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al cargar el módulo.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredEvents = useMemo(() => {
    const term = search.toLowerCase().trim()

    return eventos.filter((evento) => {
      const matchesSearch =
        !term ||
        evento.titulo?.toLowerCase().includes(term) ||
        evento.lugar?.toLowerCase().includes(term) ||
        evento.descripcion?.toLowerCase().includes(term)

      const matchesStatus =
        eventFilter === "todos" ||
        (eventFilter === "activos" && evento.activo) ||
        (eventFilter === "inactivos" && !evento.activo)

      return matchesSearch && matchesStatus
    })
  }, [eventos, search, eventFilter])

  const filteredReservations = useMemo(() => {
    const term = search.toLowerCase().trim()

    return reservas.filter((reserva) => {
      const fullName = `${reserva.nombre || ""} ${reserva.apellido || ""}`.toLowerCase()

      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        reserva.email?.toLowerCase().includes(term) ||
        reserva.telefono?.toLowerCase().includes(term) ||
        reserva.tour_title?.toLowerCase().includes(term) ||
        reserva._id?.toLowerCase().includes(term)

      const status = (reserva.estado || "pendiente").toLowerCase()

      const matchesStatus =
        reservationFilter === "todos" ||
        (reservationFilter === "pendiente" && status === "pendiente") ||
        (reservationFilter === "aprobada" &&
          ["aprobada", "aprobado", "confirmada", "confirmado"].includes(status)) ||
        (reservationFilter === "rechazada" &&
          ["rechazada", "rechazado", "cancelada", "cancelado"].includes(status))

      return matchesSearch && matchesStatus
    })
  }, [reservas, search, reservationFilter])

  const activeEvents = eventos.filter((evento) => evento.activo).length
  const pendingReservations = reservas.filter(
    (reserva) => (reserva.estado || "pendiente").toLowerCase() === "pendiente"
  ).length

  function openCreateEvent() {
    setEditingEvent(null)
    setEventForm(EMPTY_FORM)
    setEventFormError("")
    setEventModalOpen(true)
  }

  function openEditEvent(evento: Evento) {
    setEditingEvent(evento)
    setEventForm({
      titulo: evento.titulo || "",
      lugar: evento.lugar || "",
      precio: String(evento.precio ?? ""),
      fecha: getEventDateInput(evento.fecha),
      descripcion: evento.descripcion || "",
      imagenUrl: evento.imagenUrl || "",
    })
    setEventFormError("")
    setEventModalOpen(true)
  }

  async function saveEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEventFormError("")

    if (!eventForm.titulo.trim()) {
      setEventFormError("El título del evento es obligatorio.")
      return
    }

    if (!eventForm.lugar.trim()) {
      setEventFormError("El lugar del evento es obligatorio.")
      return
    }

    if (!eventForm.fecha) {
      setEventFormError("La fecha del evento es obligatoria.")
      return
    }

    const price = Number(eventForm.precio)

    if (!Number.isFinite(price) || price < 0) {
      setEventFormError("Ingresá un precio válido.")
      return
    }

    setSavingEvent(true)

    try {
      const payload = {
        titulo: eventForm.titulo.trim(),
        lugar: eventForm.lugar.trim(),
        precio: price,
        fecha: new Date(eventForm.fecha).toISOString(),
        descripcion: eventForm.descripcion.trim(),
        imagenUrl: eventForm.imagenUrl.trim(),
      }

      const url = editingEvent
        ? `/api/eventos/${editingEvent._id}`
        : "/api/eventos"

      const response = await fetch(url, {
        method: editingEvent ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo guardar el evento.")
      }

      setEventModalOpen(false)
      setEditingEvent(null)
      setEventForm(EMPTY_FORM)

      await loadData(true)
      showNotice(editingEvent ? "Evento actualizado correctamente." : "Evento creado correctamente.")
    } catch (err) {
      setEventFormError(
        err instanceof Error ? err.message : "Ocurrió un error al guardar el evento."
      )
    } finally {
      setSavingEvent(false)
    }
  }

  async function toggleEvent(evento: Evento) {
    const action = evento.activo ? "desactivar" : "activar"

    if (!window.confirm(`¿Querés ${action} el evento "${evento.titulo}"?`)) return

    try {
      const response = await fetch(`/api/eventos/${evento._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !evento.activo }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `No se pudo ${action} el evento.`)
      }

      await loadData(true)
      showNotice(evento.activo ? "Evento desactivado." : "Evento activado.")
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "No se pudo actualizar el evento.")
    }
  }

  async function deleteEvent(evento: Evento) {
    const confirmed = window.confirm(
      `Vas a eliminar definitivamente "${evento.titulo}". Esta acción no se puede deshacer. ¿Continuar?`
    )

    if (!confirmed) return

    setDeletingEvent(evento._id)

    try {
      const response = await fetch(`/api/eventos/${evento._id}`, {
        method: "DELETE",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo eliminar el evento.")
      }

      setEventos((current) => current.filter((item) => item._id !== evento._id))
      showNotice("Evento eliminado.")
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "No se pudo eliminar el evento.")
    } finally {
      setDeletingEvent(null)
    }
  }

  async function updateReservation(reserva: Reserva, estado: "aprobada" | "rechazada" | "pendiente") {
    setUpdatingReservation(reserva._id)

    try {
      const response = await fetch(`/api/reservas/${reserva._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar la reserva.")
      }

      setReservas((current) =>
        current.map((item) =>
          item._id === reserva._id ? { ...item, estado } : item
        )
      )

      showNotice("Estado de la reserva actualizado.")
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "No se pudo actualizar la reserva.")
    } finally {
      setUpdatingReservation(null)
    }
  }

  async function deleteReservation(reserva: Reserva) {
    const name = `${reserva.nombre || ""} ${reserva.apellido || ""}`.trim()

    if (!window.confirm(`¿Eliminar la reserva de ${name || "este cliente"}?`)) return

    setUpdatingReservation(reserva._id)

    try {
      const response = await fetch(`/api/reservas/${reserva._id}`, {
        method: "DELETE",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "No se pudo eliminar la reserva.")
      }

      setReservas((current) => current.filter((item) => item._id !== reserva._id))
      if (selectedQr?._id === reserva._id) setSelectedQr(null)
      showNotice("Reserva eliminada.")
    } catch (err) {
      showNotice(err instanceof Error ? err.message : "No se pudo eliminar la reserva.")
    } finally {
      setUpdatingReservation(null)
    }
  }

  function downloadQr(reserva: Reserva) {
    const svg = document.getElementById(`qr-${reserva._id}`)

    if (!svg) {
      showNotice("No se encontró el código QR.")
      return
    }

    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `reserva-${reserva._id}.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(url)
  }

  async function shareQr(reserva: Reserva) {
    const name = `${reserva.nombre || ""} ${reserva.apellido || ""}`.trim()
    const message = `Hola ${name || ""}, este es tu código QR de reserva: ${window.location.origin}/reserva/${reserva._id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Código QR de reserva",
          text: message,
          url: `${window.location.origin}/reserva/${reserva._id}`,
        })
        return
      } catch {
        // El usuario pudo cancelar el menú para compartir.
      }
    }

    const phone = (reserva.telefono || "").replace(/\D/g, "")
    const whatsappUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`

    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-7">
        {/* HEADER */}
        <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#111113] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-red-600/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-60 w-60 rounded-full bg-red-900/10 blur-[90px]" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/[0.08] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Panel de administración
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Eventos <span className="text-red-500">&</span> Reservas
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                Administrá tus eventos, controlá las reservas y gestioná los accesos desde un solo lugar.
              </p>
            </div>

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className={buttonSecondary}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Actualizar datos
            </button>
          </div>

          <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={<CalendarDays size={18} />}
              label="Eventos registrados"
              value={eventos.length}
              detail={`${activeEvents} activos`}
            />
            <StatCard
              icon={<Ticket size={18} />}
              label="Reservas totales"
              value={reservas.length}
              detail="Registros recibidos"
            />
            <StatCard
              icon={<Clock3 size={18} />}
              label="Pendientes"
              value={pendingReservations}
              detail="Requieren revisión"
              accent
            />
          </div>
        </header>

        {/* TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] pb-4">
          <TabButton
            active={activeTab === "eventos"}
            onClick={() => {
              setActiveTab("eventos")
              setSearch("")
            }}
            icon={<CalendarDays size={16} />}
          >
            Eventos
            <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
              {eventos.length}
            </span>
          </TabButton>

          <TabButton
            active={activeTab === "reservas"}
            onClick={() => {
              setActiveTab("reservas")
              setSearch("")
            }}
            icon={<Users size={16} />}
          >
            Reservas
            <span className="ml-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px]">
              {reservas.length}
            </span>
          </TabButton>
        </div>

        {/* SEARCH AND ACTIONS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "eventos"
                  ? "Buscar evento por título o lugar..."
                  : "Buscar cliente, email, teléfono o evento..."
              }
              className={`${inputClass} pl-11`}
            />
          </div>

          {activeTab === "eventos" ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value as typeof eventFilter)}
                className={`${inputClass} w-auto min-w-[145px]`}
              >
                <option value="todos">Todos los eventos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>

              <button onClick={openCreateEvent} className={buttonPrimary}>
                <Plus size={17} />
                Crear evento
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-zinc-500" />
              <select
                value={reservationFilter}
                onChange={(e) => setReservationFilter(e.target.value)}
                className={`${inputClass} w-auto min-w-[155px]`}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobada">Aprobadas</option>
                <option value="rechazada">Rechazadas</option>
              </select>
            </div>
          )}
        </div>

        {/* FEEDBACK */}
        {notice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            <span className="flex-1">{error}</span>
            <button onClick={() => loadData(true)} className="underline">
              Reintentar
            </button>
          </div>
        )}

        {/* CONTENT */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </div>
        ) : activeTab === "eventos" ? (
          <section>
            {filteredEvents.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={25} />}
                title={search ? "No encontramos eventos" : "Todavía no hay eventos"}
                description={
                  search
                    ? "Probá con otro término de búsqueda."
                    : "Creá tu primer evento para comenzar a recibir reservas."
                }
                action={
                  !search ? (
                    <button onClick={openCreateEvent} className={buttonPrimary}>
                      <Plus size={16} />
                      Crear primer evento
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((evento) => (
                  <article
                    key={evento._id}
                    className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113] transition duration-300 hover:-translate-y-1 hover:border-white/[0.14]"
                  >
                    <div className="relative h-48 overflow-hidden bg-[#19191c]">
                      {evento.imagenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={evento.imagenUrl}
                          alt={evento.titulo}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon size={36} className="text-zinc-700" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                      <div className="absolute left-4 top-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            evento.activo
                              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                              : "border-zinc-500/30 bg-black/40 text-zinc-400"
                          }`}
                        >
                          {evento.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="line-clamp-1 text-xl font-bold text-white">
                          {evento.titulo}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-300">
                          <MapPin size={13} />
                          {evento.lugar}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            <Calendar size={12} />
                            Fecha
                          </div>
                          <p className="text-sm font-semibold text-zinc-200">
                            {formatDate(evento.fecha)}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                            <DollarSign size={12} />
                            Precio
                          </div>
                          <p className="text-sm font-semibold text-zinc-200">
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              maximumFractionDigits: 0,
                            }).format(Number(evento.precio) || 0)}
                          </p>
                        </div>
                      </div>

                      {evento.descripcion && (
                        <p className="line-clamp-2 min-h-10 text-xs leading-5 text-zinc-500">
                          {evento.descripcion}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                        <button
                          onClick={() => openEditEvent(evento)}
                          className={`${buttonSecondary} flex-1`}
                        >
                          <Pencil size={14} />
                          Editar
                        </button>

                        <button
                          onClick={() => toggleEvent(evento)}
                          title={evento.activo ? "Desactivar evento" : "Activar evento"}
                          className={buttonSecondary}
                        >
                          {evento.activo ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>

                        <button
                          onClick={() => deleteEvent(evento)}
                          disabled={deletingEvent === evento._id}
                          title="Eliminar evento"
                          className="inline-flex items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.06] px-3 text-red-400 transition hover:bg-red-500/15 disabled:opacity-50"
                        >
                          {deletingEvent === evento._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111113]">
            <div className="flex flex-col justify-between gap-2 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-white">Listado de reservas</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {filteredReservations.length} resultado(s)
                </p>
              </div>
              <span className="text-xs text-zinc-500">
                Gestioná estados y códigos QR desde cada reserva
              </span>
            </div>

            {filteredReservations.length === 0 ? (
              <EmptyState
                icon={<Ticket size={25} />}
                title="No hay reservas para mostrar"
                description="Cuando recibas reservas, aparecerán en esta sección."
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[900px] text-left">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                        <th className="px-5 py-4 font-semibold">Cliente</th>
                        <th className="px-5 py-4 font-semibold">Evento / experiencia</th>
                        <th className="px-5 py-4 font-semibold">Fecha de reserva</th>
                        <th className="px-5 py-4 font-semibold">Estado</th>
                        <th className="px-5 py-4 text-right font-semibold">Acciones</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/[0.05]">
                      {filteredReservations.map((reserva) => {
                        const status = getReservationStatus(reserva.estado)
                        const name =
                          `${reserva.nombre || ""} ${reserva.apellido || ""}`.trim() ||
                          "Cliente"

                        return (
                          <tr key={reserva._id} className="transition hover:bg-white/[0.02]">
                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-zinc-200">{name}</p>
                              <p className="mt-1 text-xs text-zinc-500">{reserva.email || "Sin email"}</p>
                              {reserva.telefono && (
                                <p className="mt-0.5 text-xs text-zinc-600">{reserva.telefono}</p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm text-zinc-300">
                                {reserva.tour_title || "Reserva"}
                              </p>
                              {reserva.tipo && (
                                <p className="mt-1 text-xs text-zinc-500">{reserva.tipo}</p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-xs text-zinc-400">
                              {formatDateTime(reserva.createdAt || reserva.fecha)}
                            </td>

                            <td className="px-5 py-4">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}>
                                {status.label}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedQr(reserva)}
                                  title="Ver QR"
                                  className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                                >
                                  <QrCode size={15} />
                                </button>

                                {status.label !== "Aprobada" && (
                                  <button
                                    onClick={() => updateReservation(reserva, "aprobada")}
                                    disabled={updatingReservation === reserva._id}
                                    title="Aprobar"
                                    className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] p-2 text-emerald-400 transition hover:bg-emerald-500/15 disabled:opacity-50"
                                  >
                                    <CheckCircle2 size={15} />
                                  </button>
                                )}

                                {status.label !== "Rechazada" && (
                                  <button
                                    onClick={() => updateReservation(reserva, "rechazada")}
                                    disabled={updatingReservation === reserva._id}
                                    title="Rechazar"
                                    className="rounded-lg border border-amber-500/15 bg-amber-500/[0.06] p-2 text-amber-400 transition hover:bg-amber-500/15 disabled:opacity-50"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                )}

                                {status.label !== "Pendiente" && (
                                  <button
                                    onClick={() => updateReservation(reserva, "pendiente")}
                                    disabled={updatingReservation === reserva._id}
                                    title="Volver a pendiente"
                                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                                  >
                                    <Clock3 size={15} />
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteReservation(reserva)}
                                  disabled={updatingReservation === reserva._id}
                                  title="Eliminar reserva"
                                  className="rounded-lg border border-red-500/15 bg-red-500/[0.06] p-2 text-red-400 transition hover:bg-red-500/15 disabled:opacity-50"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE RESERVATIONS */}
                <div className="divide-y divide-white/[0.06] lg:hidden">
                  {filteredReservations.map((reserva) => {
                    const status = getReservationStatus(reserva.estado)
                    const name =
                      `${reserva.nombre || ""} ${reserva.apellido || ""}`.trim() ||
                      "Cliente"

                    return (
                      <article key={reserva._id} className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-white">{name}</h3>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {reserva.email || "Sin email"}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${status.className}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="rounded-xl bg-white/[0.03] p-3">
                          <p className="text-xs font-semibold text-zinc-300">
                            {reserva.tour_title || "Reserva"}
                          </p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            {formatDateTime(reserva.createdAt || reserva.fecha)}
                          </p>
                          {reserva.telefono && (
                            <p className="mt-1 text-[11px] text-zinc-500">
                              {reserva.telefono}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setSelectedQr(reserva)} className={`${buttonSecondary} flex-1`}>
                            <QrCode size={14} />
                            Ver QR
                          </button>

                          {status.label !== "Aprobada" && (
                            <button
                              onClick={() => updateReservation(reserva, "aprobada")}
                              disabled={updatingReservation === reserva._id}
                              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 text-emerald-400"
                              title="Aprobar"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}

                          {status.label !== "Rechazada" && (
                            <button
                              onClick={() => updateReservation(reserva, "rechazada")}
                              disabled={updatingReservation === reserva._id}
                              className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 text-amber-400"
                              title="Rechazar"
                            >
                              <XCircle size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => deleteReservation(reserva)}
                            disabled={updatingReservation === reserva._id}
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-red-400"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* EVENT MODAL */}
      {eventModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !savingEvent) setEventModalOpen(false)
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#111113] shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  Gestión de eventos
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {editingEvent ? "Editar evento" : "Crear nuevo evento"}
                </h2>
              </div>

              <button
                onClick={() => !savingEvent && setEventModalOpen(false)}
                disabled={savingEvent}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveEvent} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Título del evento *" className="sm:col-span-2">
                  <input
                    required
                    value={eventForm.titulo}
                    onChange={(e) => setEventForm({ ...eventForm, titulo: e.target.value })}
                    placeholder="Ej: Noche de música en vivo"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Lugar *">
                  <input
                    required
                    value={eventForm.lugar}
                    onChange={(e) => setEventForm({ ...eventForm, lugar: e.target.value })}
                    placeholder="Ej: Santiago del Estero"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Precio (ARS) *">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={eventForm.precio}
                    onChange={(e) => setEventForm({ ...eventForm, precio: e.target.value })}
                    placeholder="0"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Fecha y hora *" className="sm:col-span-2">
                  <input
                    required
                    type="datetime-local"
                    value={eventForm.fecha}
                    onChange={(e) => setEventForm({ ...eventForm, fecha: e.target.value })}
                    className={inputClass}
                  />
                </FormField>

                <FormField label="URL de imagen" className="sm:col-span-2">
                  <input
                    type="url"
                    value={eventForm.imagenUrl}
                    onChange={(e) => setEventForm({ ...eventForm, imagenUrl: e.target.value })}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-[11px] text-zinc-600">
                    Pegá una URL pública de imagen. Este formulario no sube archivos.
                  </p>
                </FormField>

                <FormField label="Descripción" className="sm:col-span-2">
                  <textarea
                    rows={4}
                    value={eventForm.descripcion}
                    onChange={(e) => setEventForm({ ...eventForm, descripcion: e.target.value })}
                    placeholder="Contá de qué se trata el evento..."
                    className={`${inputClass} resize-y`}
                  />
                </FormField>
              </div>

              {eventFormError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.08] p-3 text-sm text-red-300">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {eventFormError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  disabled={savingEvent}
                  className={buttonSecondary}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={savingEvent} className={buttonPrimary}>
                  {savingEvent ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {editingEvent ? "Guardar cambios" : "Crear evento"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {selectedQr && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedQr(null)
          }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#111113] p-6 text-center shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  Acceso de reserva
                </p>
                <h2 className="mt-1 text-lg font-bold text-white">Código QR</h2>
              </div>

              <button
                onClick={() => setSelectedQr(null)}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="rounded-2xl bg-white p-5">
              <QRCodeSVG
                id={`qr-${selectedQr._id}`}
                value={selectedQr._id}
                size={220}
                level="H"
                includeMargin
                className="mx-auto h-auto max-w-full"
              />
            </div>

            <p className="mt-4 text-sm font-bold text-white">
              {`${selectedQr.nombre || ""} ${selectedQr.apellido || ""}`.trim() || "Cliente"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {selectedQr.tour_title || "Reserva"}
            </p>
            <p className="mt-3 break-all rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-[10px] text-zinc-500">
              {selectedQr._id}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => downloadQr(selectedQr)} className={buttonSecondary}>
                <Download size={15} />
                Descargar
              </button>
              <button onClick={() => shareQr(selectedQr)} className={buttonPrimary}>
                <Share2 size={15} />
                Compartir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* COMPONENTES AUXILIARES */

function StatCard({
  icon,
  label,
  value,
  detail,
  accent = false,
}: {
  icon: React.ReactNode
  label: string
  value: number
  detail: string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className={`rounded-xl p-2 ${accent ? "bg-red-500/10 text-red-400" : "bg-white/[0.05] text-zinc-400"}`}>
          {icon}
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-3xl font-black tracking-tight text-white">{value}</span>
        <span className="pb-1 text-[11px] text-zinc-500">{detail}</span>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border border-red-500/20 bg-red-500/10 text-red-400"
          : "border border-transparent text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function FormField({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-zinc-500">
        {icon}
      </div>
      <h3 className="text-base font-bold text-zinc-200">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
