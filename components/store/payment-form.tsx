"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, Lock } from "lucide-react"
import { toast } from "sonner"

declare global {
    interface Window {
        OpenPay: any
    }
}

interface PaymentFormProps {
    amount: number
    onPaymentSuccess: (token: string, deviceSessionId: string) => void
    isProcessing: boolean
}

export function PaymentForm({ amount, onPaymentSuccess, isProcessing }: PaymentFormProps) {
    const [isSdkLoaded, setIsSdkLoaded] = useState(false)
    const [isDeviceDataLoaded, setIsDeviceDataLoaded] = useState(false)
    const [cardData, setCardData] = useState({
        holderName: "",
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        cvv: "",
    })

    const merchantId = process.env.NEXT_PUBLIC_OPENPAY_MERCHANT_ID
    const publicKey = process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY
    const isProduction = process.env.NEXT_PUBLIC_OPENPAY_PRODUCTION === 'true'

    console.log("DEBUG: Merchant ID loaded?", !!merchantId, merchantId?.substring(0, 4) + '...');
    console.log("DEBUG: Public Key loaded?", !!publicKey, publicKey?.substring(0, 4) + '...');


    useEffect(() => {
        if (isSdkLoaded && isDeviceDataLoaded && window.OpenPay && window.OpenPay.deviceData) {
            window.OpenPay.setId(merchantId)
            window.OpenPay.setApiKey(publicKey)
            window.OpenPay.setSandboxMode(!isProduction)

            try {
                // Generar device session id
                const deviceSessionId = window.OpenPay.deviceData.setup("payment-form", "deviceIdHiddenFieldName");
                console.log("Device Session ID generated:", deviceSessionId);
            } catch (error) {
                console.error("Error setting up device data:", error);
            }
        }
    }, [isSdkLoaded, isDeviceDataLoaded, merchantId, publicKey, isProduction])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCardData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!isSdkLoaded || !window.OpenPay) {
            toast.error("El sistema de pagos no está listo. Intenta recargar la página.")
            return
        }

        // Ensure device data is ready or fallback
        let deviceSessionId = "k_guid_fallback"; // Fallback if setup failed or not ready
        if (window.OpenPay.deviceData) {
            deviceSessionId = window.OpenPay.deviceData.setup();
        }

        const tokenRequest = {
            card_number: cardData.cardNumber.replace(/\s/g, ""),
            holder_name: cardData.holderName,
            expiration_year: cardData.expirationYear,
            expiration_month: cardData.expirationMonth,
            cvv2: cardData.cvv,
        }

        window.OpenPay.token.create(
            tokenRequest,
            (response: any) => {
                const tokenId = response.data.id
                console.log("Token created successfully:", tokenId)
                onPaymentSuccess(tokenId, deviceSessionId)
            },
            (error: any) => {
                console.error("Token creation error (Full):", error)
                console.error("Token creation error (Data):", error.data)
                console.error("Token creation error (Message):", error.message)

                const errorMessage = error.data?.description || error.message || "Error desconocido al procesar la tarjeta";
                toast.error("Error al procesar la tarjeta: " + errorMessage)
            }
        )
    }

    return (
        <>
            <Script
                src="https://js.openpay.mx/openpay.v1.min.js"
                onLoad={() => setIsSdkLoaded(true)}
            />
            <Script
                src="https://js.openpay.mx/openpay-data.v1.min.js"
                onLoad={() => setIsDeviceDataLoaded(true)}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Pago con Tarjeta
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="holderName">Nombre del Titular</Label>
                            <Input
                                id="holderName"
                                name="holderName"
                                placeholder="Como aparece en la tarjeta"
                                value={cardData.holderName}
                                onChange={handleInputChange}
                                required
                                autoComplete="cc-name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                            <Input
                                id="cardNumber"
                                name="cardNumber"
                                placeholder="0000 0000 0000 0000"
                                value={cardData.cardNumber}
                                onChange={handleInputChange}
                                maxLength={19}
                                required
                                autoComplete="cc-number"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expirationMonth">Mes (MM)</Label>
                                <Input
                                    id="expirationMonth"
                                    name="expirationMonth"
                                    placeholder="MM"
                                    value={cardData.expirationMonth}
                                    onChange={handleInputChange}
                                    maxLength={2}
                                    required
                                    autoComplete="cc-exp-month"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expirationYear">Año (YY)</Label>
                                <Input
                                    id="expirationYear"
                                    name="expirationYear"
                                    placeholder="YY"
                                    value={cardData.expirationYear}
                                    onChange={handleInputChange}
                                    maxLength={2}
                                    required
                                    autoComplete="cc-exp-year"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <div className="relative">
                                    <Input
                                        id="cvv"
                                        name="cvv"
                                        type="password"
                                        placeholder="123"
                                        value={cardData.cvv}
                                        onChange={handleInputChange}
                                        maxLength={4}
                                        required
                                        autoComplete="cc-csc"
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isProcessing || !isSdkLoaded || !isDeviceDataLoaded}>
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                `Pagar $${amount.toFixed(2)}`
                            )}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                            <Lock className="h-3 w-3" />
                            Pagos seguros procesados por Openpay
                        </p>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}
