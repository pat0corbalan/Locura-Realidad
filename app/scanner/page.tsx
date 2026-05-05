"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle2, XCircle, Loader2, RefreshCcw, User, Ticket, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ScannerPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [ticketData, setTicketData] = useState<any>(null)

  const isProcessingRef = useRef(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 20, // Más fluido
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0 
      },
      false
    )

    scannerRef.current = scanner

    const onScanSuccess = (decodedText: string) => {
      if (isProcessingRef.current) return
      isProcessingRef.current = true
      validarTicket(decodedText)
    }

    scanner.render(onScanSuccess, () => {})

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const validarTicket = async (id: string) => {
    setStatus("loading")
    try {
      const res = await fetch(`/api/tickets/validar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setMessage("ACCESO CONCEDIDO")
        setTicketData(data.ticket)
      } else {
        setStatus("error")
        setMessage(data.error || "TICKET NO VÁLIDO")
      }
    } catch (error) {
      setStatus("error")
      setMessage("ERROR DE CONEXIÓN")
    }
  }

  const resetScanner = () => {
    setStatus("idle")
    setTicketData(null)
    setMessage("")
    isProcessingRef.current = false
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-6 font-sans">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Header */}
        <header className="text-center pt-4">
          <h1 className="text-3xl font-black italic tracking-tighter text-white leading-none">
            LOCURA Y REALIDAD <span className="text-red-600 font-black">TOUR</span>
          </h1>
          <div className="flex justify-center gap-2 mt-3">
            <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 uppercase text-[9px] tracking-widest font-bold">Staff Control</Badge>
            <Badge className="bg-red-600/10 text-red-500 border-red-600/20 animate-pulse uppercase text-[9px] tracking-widest font-bold">En Vivo</Badge>
          </div>
        </header>

        {/* Lector QR - Contenedor Fijo */}
        <div className={`relative w-full aspect-square max-h-[380px] overflow-hidden rounded-[2.5rem] border-4 transition-all duration-500 shadow-2xl bg-zinc-950 ${
          status === 'success' ? 'border-green-500 shadow-green-500/20 scale-[0.98]' : 
          status === 'error' ? 'border-red-600 shadow-red-600/20 scale-[0.98]' : 'border-zinc-900'
        }`}>
          
          <div id="reader" className="w-full h-full"></div>

          {/* Overlay de Carga/Estado */}
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center p-6 text-center">
              {status === "loading" && (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-600" />
                  <p className="font-black italic tracking-widest text-white uppercase">Validando...</p>
                </div>
              )}

              {status === "success" && (
                <div className="animate-in zoom-in duration-300 space-y-4 w-full">
                  <div className="bg-green-500 rounded-full p-4 w-fit mx-auto">
                    <CheckCircle2 className="h-12 w-12 text-black" />
                  </div>
                  <h2 className="text-3xl font-black italic text-green-500 leading-tight tracking-tighter uppercase">
                    {message}
                  </h2>
                  <div className="bg-zinc-900/50 rounded-2xl p-4 text-left border border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-red-600" />
                      <p className="font-bold uppercase text-white truncate">{ticketData?.nombreCliente || 'Cliente General'}</p>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                      <Ticket size={16} />
                      <p className="text-xs uppercase font-bold tracking-tighter truncate">{ticketData?.eventoNombre || 'Entrada Local'}</p>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="animate-in zoom-in duration-300 space-y-4">
                  <div className="bg-red-600 rounded-full p-4 w-fit mx-auto">
                    <XCircle className="h-12 w-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black italic text-red-600 leading-tight tracking-tighter uppercase">
                    {message}
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón de Acción - Siempre visible o post-escaneo */}
        <div className="px-2">
          {status !== "idle" && status !== "loading" ? (
            <Button 
              onClick={resetScanner} 
              className={`w-full h-16 rounded-2xl font-black italic tracking-widest transition-all active:scale-95 shadow-xl ${
                status === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              REINTENTAR / SIGUIENTE
            </Button>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-600 text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse">
                Apunta al código QR para escanear
              </p>
            </div>
          )}
        </div>

        <footer className="mt-auto pt-8 pb-4 opacity-20 text-center">
          <p className="text-[8px] text-white font-bold tracking-[0.5em] uppercase">
            Locura y Realidad — Sistema de Control
          </p>
        </footer>
      </div>

      <style jsx global>{`
        /* LIMPIEZA CRÍTICA DE LA LIBRERÍA */
        #reader { 
          border: none !important; 
          display: flex flex-col;
          align-items: center;
        }
        #reader__scan_region {
          background: transparent !important;
        }
        #reader__scan_region video {
          border-radius: 0 !important;
          object-fit: cover !important;
          height: 380px !important;
        }
        
        /* Ocultar basurita visual */
        #reader__dashboard, 
        #reader__status_span, 
        #reader header, 
        img[alt="Info icon"] { 
          display: none !important; 
        }

        /* Botón de permiso (cuando aparece) */
        #reader__dashboard_section_csr button {
          background-color: #dc2626 !important;
          color: white !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 12px !important;
          font-weight: 900 !important;
          font-style: italic !important;
          text-transform: uppercase !important;
          margin-top: 100px !important;
        }

        /* Selector de cámara */
        #reader__camera_selection {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 30;
          background: #18181b;
          color: white;
          border: 1px solid #27272a;
          border-radius: 8px;
          padding: 5px;
          font-size: 10px;
          max-width: 200px;
        }
      `}</style>
    </div>
  )
}