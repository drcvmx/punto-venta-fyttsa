"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Share2, Printer } from "lucide-react"
import Barcode from "react-barcode"

interface OrderItem {
    quantity: number
    productName: string
    price: number
    subtotal: number
}

interface TicketViewProps {
    orderId: string
    collectionCode?: string
    date: string
    customerName?: string
    items: OrderItem[]
    total: number
    storeName?: string
    storeAddress?: string
}

export function TicketView({
    orderId,
    collectionCode,
    date,
    customerName = "Cliente General",
    items,
    total,
    storeName = "Mi Tienda",
    storeAddress = "Dirección de la tienda"
}: TicketViewProps) {
    const ticketRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Ticket de Compra - ${storeName}`,
                    text: `Ticket de compra por $${total.toFixed(2)}`,
                    url: window.location.href,
                })
            } catch (error) {
                console.log('Error sharing:', error)
            }
        }
    }

    return (
        <div className="max-w-md mx-auto space-y-4">
            <Card className="w-full bg-white shadow-lg print:shadow-none" ref={ticketRef}>
                <CardHeader className="text-center border-b border-dashed pb-4">
                    <CardTitle className="text-xl font-bold uppercase">{storeName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{storeAddress}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                        <p>{new Date(date).toLocaleString()}</p>
                        <p>Orden: #{orderId.slice(0, 8)}</p>
                    </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                        <div className="grid grid-cols-12 text-xs font-bold text-muted-foreground uppercase border-b pb-1">
                            <div className="col-span-1">Cant</div>
                            <div className="col-span-7">Producto</div>
                            <div className="col-span-4 text-right">Total</div>
                        </div>
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 text-sm">
                                <div className="col-span-1 font-medium">{item.quantity}</div>
                                <div className="col-span-7 truncate pr-2">{item.productName}</div>
                                <div className="col-span-4 text-right">${Number(item.subtotal).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4 border-dashed" />

                    <div className="flex justify-center py-4">
                        <div className="flex justify-center py-4 flex-col items-center gap-2">
                            <Barcode value={collectionCode || orderId.slice(0, 12)} format="CODE128" width={1.5} height={50} fontSize={14} />
                            <p className="text-[10px] text-muted-foreground">Código de Recolección</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-lg font-bold">
                            <span>TOTAL</span>
                            <span>${Number(total).toFixed(2)}</span>
                        </div>
                        <div className="text-center mt-4 space-y-2">
                            <p className="text-xs text-muted-foreground">
                                ¡Gracias por su compra!
                            </p>
                            <p className="text-[10px] text-gray-400 italic border-t pt-2">
                                Este ticket es de uso interno para control de inventario y entrega. No es un comprobante fiscal.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center gap-2 pt-4 bg-gray-50 rounded-b-lg print:hidden">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir / Guardar PDF
                    </Button>
                </CardFooter>
            </Card>

            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none, .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
        </div>
    )
}
