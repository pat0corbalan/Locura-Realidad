"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle2, XCircle, Loader2, Scan, User, Ticket, AlertTriangle } from "lucide-react"
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
        fps: 20, 
        qrbox: { width: 250, height: 250 },
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
        setMessage("ACCESO PERMITIDO")
        setTicketData(data.ticket)
      } else {
        setStatus("error")
        setMessage(data.error || "TICKET INVÁLIDO")
      }
    } catch (error) {
      setStatus("error")
      setMessage("SIN CONEXIÓN")
    }
  }

  const resetScanner = () => {
    setStatus("idle")
    setTicketData(null)
    setMessage("")
    isProcessingRef.current = false
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center p-4 font-sans">
      
      {/* Header oficial del Tour */}
      <header className="w-full max-w-md pt-8 pb-6 text-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-white">
          LOCURA Y REALIDAD <span className="text-red-600">TOUR</span>
        </h1>
        <div className="flex justify-center gap-2 mt-2">
          <Badge className="bg-zinc-800 text-zinc-400 border-none hover:bg-zinc-800">STAFF ONLY</Badge>
          <Badge className="bg-red-600 text-white border-none animate-pulse uppercase text-[10px]">Control en Vivo</Badge>
        </div>
      </header>

      <main className="w-full max-w-md flex-1 flex flex-col gap-6">
        
        {/* Contenedor del Scanner / Resultados */}
        <div className={`relative rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]
          ${status === 'success' ? 'border-green-500 bg-green-950/20' : 
            status === 'error' ? 'border-red-600 bg-red-950/20' : 
            'border-zinc-800 bg-zinc-900/50'}`}>
          
          {status === "idle" && (
            <div className="p-4">
              <div id="reader" className="overflow-hidden rounded-2xl bg-black"></div>
              <div className="py-6 flex flex-col items-center gap-2">
                <Scan className="text-zinc-600 animate-pulse" />
                <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Esperando Código QR...</p>
              </div>
            </div>
          )}

          {(status !== "idle") && (
            <div className="p-8 flex flex-col items-center justify-center min-h-[350px] animate-in fade-in zoom-in duration-200">
              
              {status === "loading" && (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-red-600" />
                  <p className="font-black italic tracking-widest uppercase">Consultando base...</p>
                </div>
              )}

              {status === "success" && (
                <div className="w-full space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-green-500 rounded-full p-3 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                      <CheckCircle2 size={48} className="text-black" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-4xl font-black italic text-green-500 leading-none mb-2">{message}</h2>
                    <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] uppercase">Entrada verificada</p>
                  </div>

                  <div className="bg-black/60 rounded-2xl p-5 space-y-3 border border-white/5">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-zinc-500" />
                      <span className="font-bold text-lg uppercase truncate">{ticketData?.nombreCliente}</span>
                    </div>
                    <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                      <Ticket size={18} className="text-zinc-500" />
                      <span className="text-sm font-medium text-zinc-300 uppercase">{ticketData?.eventoNombre || "Ticket General"}</span>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="w-full space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="bg-red-600 rounded-full p-3 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                      <XCircle size={48} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black italic text-red-600 leading-none mb-2">{message}</h2>
                    <div className="flex items-center justify-center gap-2 text-zinc-400">
                      <AlertTriangle size={14} />
                      <p className="text-xs font-bold uppercase tracking-wider">Acceso Denegado</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={resetScanner} 
                className={`w-full mt-8 h-14 rounded-xl font-black italic tracking-wider transition-transform active:scale-95
                  ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-white text-black hover:bg-zinc-200'}`}
              >
                REINTENTAR / SIGUIENTE
              </Button>
            </div>
          )}
        </div>

        {/* Info de sesión o logs rápidos (opcional) */}
        <div className="mt-auto pb-6 text-center">
          <p className="text-[9px] text-zinc-700 font-bold tracking-[.4em] uppercase">
            Locura y Realidad — Terminal de Acceso
          </p>
        </div>
      </main>

      <style jsx global>{`
        #reader { border: none !important; }
        #reader video { border-radius: 1rem; object-fit: cover; }
        #reader__dashboard { display: none !important; }
        button { text-transform: uppercase; }
      `}</style>
    </div>
  )
}