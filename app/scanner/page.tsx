"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle2, XCircle, Loader2, RefreshCcw, User, Ticket, Scan, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ScannerPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [ticketData, setTicketData] = useState<any>(null)

  const isProcessingRef = useRef(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    // Inicializamos el scanner pero dejamos que el CSS controle su visibilidad
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 20, qrbox: { width: 220, height: 220 } },
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
        scannerRef.current.clear().catch(() => {})
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
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-6 select-none">
      <div className="w-full max-w-md flex flex-col gap-8">
        
        {/* Header Minimal */}
        <header className="text-center pt-6 space-y-3">
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">
            Locura y Realidad <span className="text-red-600 italic">Tour</span>
          </h1>
          <div className="flex justify-center gap-2">
            <Badge className="bg-white text-black font-black italic text-[9px] px-2 py-0 border-none">STAFF</Badge>
            <Badge className="bg-transparent border border-red-600/50 text-red-600 text-[9px] animate-pulse">CONTROL</Badge>
          </div>
        </header>

        {/* Lector QR - Estética Superior */}
        <div className={`relative w-full aspect-square overflow-hidden rounded-[3rem] border-2 transition-all duration-700 ${
          status === 'success' ? 'border-green-500 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)] scale-[0.98]' : 
          status === 'error' ? 'border-red-600 shadow-[0_0_40px_-10px_rgba(220,38,38,0.3)] scale-[0.98]' : 'border-zinc-800 shadow-2xl'
        }`}>
          
          <div id="reader" className="w-full h-full bg-zinc-950"></div>

          {/* Overlay de Resultados (Inside the circle) */}
          {status !== 'idle' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              {status === "loading" && (
                <Loader2 className="h-10 w-10 animate-spin text-red-600" />
              )}

              {status === "success" && (
                <div className="space-y-6 w-full animate-in zoom-in-95 duration-300">
                  <div className="bg-green-500 rounded-full p-3 w-fit mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-black" />
                  </div>
                  <h2 className="text-3xl font-black italic text-green-500 tracking-tighter uppercase leading-none">
                    {message}
                  </h2>
                  <div className="text-left border-l-2 border-red-600 pl-4 space-y-1 py-1 max-w-[200px] mx-auto">
                    <p className="font-bold text-white uppercase text-sm truncate">{ticketData?.nombreCliente || 'Público General'}</p>
                    <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{ticketData?.eventoNombre || 'Acceso Tour'}</p>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                  <div className="bg-red-600 rounded-full p-3 w-fit mx-auto">
                    <XCircle className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-black italic text-red-600 tracking-tighter uppercase leading-none">
                    {message}
                  </h2>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control Inferior */}
        <div className="flex flex-col items-center px-4 min-h-[80px]">
          {status === 'idle' ? (
             <div className="text-center group">
               <p className="text-[10px] text-zinc-700 font-black tracking-[0.3em] uppercase mb-4">
                 Sistema de escaneo listo
               </p>
               {/* Este es el botón estético que pediste */}
               <label htmlFor="reader__dashboard_section_csr" className="cursor-pointer">
                 <span className="text-[11px] text-zinc-400 font-bold border-b border-zinc-800 pb-1 hover:text-red-500 hover:border-red-500 transition-all uppercase tracking-widest">
                   Activar Sensor Cámara
                 </span>
               </label>
             </div>
          ) : status !== 'loading' && (
            <button 
              onClick={resetScanner} 
              className="group flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2"
            >
              <div className="p-4 bg-zinc-900 rounded-full group-active:scale-90 transition-all border border-white/5">
                <RefreshCcw className="h-6 w-6 text-white" />
              </div>
              <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Siguiente</span>
            </button>
          )}
        </div>

        <footer className="mt-auto pb-6 text-center opacity-20">
          <p className="text-[7px] text-white font-bold tracking-[0.8em] uppercase">
            Powered by Nanquel Corbalán
          </p>
        </footer>
      </div>

      <style jsx global>{`
        /* LIMPIEZA ABSOLUTA PARA ESTÉTICA ROCK */
        #reader { border: none !important; position: relative; }
        #reader__scan_region { background: transparent !important; }
        #reader__scan_region video {
          object-fit: cover !important;
          border-radius: 0 !important;
        }

        /* Ocultamos todo el ruido visual nativo */
        #reader__status_span, 
        #reader header, 
        img[alt="Info icon"],
        #reader__dashboard_section_fs { 
          display: none !important; 
        }

        /* EL BOTÓN NATIVO: Lo volvemos invisible pero que ocupe el área del label */
        #reader__dashboard_section_csr button {
          opacity: 0 !important;
          position: absolute !important;
          z-index: -1 !important;
          pointer-events: none !important;
        }

        /* Si el botón nativo de permiso aparece, lo estilizamos para que se active vía el label del componente */
        #reader__dashboard_section_csr {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* Selector de cámara minimal */
        #reader__camera_selection {
          background: rgba(0,0,0,0.8);
          color: #555;
          border: 1px solid #222;
          border-radius: 20px;
          padding: 4px 10px;
          font-size: 9px;
          text-transform: uppercase;
          font-weight: 800;
          margin-top: 20px;
          outline: none;
        }
      `}</style>
    </div>
  )
}