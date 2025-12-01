"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Html5QrcodeScanner } from "html5-qrcode"
import { CheckCircle2, XCircle, Scan, Keyboard } from "lucide-react"

export default function VerifyOrderPage() {
    const [scannedCode, setScannedCode] = useState("")
    const [verifying, setVerifying] = useState(false)
    const [lastVerifiedOrder, setLastVerifiedOrder] = useState<any>(null)
    const [showScanner, setShowScanner] = useState(false)
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input on load for barcode scanners
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    const handleVerify = async (code: string) => {
        if (!code || verifying) return
        setVerifying(true)

        try {
            const res = await api.post("/orders/verify-qr", { code })

            if (res.success) {
                setLastVerifiedOrder(res.order)
                toast.success("¡Orden verificada y entregada!")
                // Play success sound if possible
                new Audio('/success.mp3').play().catch(() => { })
            } else {
                toast.error(res.message || "Código inválido")
                setLastVerifiedOrder(null)
            }
        } catch (error) {
            console.error("Verification error:", error)
            toast.error("Error al verificar código")
        } finally {
            setVerifying(false)
            setScannedCode("")
            // Refocus for next scan
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleVerify(scannedCode)
        }
    }

    // Initialize QR Scanner
    useEffect(() => {
        if (showScanner && !scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            )

            scanner.render((decodedText) => {
                handleVerify(decodedText)
                // Optional: Pause scanning after success?
            }, (error) => {
                // Ignore errors
            })

            scannerRef.current = scanner
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
                scannerRef.current = null
            }
        }
    }, [showScanner])

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-[#002333]">Verificar Entregas</h1>

            <div className="grid gap-6">
                {/* Manual/Barcode Input */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Keyboard className="h-5 w-5" />
                            Escáner de Código de Barras / Manual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Escanea o escribe el código..."
                                value={scannedCode}
                                onChange={(e) => setScannedCode(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="text-lg font-mono"
                                autoFocus
                            />
                            <Button
                                onClick={() => handleVerify(scannedCode)}
                                disabled={verifying || !scannedCode}
                                className="bg-[#159A9C]"
                            >
                                {verifying ? "..." : "Verificar"}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            El cursor debe estar en el campo para usar la pistola de códigos.
                        </p>
                    </CardContent>
                </Card>

                {/* QR Scanner Toggle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Scan className="h-5 w-5" />
                                Escáner QR (Cámara)
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowScanner(!showScanner)}
                            >
                                {showScanner ? "Ocultar Cámara" : "Activar Cámara"}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    {showScanner && (
                        <CardContent>
                            <div id="reader" className="w-full"></div>
                        </CardContent>
                    )}
                </Card>

                {/* Result Display */}
                {lastVerifiedOrder && (
                    <Card className="bg-[#DEEFE7] border-[#159A9C]">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <CheckCircle2 className="h-10 w-10 text-[#159A9C]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#002333] mb-2">¡Entrega Exitosa!</h2>
                            <p className="text-lg font-medium">{lastVerifiedOrder.customerName}</p>
                            <p className="text-gray-600 mb-4">
                                Orden #{lastVerifiedOrder.collectionCode || lastVerifiedOrder.id.slice(0, 8)}
                            </p>

                            <div className="bg-white/50 p-4 rounded-lg inline-block text-left w-full max-w-xs">
                                <div className="flex justify-between font-bold text-lg border-b border-gray-300 pb-2 mb-2">
                                    <span>Total:</span>
                                    <span>${Number(lastVerifiedOrder.totalAmount).toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-500 text-center">
                                    {new Date().toLocaleString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
