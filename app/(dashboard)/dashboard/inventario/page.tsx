"use client"

import { useState } from 'react'
import { useBusinessContext } from '@/lib/business-context'
import { useAuth } from '@/contexts/AuthContext'
import ProductoScanner from '@/components/producto-scanner'
import RegistroRapidoModal from '@/components/registro-rapido-modal'
import { ProductSelectionModal } from '@/components/product-selection-modal'
import { EditProductModal } from '@/components/edit-product-modal'
import AprobacionesTab from '@/components/aprobaciones-tab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClipboardList, Clock, FileCheck, Package, Plus, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface ProductoContado {
    producto: any
    cantidad: number
    timestamp: string
}

export default function InventarioPage() {
    const { selectedBusiness } = useBusinessContext()
    const { user } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [selectionModalOpen, setSelectionModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [selectedProductToEdit, setSelectedProductToEdit] = useState<any>(null)
    const [codigoNoEncontrado, setCodigoNoEncontrado] = useState({ codigo: '', tipo: 'BARRAS' as 'BARRAS' | 'QR' })
    const [productosContados, setProductosContados] = useState<ProductoContado[]>([])

    if (!selectedBusiness) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Selecciona un negocio primero</p>
            </div>
        )
    }

    const isAdmin = user?.role === 'tenant_admin' || user?.role === 'super_admin'

    const handleProductFound = (producto: any) => {
        const nuevoConteo: ProductoContado = {
            producto,
            cantidad: 1,
            timestamp: new Date().toLocaleTimeString(),
        }
        setProductosContados(prev => [nuevoConteo, ...prev])
    }

    const [prefilledData, setPrefilledData] = useState<any>(null)

    const handleProductNotFound = (codigo: string, tipoCodigo: 'BARRAS' | 'QR', data?: any) => {
        setCodigoNoEncontrado({ codigo, tipo: tipoCodigo })
        setPrefilledData(data)
        setModalOpen(true)
    }

    const handleProductoCreado = (producto: any) => {
        const nuevoConteo: ProductoContado = {
            producto,
            cantidad: 1,
            timestamp: new Date().toLocaleTimeString(),
        }
        setProductosContados(prev => [nuevoConteo, ...prev])
    }

    const handleFinalizarInventario = async () => {
        if (productosContados.length === 0) {
            toast.error("No hay productos contados para guardar")
            return
        }

        try {
            const items = productosContados.map(p => ({
                varianteId: p.producto.variantes[0].id, // Asumimos primera variante por ahora
                cantidad: p.cantidad
            }))

            const response = await api.post('/inventario/fisico', { items })

            toast.success(response.message || "Inventario guardado correctamente")
            setProductosContados([]) // Limpiar lista

        } catch (error) {
            console.error('Error guardando inventario:', error)
            toast.error("Error al guardar el inventario")
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#002333]">📦 Gestión de Inventario</h1>
                    <p className="text-[#002333]/70 mt-1">
                        {selectedBusiness.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && (
                        <Button variant="outline" onClick={() => setSelectionModalOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Producto
                        </Button>
                    )}
                    <Button onClick={() => {
                        setCodigoNoEncontrado({ codigo: '', tipo: 'BARRAS' })
                        setModalOpen(true)
                    }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Producto
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="fisico" className="w-full">
                <TabsList>
                    <TabsTrigger value="fisico">Inventario Físico</TabsTrigger>
                    {isAdmin && <TabsTrigger value="aprobaciones">Aprobaciones</TabsTrigger>}
                </TabsList>

                <TabsContent value="fisico" className="space-y-6 mt-6">
                    {/* Scanner */}
                    <Card className="border-[#159A9C]/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#159A9C]" />
                                Escáner de Productos
                            </CardTitle>
                            <CardDescription>
                                Escanea el código de barras o QR del producto
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProductoScanner
                                tenantId={selectedBusiness.tenantId}
                                onProductFound={handleProductFound}
                                onProductNotFound={handleProductNotFound}
                                placeholder="Escanea código de barras o QR..."
                            />
                        </CardContent>
                    </Card>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-[#159A9C]/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[#002333]/70">Productos Contados</p>
                                        <p className="text-2xl font-bold text-[#159A9C]">
                                            {productosContados.length}
                                        </p>
                                    </div>
                                    <FileCheck className="h-8 w-8 text-[#159A9C]" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#002333]/30">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[#002333]/70">Hora Inicio</p>
                                        <p className="text-xl font-bold text-[#002333]">
                                            {new Date().toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <Clock className="h-8 w-8 text-[#002333]" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-[#B4BEC9]/30">
                            <CardContent className="pt-6">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={handleFinalizarInventario}
                                    disabled={productosContados.length === 0}
                                >
                                    Finalizar Inventario
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lista de Productos Contados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Escaneados</CardTitle>
                            <CardDescription>
                                Lista de productos contados en esta sesión
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {productosContados.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                    <p>No hay productos contados aún</p>
                                    <p className="text-sm">Escanea un producto para comenzar</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {productosContados.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-[#002333]">
                                                    {item.producto.nombre}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.producto.marca && `${item.producto.marca} • `}
                                                    {item.producto.categoria}
                                                </p>
                                                {item.producto.variantes && item.producto.variantes.length > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {item.producto.variantes[0].nombreVariante} - $
                                                        {item.producto.variantes[0].precio}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline">{item.timestamp}</Badge>
                                                <Badge className="bg-[#159A9C] hover:bg-[#159A9C]/90">
                                                    x{item.cantidad}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="aprobaciones" className="mt-6">
                        <AprobacionesTab />
                    </TabsContent>
                )}
            </Tabs>

            {/* Modal de Registro Rápido */}
            <RegistroRapidoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                codigoEscaneado={codigoNoEncontrado.codigo}
                tipoCodigo={codigoNoEncontrado.tipo}
                tenantId={selectedBusiness.tenantId}
                businessType={selectedBusiness.type}
                onProductoCreado={handleProductoCreado}
                prefilledData={prefilledData}
            />

            {/* Modales de Edición */}
            <ProductSelectionModal
                isOpen={selectionModalOpen}
                onClose={() => setSelectionModalOpen(false)}
                onSelect={(product) => {
                    setSelectedProductToEdit(product)
                    setSelectionModalOpen(false)
                    setEditModalOpen(true)
                }}
            />

            <EditProductModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                product={selectedProductToEdit}
                onSuccess={() => {
                    // Opcional: refrescar lista si fuera necesario
                }}
            />
        </div>
    )
}
