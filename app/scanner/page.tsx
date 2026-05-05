"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle2, XCircle, Loader2, RefreshCcw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [ticketData, setTicketData] = useState<any>(null)

  // 🔥 ref para evitar múltiples escaneos sin depender de estado "stale"
  const isProcessingRef = useRef(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    )

    scannerRef.current = scanner

    const onScanSuccess = (decodedText: string) => {
      if (isProcessingRef.current) return

      isProcessingRef.current = true
      setScanResult(decodedText)
      validarTicket(decodedText)
    }

    const onScanError = (err: any) => {
      // error silencioso (normal)
    }

    scanner.render(onScanSuccess, onScanError)

    // ✅ cleanup correcto (sin devolver Promise)
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
    setScanResult(null)
    setStatus("idle")
    setTicketData(null)
    setMessage("")
    isProcessingRef.current = false
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6">

        <header className="text-center">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold tracking-tighter">CONTROL DE ACCESO</h1>
          <p className="text-zinc-400 text-sm">Locura y Realidad - Staff</p>
        </header>

        {/* Lector QR */}
        <div className={`overflow-hidden rounded-2xl border-4 transition-colors ${
          status === 'success' ? 'border-green-500' : 
          status === 'error' ? 'border-red-500' : 'border-zinc-800'
        }`}>
          <div id="reader" className="bg-black"></div>
        </div>

        {/* Resultados */}
        {status !== "idle" && (
          <Card className={`border-none ${
            status === 'success' ? 'bg-green-900/20' : 
            status === 'error' ? 'bg-red-900/20' : 'bg-zinc-900'
          }`}>
            <CardContent className="pt-6 text-center space-y-4">
              
              {status === "loading" && (
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              )}

              {status === "success" && (
                <>
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h2 className="text-3xl font-black text-green-500">{message}</h2>
                    <p className="text-zinc-300 mt-2 font-bold uppercase">
                      {ticketData?.nombreCliente}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {ticketData?.eventoNombre}
                    </p>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                  <h2 className="text-3xl font-black text-red-500">{message}</h2>
                </>
              )}

              <Button onClick={resetScanner} variant="outline" className="w-full mt-4">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Escanear Siguiente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}