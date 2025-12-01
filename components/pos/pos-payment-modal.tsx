"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Banknote, CreditCard, Loader2 } from "lucide-react"
import { PaymentForm } from "@/components/store/payment-form"
import { toast } from "sonner"

interface PosPaymentModalProps {
    isOpen: boolean
    onClose: () => void
    total: number
    items: Array<{
        id: string
        name: string
        quantity: number
        price: number
    }>
    customer: {
        name: string
        email: string
    } | null
    onCashPayment: (amount: number) => Promise<void>
    onCardPayment: (token: string, deviceSessionId: string) => Promise<void>
}

export function PosPaymentModal({
    isOpen,
    onClose,
    total,
    items,
    customer,
    onCashPayment,
    onCardPayment,
}: PosPaymentModalProps) {
    const [cashAmount, setCashAmount] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState("cash")

    const calculateChange = () => {
        const payment = parseFloat(cashAmount) || 0
        return payment - total
    }

    const handleCashPayment = async () => {
        const payment = parseFloat(cashAmount) || 0

        if (payment < total) {
            toast.error("El monto es insuficiente")
            return
        }

        // Cliente ya no es obligatorio para efectivo

        setIsProcessing(true)
        try {
            await onCashPayment(payment)
            setCashAmount("")
            onClose()
        } catch (error) {
            console.error("Cash payment error:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCardPaymentSuccess = async (token: string, deviceSessionId: string) => {
        // Cliente ya no es obligatorio

        setIsProcessing(true)
        try {
            await onCardPayment(token, deviceSessionId)
            onClose()
        } catch (error) {
            console.error("Card payment error:", error)
        } finally {
            setIsProcessing(false)
        }
    }

    // Quick amount buttons for cash
    const quickAmounts = [100, 200, 500, 1000]

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-[#002333]">
                        Procesar Pago
                    </DialogTitle>
                </DialogHeader>

                <div className="mb-4 p-4 bg-[#DEEFE7] rounded-lg border border-[#159A9C]/30">
                    <div className="flex justify-between items-center">
                        <span className="text-[#002333]/70 text-lg">Total a cobrar:</span>
                        <span className="text-[#159A9C] text-3xl font-bold">${total.toFixed(2)}</span>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="cash" className="data-[state=active]:bg-[#159A9C] data-[state=active]:text-white">
                            <Banknote className="h-4 w-4 mr-2" />
                            Efectivo
                        </TabsTrigger>
                        <TabsTrigger value="card" className="data-[state=active]:bg-[#159A9C] data-[state=active]:text-white">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Tarjeta
                        </TabsTrigger>
                    </TabsList>

                    {/* Cash Payment Tab */}
                    <TabsContent value="cash" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label className="text-[#002333]/70">Importe Recibido</Label>
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={cashAmount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Permitir solo números y un punto decimal
                                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                        setCashAmount(value);
                                    }
                                }}
                                placeholder="0.00"
                                className="text-right text-2xl font-semibold border-[#B4BEC9]/50 focus:border-[#159A9C]"
                            />
                        </div>

                        {/* Quick amount buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    onClick={() => setCashAmount(amount.toString())}
                                    className="border-[#159A9C] text-[#159A9C] hover:bg-[#159A9C]/10"
                                >
                                    ${amount}
                                </Button>
                            ))}
                        </div>

                        {/* Change Display */}
                        {cashAmount && (
                            <div className="p-4 bg-[#DEEFE7] rounded-lg border border-[#159A9C]/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#002333] font-medium text-lg">Cambio:</span>
                                    <span className={`text-2xl font-bold ${calculateChange() >= 0 ? 'text-[#159A9C]' : 'text-red-500'}`}>
                                        ${calculateChange() >= 0 ? calculateChange().toFixed(2) : "Insuficiente"}
                                    </span>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleCashPayment}
                            disabled={isProcessing || parseFloat(cashAmount) < total}
                            className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white text-lg h-12"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Banknote className="mr-2 h-5 w-5" />
                                    Cobrar Efectivo
                                </>
                            )}
                        </Button>
                    </TabsContent>

                    {/* Card Payment Tab */}
                    <TabsContent value="card" className="mt-4">
                        <PaymentForm
                            amount={total}
                            onPaymentSuccess={handleCardPaymentSuccess}
                            isProcessing={isProcessing}
                            customerName={customer?.name || "Cliente General"}
                            customerEmail={customer?.email || "cliente@general.com"}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
