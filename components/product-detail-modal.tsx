"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, Tag, Building2, Barcode } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/store-cart-context";
import { getProductImageUrl } from "@/lib/product-images";
import { useBusinessContext } from "@/lib/business-context";
import { Badge } from "@/components/ui/badge";

interface ProductVariant {
    id: string;
    nombreVariante: string;
    precio: string;
    unidadMedida: string;
    codigoBarras?: string;
    inventario?: Array<{
        cantidad: string;
        sucursalId?: number;
    }>;
}

interface Product {
    id: string;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    marca?: string;
    categoria?: string;
    proveedor?: string;
    variantes: ProductVariant[];
}

interface ProductDetailModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
    const { addItem } = useCart();
    const { selectedBusiness } = useBusinessContext();

    if (!product) return null;

    const variant = product.variantes[0];
    if (!variant) return null;

    // Calculate total stock
    const stock = variant.inventario?.reduce((acc, curr) => acc + parseFloat(curr.cantidad), 0) || 0;

    const imageUrl = getProductImageUrl(
        product.imagenUrl,
        selectedBusiness?.type || 'abarrotes',
        product.nombre,
        variant.codigoBarras
    );

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            variantId: variant.id,
            name: `${product.nombre} - ${variant.nombreVariante}`,
            price: parseFloat(variant.precio),
            image: imageUrl,
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white border-[#B4BEC9]/30 shadow-2xl">
                <div className="flex flex-col md:grid md:grid-cols-2">
                    {/* Image Section */}
                    <div className="relative h-64 md:h-full min-h-[300px] bg-[#DEEFE7]/30 flex items-center justify-center p-6">
                        {imageUrl ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={imageUrl}
                                    alt={product.nombre}
                                    fill
                                    className="object-contain mix-blend-multiply"
                                />
                            </div>
                        ) : (
                            <Package className="h-24 w-24 text-[#B4BEC9]" />
                        )}

                        {/* Category Badge */}
                        {product.categoria && (
                            <Badge className="absolute top-4 left-4 bg-white/90 text-[#159A9C] hover:bg-white shadow-sm backdrop-blur-sm">
                                {product.categoria}
                            </Badge>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="p-6 flex flex-col">
                        <DialogHeader className="mb-4 text-left">
                            <DialogTitle className="text-2xl font-bold text-[#002333] leading-tight">
                                {product.nombre}
                            </DialogTitle>
                            <DialogDescription className="text-[#002333]/60 text-base mt-2">
                                {product.descripcion || "Sin descripción disponible"}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 flex-1">
                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {product.marca && (
                                    <div className="flex items-center gap-2 text-[#002333]/70 bg-gray-50 p-2 rounded-lg">
                                        <Tag className="h-4 w-4 text-[#159A9C]" />
                                        <span className="font-medium truncate">{product.marca}</span>
                                    </div>
                                )}
                                {product.proveedor && (
                                    <div className="flex items-center gap-2 text-[#002333]/70 bg-gray-50 p-2 rounded-lg">
                                        <Building2 className="h-4 w-4 text-[#159A9C]" />
                                        <span className="truncate">{product.proveedor}</span>
                                    </div>
                                )}
                                {variant.codigoBarras && (
                                    <div className="col-span-2 flex items-center gap-2 text-[#002333]/70 bg-gray-50 p-2 rounded-lg">
                                        <Barcode className="h-4 w-4 text-[#159A9C]" />
                                        <span className="font-mono tracking-wider truncate">{variant.codigoBarras}</span>
                                    </div>
                                )}
                            </div>

                            {/* Variant Info */}
                            <div className="bg-[#DEEFE7]/20 p-4 rounded-xl border border-[#DEEFE7] mt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-[#002333]/60">Presentación</span>
                                    <span className="font-medium text-[#002333]">{variant.nombreVariante}</span>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-[#002333]/60">Unidad</span>
                                    <span className="font-medium text-[#002333]">{variant.unidadMedida === 'Unidad' ? 'Pieza' : variant.unidadMedida}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[#002333]/60">Disponibilidad</span>
                                    <span className={`font-bold ${stock > 0 ? 'text-[#159A9C]' : 'text-red-500'}`}>
                                        {stock > 0 ? `${stock} disponibles` : 'Agotado'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Action */}
                        <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex flex-col items-center sm:items-start">
                                <span className="text-sm text-[#002333]/50">Precio</span>
                                <span className="text-3xl font-bold text-[#159A9C]">
                                    ${parseFloat(variant.precio).toFixed(2)}
                                </span>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                className="w-full sm:w-auto flex-1 bg-[#159A9C] hover:bg-[#159A9C]/90 text-white h-12 text-lg shadow-lg shadow-[#159A9C]/20"
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Agregar al Carrito
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
