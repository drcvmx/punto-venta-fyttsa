"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, XCircle, Search, PackageCheck } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface OrderValidatorProps {
    isOpen: boolean
    onClose: () => void
}

export function OrderValidator({ isOpen, onClose }: OrderValidatorProps) {
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [order, setOrder] = useState<any>(null)
    const [isDelivering, setIsDelivering] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        } else {
            setCode("")
            setOrder(null)
        }
    }, [isOpen])

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!code.trim()) return

        setIsLoading(true)
        setOrder(null)

        try {
            const cleanCode = code.trim().replace(/^#/, '').toUpperCase()
            const result = await api.get(`/orders/validate/${cleanCode}`)
            setOrder(result)
        } catch (error: any) {
            toast.error(error.message || "Código inválido o no encontrado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeliver = async () => {
        if (!order) return

        setIsDelivering(true)
        try {
            await api.post(`/orders/${order.id}/deliver`, {})
            toast.success("Orden marcada como entregada")
            setOrder({ ...order, status: 'completed' })
        } catch (error: any) {
            toast.error(error.message || "Error al marcar como entregada")
        } finally {
            setIsDelivering(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">PAGADO</span>
            case 'pending_payment':
                return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">PENDIENTE DE PAGO</span>
            case 'completed':
                return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">ENTREGADO</span>
            default:
                return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">{status}</span>
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PackageCheck className="h-6 w-6 text-[#159A9C]" />
                        Validar Entrega (Click & Collect)
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!order ? (
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="code" className="sr-only">Código de Colección</Label>
                                <Input
                                    id="code"
                                    ref={inputRef}
                                    placeholder="Escanear código de barras (12 dígitos)"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="text-lg tracking-widest font-mono"
                                    maxLength={12}
                                    autoComplete="off"
                                />
                            </div>
                            <Button type="submit" disabled={isLoading || !code.trim()} className="bg-[#159A9C]">
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg border">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg">{order.customerName || "Cliente General"}</h3>
                                        <p className="text-sm text-gray-500">Orden #{order.collectionCode}</p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                <div className="border-t my-2 pt-2">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Productos:</p>
                                    <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
                                        {order.items?.map((item: any, i: number) => (
                                            <li key={i} className="flex justify-between">
                                                <span>{item.quantity}x {item.productName}</span>
                                                <span className="font-mono">${Number(item.subtotal).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-2 border-t font-bold text-lg">
                                    <span>Total</span>
                                    <span>${Number(order.totalAmount).toFixed(2)}</span>
                                </div>
                            </div>

                            {order.status === 'paid' ? (
                                <Button
                                    onClick={handleDeliver}
                                    disabled={isDelivering}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                                >
                                    {isDelivering ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Confirmar Entrega
                                        </>
                                    )}
                                </Button>
                            ) : order.status === 'completed' ? (
                                <div className="text-center p-4 bg-green-50 text-green-700 rounded-lg font-bold flex items-center justify-center gap-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    Esta orden ya fue entregada
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded-lg font-bold flex items-center justify-center gap-2">
                                    <XCircle className="h-5 w-5" />
                                    Orden pendiente de pago
                                </div>
                            )}

                            <Button variant="ghost" onClick={() => setOrder(null)} className="w-full">
                                Buscar otro código
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
