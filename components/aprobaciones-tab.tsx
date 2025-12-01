"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Package, ClipboardList } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function AprobacionesTab() {
    const [productRequests, setProductRequests] = useState<any[]>([])
    const [inventoryChanges, setInventoryChanges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [reqs, changes] = await Promise.all([
                api.get('/catalogo/requests'),
                api.get('/inventario/pendientes')
            ])
            setProductRequests(reqs || [])
            setInventoryChanges(changes || [])
        } catch (error) {
            console.error("Error fetching approvals:", error)
            toast.error("Error al cargar aprobaciones")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleApproveRequest = async (id: string) => {
        try {
            await api.post(`/catalogo/requests/${id}/approve`, {})
            toast.success("Solicitud aprobada")
            fetchData()
        } catch (error) {
            toast.error("Error al aprobar solicitud")
        }
    }

    const handleApproveInventory = async (id: string) => {
        try {
            await api.patch(`/inventario/changes/${id}/approve`, {})
            toast.success("Cambio de inventario aprobado")
            fetchData()
        } catch (error) {
            toast.error("Error al aprobar cambio")
        }
    }

    if (loading) return <div>Cargando aprobaciones...</div>

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            Solicitudes de Productos
                        </CardTitle>
                        <CardDescription>
                            Nuevos productos o cambios de precio solicitados por empleados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {productRequests.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No hay solicitudes pendientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {productRequests.map(req => (
                                    <div key={req.id} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="outline">{req.type}</Badge>
                                                <p className="font-medium mt-1">
                                                    {req.payload.nombre || "Producto sin nombre"}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {req.payload.descripcion}
                                                </p>
                                                <div className="text-sm mt-2">
                                                    Precio: <span className="font-bold">${req.payload.precio}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleApproveRequest(req.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-emerald-600" />
                            Ajustes de Inventario
                        </CardTitle>
                        <CardDescription>
                            Conteos físicos y ajustes pendientes de revisión
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {inventoryChanges.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No hay ajustes pendientes.</p>
                        ) : (
                            <div className="space-y-4">
                                {inventoryChanges.map(change => (
                                    <div key={change.id} className="border rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge variant="secondary">{change.changeType}</Badge>
                                                <p className="font-medium mt-1">
                                                    {change.variante?.producto?.nombre} - {change.variante?.nombreVariante}
                                                </p>
                                                <div className="flex gap-4 text-sm mt-2">
                                                    <div>
                                                        Anterior: <span className="font-mono">{change.cantidadAnterior}</span>
                                                    </div>
                                                    <div>
                                                        Nuevo: <span className="font-bold text-emerald-600">{change.cantidadNueva}</span>
                                                    </div>
                                                    <div>
                                                        Dif: <span className={change.diferencia < 0 ? "text-red-500" : "text-green-500"}>
                                                            {change.diferencia > 0 ? '+' : ''}{change.diferencia}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleApproveInventory(change.id)}>
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Aprobar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
