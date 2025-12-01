"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface SalesReportItem {
    tenantId: string
    totalSales: string
    orderCount: string
}

export default function AdminSalesPage() {
    const [sales, setSales] = useState<SalesReportItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSales()
    }, [])

    const fetchSales = async () => {
        try {
            const res = await api.get('/orders/admin/sales-report')
            setSales(res.data)
        } catch (error) {
            console.error("Error fetching sales report:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsPaid = async (tenantId: string) => {
        if (!confirm("¿Estás seguro de marcar todas las ventas pendientes de esta tienda como PAGADAS?")) return

        try {
            await api.post('/orders/admin/payout', { tenantId })
            toast.success("Ventas marcadas como pagadas")
            fetchSales() // Refresh list
        } catch (error) {
            console.error("Error marking as paid:", error)
            toast.error("Error al marcar como pagado")
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Reporte de Ventas Global</h1>
                <div className="text-sm text-muted-foreground">
                    Panel de Super Admin
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ventas por Tienda (Acumulado)</CardTitle>
                </CardHeader>
                <CardContent>
                    {sales.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No hay ventas registradas aún.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tenant ID</TableHead>
                                    <TableHead className="text-right">Ventas Totales</TableHead>
                                    <TableHead className="text-center"># Órdenes</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.tenantId}>
                                        <TableCell className="font-mono text-xs">{sale.tenantId}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${Number(sale.totalSales).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">{sale.orderCount}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(sale.tenantId)}>
                                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                                Marcar Pagado
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
