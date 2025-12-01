"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scan, X } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface ProductoScannerProps {
    onProductFound: (producto: any) => void
    onProductNotFound: (codigo: string, tipoCodigo: 'BARRAS' | 'QR', prefilledData?: any) => void
    tenantId: string
    placeholder?: string
}

export default function ProductoScanner({
    onProductFound,
    onProductNotFound,
    tenantId,
    placeholder = "Escanea o ingresa código..."
}: ProductoScannerProps) {
    const [codigo, setCodigo] = useState('')
    const [buscando, setBuscando] = useState(false)

    const buscarProducto = async (codigoEscaneado: string) => {
        if (!codigoEscaneado.trim()) return

        setBuscando(true)
        try {
            // PASO 1: Buscar en productos locales del tenant
            const response = await api.get(`/catalogo/buscar-codigo?codigo=${encodeURIComponent(codigoEscaneado)}`)

            if (response && !response.isGlobal) {
                // Producto local encontrado
                toast.success(`Producto encontrado: ${response.nombre}`)
                onProductFound(response)
                setCodigo('')
                return
            }

            // PASO 2: Si no se encontró localmente, buscar en catálogo global
            console.log('🔍 Buscando en catálogo global:', codigoEscaneado)
            const { globalProductsApi } = await import('@/lib/api-services/global-products')
            const globalProduct = await globalProductsApi.searchByBarcode(codigoEscaneado)

            console.log('📦 Resultado catálogo global:', globalProduct)

            if (globalProduct) {
                // Producto encontrado en catálogo global
                toast.info(`Producto "${globalProduct.nombre}" encontrado en catálogo global`)
                const tipoCodigo = codigoEscaneado.startsWith('QR-') ? 'QR' : 'BARRAS'

                // Pasar datos pre-llenados del catálogo global
                const prefilledData = {
                    nombre: globalProduct.nombre,
                    descripcion: globalProduct.descripcion,
                    marca: globalProduct.marca,
                    categoria: globalProduct.categoria,
                    imagenUrl: globalProduct.imagenUrl,
                    globalProductId: globalProduct.id,
                    isFromGlobal: true
                }

                console.log('✅ Datos a pre-llenar:', prefilledData)
                onProductNotFound(codigoEscaneado, tipoCodigo, prefilledData)
                setCodigo('')
                return
            }

            // PASO 3: No encontrado en ningún lado
            const tipoCodigo = codigoEscaneado.startsWith('QR-') ? 'QR' : 'BARRAS'
            toast.info('Producto no encontrado. Registra uno nuevo.')
            onProductNotFound(codigoEscaneado, tipoCodigo)
            setCodigo('')

        } catch (error) {
            console.error('Error buscando producto:', error)
            const tipoCodigo = codigoEscaneado.startsWith('QR-') ? 'QR' : 'BARRAS'
            toast.error('Error al buscar producto')
            onProductNotFound(codigoEscaneado, tipoCodigo)
            setCodigo('')
        } finally {
            setBuscando(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            buscarProducto(codigo)
        }
    }

    return (
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                    disabled={buscando}
                    autoFocus
                />
                {codigo && (
                    <button
                        onClick={() => setCodigo('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>
            <Button
                onClick={() => buscarProducto(codigo)}
                disabled={buscando || !codigo.trim()}
            >
                {buscando ? 'Buscando...' : 'Buscar'}
            </Button>
        </div>
    )
}
