"use client"

import React, { useEffect, useState } from "react"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  MoreVertical, 
  Phone, 
  Ticket,
  MapPin,
  RefreshCcw,
  Trash2,
  QrCode,
  Download,
  Share2,
  PlusCircle,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { QRCodeSVG } from "qrcode.react"

interface Reserva {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  tour_title: string;
  tipo: 'ticket' | 'tour';
  estado: 'pendiente' | 'confirmado' | 'rechazado';
  fecha: string;
}

export default function ReservasAdminPage() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  
  // Estados para nuevos eventos
  const [showEventoModal, setShowEventoModal] = useState(false)
  const [isCreatingEvento, setIsCreatingEvento] = useState(false)
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: "",
    lugar: "",
    precio: "",
    fecha: ""
  })

  useEffect(() => {
    fetchReservas()
  }, [])

  const fetchReservas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reservas')
      const data = await res.json()
      if (Array.isArray(data)) setReservas(data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA DE EVENTOS ---
  const handleCrearEvento = async () => {
    if (!nuevoEvento.titulo || !nuevoEvento.precio) return alert("Completa los campos básicos")
    setIsCreatingEvento(true)
    try {
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoEvento,
          precio: Number(nuevoEvento.precio),
          activo: true
        })
      })
      if (res.ok) {
        alert("Evento publicado con éxito")
        setShowEventoModal(false)
        setNuevoEvento({ titulo: "", lugar: "", precio: "", fecha: "" })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsCreatingEvento(false)
    }
  }

  const handleUpdateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      })
      if (res.ok) {
        setReservas(prev => prev.map(r => r._id === id ? { ...r, estado: nuevoEstado as any } : r))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteReserva = async (id: string) => {
    if (!confirm("¿Eliminar reserva?")) return
    try {
      const res = await fetch(`/api/reservas/${id}`, { method: 'DELETE' })
      if (res.ok) setReservas(prev => prev.filter(r => r._id !== id))
    } catch (error) {
      console.error(error)
    }
  }

  // --- LÓGICA DE GENERACIÓN DE IMAGEN QR ---
  const generateQRImageBlob = async (reserva: Reserva): Promise<Blob | null> => {
    const svg = document.getElementById(`qr-${reserva._id}`) as unknown as SVGSVGElement;
    if (!svg) return null;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    canvas.width = 300;
    canvas.height = 300;
    return new Promise((resolve) => {
      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 300, 300);
        }
        canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  const handleShare = async (reserva: Reserva) => {
    try {
      const blob = await generateQRImageBlob(reserva);
      if (!blob) return;
      const shareText = `¡Hola ${reserva.nombre}! 🎫\n\nAquí tienes tu ticket para *${reserva.tour_title}*.\n\n*REF:* #${reserva._id.slice(-6).toUpperCase()}\n\nPresenta este código al ingresar. ¡Nos vemos! 🚌🔥`;
      const file = new File([blob], `Ticket-${reserva.apellido}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Ticket Locura & Realidad', text: shareText });
      } else {
        const urlImage = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = urlImage;
        link.download = `Ticket-${reserva.apellido}.png`;
        link.click();
        URL.revokeObjectURL(urlImage);
        window.open(`https://wa.me/54${reserva.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } catch (err) { console.error(err) }
  };

  const descargarQR = async (reserva: Reserva) => {
    const blob = await generateQRImageBlob(reserva);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QR-${reserva.apellido}.png`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reservasFiltradas = reservas.filter(r => 
    `${r.nombre} ${r.apellido} ${r.tour_title} ${r._id}`.toLowerCase().includes(filtro.toLowerCase())
  )

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'confirmado': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle size={12} className="mr-1" /> Confirmado</Badge>
      case 'rechazado': return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle size={12} className="mr-1" /> Rechazado</Badge>
      default: return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20"><Clock size={12} className="mr-1" /> Pendiente</Badge>
    }
  }

  return (
    <div className="p-8 space-y-6 bg-background min-h-screen text-foreground">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Locura & Realidad</h1>
          <p className="text-muted-foreground font-medium">Panel de Control Administrativo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowEventoModal(true)} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <PlusCircle size={18} /> Nuevo Evento
          </Button>
          <Button onClick={fetchReservas} variant="outline" className="gap-2">
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Buscar cliente, tour o #REF..." 
          className="pl-10 bg-card" 
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {/* TABLA DE RESERVAS */}
      <div className="bg-card rounded-xl border border-border shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">REF / Fecha</TableHead>
              <TableHead className="font-bold">Cliente</TableHead>
              <TableHead className="font-bold">Servicio</TableHead>
              <TableHead className="font-bold">Estado</TableHead>
              <TableHead className="text-right font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-20 animate-pulse">Cargando datos...</TableCell></TableRow>
            ) : (
              reservasFiltradas.map((reserva) => (
                <TableRow key={reserva._id} className="hover:bg-muted/5 transition-colors">
                  <TableCell>
                    <div className="font-mono font-bold text-red-600">#{reserva._id.slice(-6).toUpperCase()}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(reserva.fecha).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold">{reserva.nombre} {reserva.apellido}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1"><Phone size={10} /> {reserva.telefono}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {reserva.tipo === 'ticket' ? <Ticket size={14} className="text-red-500"/> : <MapPin size={14} className="text-blue-500"/>}
                      <span className="text-sm font-medium">{reserva.tour_title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reserva.estado)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {reserva.estado === 'pendiente' ? (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8" onClick={() => handleUpdateEstado(reserva._id, 'confirmado')}>Aprobar</Button>
                          <Button size="sm" variant="destructive" className="h-8" onClick={() => handleUpdateEstado(reserva._id, 'rechazado')}>Rechazar</Button>
                        </>
                      ) : (
                        <div className="flex gap-2">
                          {reserva.estado === 'confirmado' && (
                            <Button size="sm" variant="outline" className="h-8 border-blue-500 text-blue-500" onClick={() => setSelectedReserva(reserva)}>
                              <QrCode size={16} className="mr-1" /> QR
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreVertical size={18}/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateEstado(reserva._id, 'pendiente')}><Clock className="mr-2 h-4 w-4"/> Revertir</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteReserva(reserva._id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL CREAR EVENTO */}
      <Dialog open={showEventoModal} onOpenChange={setShowEventoModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="text-red-600" /> Crear Nuevo Evento
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-tighter">Título del Evento</label>
              <Input 
                placeholder="Ej: Festival Rock Santiago" 
                value={nuevoEvento.titulo}
                onChange={e => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-tighter">Lugar / Ubicación</label>
              <Input 
                placeholder="Ej: Club local, SDE" 
                value={nuevoEvento.lugar}
                onChange={e => setNuevoEvento({...nuevoEvento, lugar: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-tighter">Precio ($)</label>
                <Input 
                  type="number" 
                  placeholder="5000" 
                  value={nuevoEvento.precio}
                  onChange={e => setNuevoEvento({...nuevoEvento, precio: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-tighter">Fecha</label>
                <Input 
                  type="date" 
                  value={nuevoEvento.fecha}
                  onChange={e => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                />
              </div>
            </div>
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 mt-2"
              onClick={handleCrearEvento}
              disabled={isCreatingEvento}
            >
              {isCreatingEvento ? "Publicando..." : "PUBLICAR EVENTO"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL VISUALIZAR QR */}
      <Dialog open={!!selectedReserva} onOpenChange={() => setSelectedReserva(null)}>
        <DialogContent className="sm:max-w-md flex flex-col items-center">
          <DialogHeader className="w-full text-center">
            <DialogTitle className="text-xl">Ticket: {selectedReserva?.nombre} {selectedReserva?.apellido}</DialogTitle>
          </DialogHeader>
          <div className="bg-white p-6 rounded-2xl shadow-xl border-4 border-muted mt-2">
            {selectedReserva && (
              <QRCodeSVG id={`qr-${selectedReserva._id}`} value={selectedReserva._id} size={220} level="H" includeMargin={true} />
            )}
          </div>
          <div className="text-center mt-3">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Código de Validación</span>
            <p className="font-mono font-bold text-2xl text-red-600 tracking-tighter">#{selectedReserva?._id.slice(-6).toUpperCase()}</p>
            <p className="text-xs font-semibold uppercase italic">{selectedReserva?.tour_title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            <Button variant="outline" className="gap-2" onClick={() => selectedReserva && descargarQR(selectedReserva)}>
              <Download size={18} /> Guardar
            </Button>
            <Button className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 font-bold" onClick={() => selectedReserva && handleShare(selectedReserva)}>
              <Share2 size={18} /> Enviar QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}