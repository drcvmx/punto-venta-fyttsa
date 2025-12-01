"use client"

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface RegistroRapidoModalProps {
    open: boolean
    onClose: () => void
    codigoEscaneado: string
    tipoCodigo: 'BARRAS' | 'QR'
    tenantId: string
    businessType: 'abarrotes' | 'ferreteria' | 'restaurante'
    onProductoCreado: (producto: any) => void
    prefilledData?: any
}

export default function RegistroRapidoModal({
    open,
    onClose,
    codigoEscaneado,
    tipoCodigo,
    tenantId,
    businessType,
    onProductoCreado,
    prefilledData
}: RegistroRapidoModalProps) {
    const { user } = useAuth()
    const isEmployee = user?.role === 'tenant_user'

    const [formData, setFormData] = useState({
        nombre: '',
        nombreVariante: '',
        marca: '',
        categoria: '',
        proveedor: '',
        precio: '',
        costo: '',
        unidadMedida: 'PZA',
        descripcion: '',
        imagenUrl: '',
    })
    const [guardando, setGuardando] = useState(false)

    // Pre-llenar formulario con datos del catálogo global
    useEffect(() => {
        if (open && prefilledData) {
            console.log('📝 Pre-llenando formulario con datos:', prefilledData)

            setFormData(prev => ({
                ...prev,
                nombre: prefilledData.nombre || '',
                descripcion: prefilledData.descripcion || '',
                marca: prefilledData.marca || '',
                categoria: prefilledData.categoria || '',
                imagenUrl: prefilledData.imagenUrl || '',
            }))

            if (prefilledData.isFromGlobal) {
                toast.success("¡Producto encontrado en catálogo global! Datos pre-cargados.")
            }
        } else if (open && !prefilledData) {
            // Limpiar formulario si no hay datos pre-llenados
            setFormData({
                nombre: '',
                nombreVariante: '',
                marca: '',
                categoria: '',
                proveedor: '',
                precio: '',
                costo: '',
                unidadMedida: 'PZA',
                descripcion: '',
            })
        }
    }, [open, prefilledData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.nombre || !formData.precio || !formData.unidadMedida) {
            toast.error('Completa los campos requeridos')
            return
        }

        setGuardando(true)
        try {
            // Para restaurantes, auto-llenar marca y proveedor
            const marcaFinal = businessType === 'restaurante' ? 'Casa' : formData.marca
            const proveedorFinal = businessType === 'restaurante' ? 'Producción Propia' : formData.proveedor

            const payload = {
                codigoEscaneado,
                tipoCodigo,
                nombre: formData.nombre,
                nombreVariante: formData.nombreVariante || undefined,
                marca: marcaFinal || undefined,
                categoria: formData.categoria || undefined,
                proveedor: proveedorFinal || undefined,
                descripcion: formData.descripcion || undefined,
                precio: parseFloat(formData.precio),
                costo: formData.costo ? parseFloat(formData.costo) : undefined,
                unidadMedida: formData.unidadMedida,
                imagenUrl: formData.imagenUrl || undefined,
                globalProductId: prefilledData?.globalProductId || undefined,
            }

            if (isEmployee) {
                await api.post('/catalogo/requests', {
                    type: 'NEW_PRODUCT',
                    payload
                })
                toast.success('Solicitud de creación enviada al administrador')
            } else {
                const producto = await api.post('/catalogo/registro-rapido', payload)
                toast.success('Producto registrado exitosamente')
                onProductoCreado(producto)
            }

            onClose()

            // Limpiar form
            setFormData({
                nombre: '',
                nombreVariante: '',
                marca: '',
                categoria: '',
                proveedor: '',
                precio: '',
                costo: '',
                unidadMedida: 'PZA',
                descripcion: '',
            })
        } catch (error) {
            console.error('Error:', error)
            toast.error('Error al registrar producto')
        } finally {
            setGuardando(false)
        }
    }

    const isRestaurante = businessType === 'restaurante'

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isRestaurante ? '🍽️ Registrar Platillo Nuevo' : '📦 Registrar Producto Nuevo'}
                    </DialogTitle>
                    <DialogDescription>
                        Código escaneado: <strong>{codigoEscaneado}</strong> ({tipoCodigo})
                        {isEmployee && <span className="block text-amber-600 mt-1">⚠️ Como empleado, tu registro requerirá aprobación del dueño.</span>}
                        {prefilledData?.isFromGlobal && <span className="block text-green-600 mt-1">✅ Datos pre-cargados desde catálogo global</span>}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Información Básica */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Información Básica</h3>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <Label htmlFor="nombre">
                                    {isRestaurante ? 'Nombre del Platillo' : 'Nombre del Producto'} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="nombre"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder={isRestaurante ? 'Ej: Tacos al Pastor' : (businessType === 'ferreteria' ? 'Ej: Taladro Inalámbrico' : 'Ej: Coca Cola')}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="nombreVariante">
                                    {isRestaurante ? 'Porción/Tamaño' : 'Presentación/Variante'}
                                </Label>
                                <Input
                                    id="nombreVariante"
                                    value={formData.nombreVariante}
                                    onChange={(e) => setFormData({ ...formData, nombreVariante: e.target.value })}
                                    placeholder={isRestaurante ? 'Ej: Orden de 3' : (businessType === 'ferreteria' ? 'Ej: 1/2 pulgada' : 'Ej: 600ml')}
                                />
                            </div>

                            {/* Marca - Solo para productos comerciales */}
                            {!isRestaurante && (
                                <div>
                                    <Label htmlFor="marca">Marca</Label>
                                    <Input
                                        id="marca"
                                        value={formData.marca}
                                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                        placeholder={businessType === 'ferreteria' ? 'Ej: DeWalt' : 'Ej: Coca-Cola'}
                                    />
                                </div>
                            )}

                            <div>
                                <Label htmlFor="categoria">Categoría</Label>
                                <Input
                                    id="categoria"
                                    value={formData.categoria}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    placeholder={isRestaurante ? 'Ej: Platillos Fuertes' : (businessType === 'ferreteria' ? 'Ej: Herramientas Eléctricas' : 'Ej: Bebidas')}
                                />
                            </div>

                            {/* Proveedor - Solo para productos comerciales */}
                            {!isRestaurante && (
                                <div>
                                    <Label htmlFor="proveedor">Proveedor</Label>
                                    <Input
                                        id="proveedor"
                                        value={formData.proveedor}
                                        onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                                        placeholder={businessType === 'ferreteria' ? 'Ej: Truper' : 'Ej: Coca-Cola FEMSA'}
                                    />
                                </div>
                            )}

                            {/* Mensaje para restaurantes */}
                            {isRestaurante && (
                                <div className="col-span-2">
                                    <p className="text-sm text-muted-foreground italic">
                                        💡 Este platillo se registrará como producción propia de tu restaurante
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Precios */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Precios</h3>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <Label htmlFor="precio">
                                    Precio Venta <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    value={formData.precio}
                                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="costo">Precio Costo</Label>
                                <Input
                                    id="costo"
                                    type="number"
                                    step="0.01"
                                    value={formData.costo}
                                    onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <Label htmlFor="unidadMedida">
                                    Unidad <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={formData.unidadMedida}
                                    onValueChange={(value) => setFormData({ ...formData, unidadMedida: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PZA">Pieza</SelectItem>
                                        <SelectItem value="KG">Kilogramo</SelectItem>
                                        <SelectItem value="GR">Gramo</SelectItem>
                                        <SelectItem value="LT">Litro</SelectItem>
                                        <SelectItem value="ML">Mililitro</SelectItem>
                                        <SelectItem value="MT">Metro</SelectItem>
                                        <SelectItem value="CJA">Caja</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div>
                        <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                        <Input
                            id="descripcion"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Descripción adicional del producto"
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={guardando}>
                            {guardando ? 'Procesando...' : (isEmployee ? 'Solicitar Creación' : `Registrar ${isRestaurante ? 'Platillo' : 'Producto'}`)}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
