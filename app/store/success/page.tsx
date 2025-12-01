"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import { TicketView } from "@/components/ticket-view"

interface OrderItem {
    productName: string
    quantity: number
    price: string
}

interface Order {
    id: string
    collectionCode: string
    totalAmount: number
    customerName: string
    customerEmail: string
    status: string
    createdAt: string
    items: OrderItem[]
    storeId: number
}

export default function SuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get("orderId")
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!orderId) {
            router.push("/store")
            return
        }

        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/public/${orderId}`)
                setOrder(response)
            } catch (error) {
                console.error("Error fetching order:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId, router])

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        )
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Orden no encontrada</h1>
                <Link href="/store">
                    <Button>Volver a la tienda</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 flex flex-col items-center">
            <TicketView
                orderId={order.id}
                collectionCode={order.collectionCode}
                date={order.createdAt}
                customerName={order.customerName}
                items={order.items.map(item => ({
                    quantity: item.quantity,
                    productName: item.productName,
                    price: Number(item.price),
                    subtotal: Number(item.price) * item.quantity
                }))}
                total={Number(order.totalAmount)}
                storeName="Mi Tiendita" // TODO: Fetch from config
                storeAddress="Sucursal Principal" // TODO: Fetch from config
            />

            <div className="mt-8 flex gap-4 print:hidden">
                <Link href="/store">
                    <Button className="bg-[#002333] text-white hover:bg-[#002333]/90">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Seguir Comprando
                    </Button>
                </Link>
            </div>
        </div>
    )
}

