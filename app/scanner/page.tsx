"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle2, XCircle, Loader2, RefreshCcw, User, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
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
      { fps: 15, qrbox: { width: 250, height: 250 } },
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
        void scannerRef.current.clear()
        scannerRef.current = null
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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-6">
      <div className="w-full max-w-md flex flex-col gap-8">
        
        {/* Header Tour */}
        <header className="text-center pt-8">
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            LOCURA Y REALIDAD <span className="text-red-600 font-black">TOUR</span>
          </h1>
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-zinc-900 text-zinc-500 border-zinc-800 uppercase text-[9px] font-bold">STAFF</Badge>
            <Badge className="bg-red-600/10 text-red-500 border-red-600/20 animate-pulse uppercase text-[9px] font-bold tracking-widest">LIVE CONTROL</Badge>
          </div>
        </header>

        {/* Lector QR */}
        <div className={`relative aspect-square overflow-hidden rounded-[3rem] border-2 transition-all duration-700 shadow-2xl bg-zinc-950 ${
          status === 'success' ? 'border-green-500 shadow-green-500/20 scale-[0.98]' : 
          status === 'error' ? 'border-red-600 shadow-red-600/20 scale-[0.98]' : 'border-zinc-900'
        }`}>
          
          <div id="reader" className="w-full h-full"></div>

          {/* Overlay de Resultados */}
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
              {status === "loading" && <Loader2 className="h-10 w-10 animate-spin text-red-600" />}

              {status === "success" && (
                <div className="text-center space-y-6 w-full animate-in zoom-in-95 duration-300">
                  <div className="bg-green-500 rounded-full p-3 w-fit mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-black" />
                  </div>
                  <h2 className="text-3xl font-black italic text-green-500 tracking-tighter uppercase leading-none">{message}</h2>
                  <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5 text-left">
                    <p className="font-bold text-white uppercase text-sm truncate">{ticketData?.nombreCliente || 'Cliente'}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">{ticketData?.eventoNombre}</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="bg-red-600 rounded-full p-3 w-fit mx-auto"><XCircle className="h-10 w-10 text-white" /></div>
                  <h2 className="text-3xl font-black italic text-red-600 tracking-tighter uppercase">{message}</h2>
                </div>
              )}

              {status !== "loading" && (
                <button onClick={resetScanner} className="mt-8 group flex flex-col items-center gap-2">
                  <div className="p-4 bg-zinc-900 rounded-full border border-white/5 group-active:scale-90 transition-all">
                    <RefreshCcw className="h-5 w-5 text-zinc-400" />
                  </div>
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Siguiente Escaneo</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* El disparador estético (Solo visible en IDLE) */}
        {status === 'idle' && (
          <div className="text-center">
            <label htmlFor="reader__dashboard_section_csr" className="cursor-pointer group">
              <span className="text-[10px] text-zinc-800 font-bold uppercase tracking-[0.3em] transition-colors group-hover:text-zinc-600">
                — Activar Sensor Óptico —
              </span>
            </label>
          </div>
        )}

        <footer className="mt-auto pb-4 opacity-10 text-center">
          <p className="text-[7px] text-white font-bold tracking-[0.8em] uppercase">Locura y Realidad Producciones</p>
        </footer>
      </div>

      <style jsx global>{`
        #reader { border: none !important; }
        #reader video { object-fit: cover !important; }
        
        /* HACEMOS EL BOTÓN "GRANDE HORRIBLE" INVISIBLE PERO CLICKEABLE */
        #reader__dashboard_section_csr button {
          position: absolute !important;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0 !important; /* Totalmente invisible */
          cursor: pointer !important;
          z-index: 10;
        }

        /* Ocultar basurita de la librería */
        #reader__status_span, #reader header, img[alt="Info icon"] { display: none !important; }
        
        #reader__camera_selection {
          background: transparent;
          color: #333;
          border: none;
          font-size: 8px;
          text-transform: uppercase;
          margin-top: 10px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}