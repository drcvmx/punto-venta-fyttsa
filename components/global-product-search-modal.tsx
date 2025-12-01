"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Package, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { globalProductsApi } from '@/lib/api-services/global-products'
import type { GlobalProduct } from '@/lib/types'

interface GlobalProductSearchModalProps {
    open: boolean
    onClose: () => void
    onSelectProduct: (product: GlobalProduct) => void
    businessType?: string
}

export function GlobalProductSearchModal({
    open,
    onClose,
    onSelectProduct,
    businessType
}: GlobalProductSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [searching, setSearching] = useState(false)
    const [products, setProducts] = useState<GlobalProduct[]>([])

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Ingresa un término de búsqueda')
            return
        }

        setSearching(true)
        try {
            const results = await globalProductsApi.searchGlobal(searchQuery, businessType)
            setProducts(results)

            if (results.length === 0) {
                toast.info('No se encontraron productos en el catálogo global')
            } else {
                toast.success(`${results.length} producto(s) encontrado(s)`)
            }
        } catch (error) {
            console.error('Error buscando en catálogo global:', error)
            toast.error('Error al buscar en catálogo global')
        } finally {
            setSearching(false)
        }
    }

    const handleSelectProduct = (product: GlobalProduct) => {
        onSelectProduct(product)
        onClose()
        setSearchQuery('')
        setProducts([])
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-[#159A9C]" />
                        Buscar en Catálogo Global
                    </DialogTitle>
                    <DialogDescription>
                        Busca productos en el catálogo global y agrégalos a tu inventario
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Búsqueda */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Buscar por nombre, marca, categoría..."
                                className="pl-10"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={searching || !searchQuery.trim()}
                            className="bg-[#159A9C] hover:bg-[#159A9C]/90"
                        >
                            {searching ? 'Buscando...' : 'Buscar'}
                        </Button>
                    </div>

                    {/* Resultados */}
                    {products.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                                {products.length} resultado(s) encontrado(s)
                            </Label>
                            <div className="grid gap-3 max-h-[400px] overflow-y-auto">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="border rounded-lg p-4 hover:border-[#159A9C] transition-colors cursor-pointer group"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Imagen */}
                                            {product.imagenUrl ? (
                                                <img
                                                    src={product.imagenUrl}
                                                    alt={product.nombre || 'Producto'}
                                                    className="w-16 h-16 object-cover rounded-md border"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-[#002333] group-hover:text-[#159A9C] transition-colors">
                                                    {product.nombre || 'Sin nombre'}
                                                </h4>
                                                {product.descripcion && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                        {product.descripcion}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {product.marca && (
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {product.marca}
                                                        </span>
                                                    )}
                                                    {product.categoria && (
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                            {product.categoria}
                                                        </span>
                                                    )}
                                                    {product.codigoBarras && (
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                                            {product.codigoBarras}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Botón */}
                                            <Button
                                                size="sm"
                                                className="bg-[#159A9C] hover:bg-[#159A9C]/90 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleSelectProduct(product)
                                                }}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                Agregar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Estado vacío */}
                    {!searching && products.length === 0 && searchQuery && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No se encontraron productos</p>
                            <p className="text-sm">Intenta con otros términos de búsqueda</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
