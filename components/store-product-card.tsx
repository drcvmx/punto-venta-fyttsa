"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store-cart-context";
import { useBusinessContext } from "@/lib/business-context";
import { getProductImageUrl } from "@/lib/product-images";
import { ShoppingCart, Package, Eye } from "lucide-react";
import Image from "next/image";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ProductDetailModal } from "./product-detail-modal";

interface Product {
    id: string;
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    marca?: string;
    categoria?: string;
    proveedor?: string;
    variantes: Array<{
        id: string;
        nombreVariante: string;
        precio: string;
        unidadMedida: string;
        codigoBarras?: string;
    }>;
}

type ViewSize = "list" | "small" | "medium" | "large";

interface StoreProductCardProps {
    product: Product;
    size?: ViewSize;
}

export function StoreProductCard({ product, size = "large" }: StoreProductCardProps) {
    const { addItem } = useCart();
    const { selectedBusiness } = useBusinessContext();
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const variant = product.variantes[0];
    if (!variant) return null;

    // Obtener URL de imagen usando la utilidad
    const imageUrl = getProductImageUrl(
        product.imagenUrl,
        selectedBusiness?.type || 'abarrotes',
        product.nombre,
        variant.codigoBarras
    );

    // Debug image URL
    if (product.nombre.includes('Gamesa')) {
        console.log('🍪 Product Image URL:', { name: product.nombre, url: imageUrl });
    }

    const isSmall = size === "small";
    const isMedium = size === "medium";
    const isList = size === "list";

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening modal when clicking add to cart
        addItem({
            id: product.id,
            variantId: variant.id,
            name: `${product.nombre} - ${variant.nombreVariante}`,
            price: parseFloat(variant.precio),
            image: imageUrl, // Usar la URL procesada
        });
    };

    useEffect(() => {
        const element = cardRef.current;
        if (!element) return;

        return draggable({
            element,
            getInitialData: () => ({
                productId: product.id,
                variantId: variant.id,
                name: `${product.nombre} - ${variant.nombreVariante}`,
                price: parseFloat(variant.precio),
                type: "store-product",
            }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [product.id, product.nombre, variant.id, variant.nombreVariante, variant.precio]);

    // Vista Lista (horizontal)
    if (isList) {
        return (
            <>
                <Card
                    ref={cardRef}
                    onClick={() => setShowDetail(true)}
                    className={`overflow-hidden hover:shadow-lg transition-all border-[#B4BEC9]/30 touch-none select-none cursor-pointer group ${isDragging ? "opacity-50 scale-95" : "opacity-100"
                        }`}
                >
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="relative w-24 h-24 bg-[#DEEFE7]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#DEEFE7]/30 transition-colors">
                            {imageUrl ? (
                                <Image src={imageUrl} alt={product.nombre} fill className="object-cover" />
                            ) : (
                                <Package className="h-8 w-8 text-[#B4BEC9]" />
                            )}
                        </div>
                        <div className="flex-1 py-3">
                            <h3 className="font-semibold text-[#002333] group-hover:text-[#159A9C] transition-colors">{product.nombre}</h3>
                            <p className="text-sm text-[#002333]/60">{variant.nombreVariante}</p>
                            {product.marca && <p className="text-xs text-[#002333]/40 mt-1">{product.marca}</p>}
                        </div>
                        <div className="flex items-center gap-4 pr-4">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[#159A9C]">${parseFloat(variant.precio).toFixed(2)}</p>
                                <p className="text-xs text-[#002333]/50">
                                    {variant.unidadMedida === 'Unidad' ? 'pza' : variant.unidadMedida}
                                </p>
                            </div>
                            <Button onClick={handleAddToCart} className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white">
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <ProductDetailModal product={product} isOpen={showDetail} onClose={() => setShowDetail(false)} />
            </>
        );
    }

    // Vista Grid (small, medium, large)
    return (
        <>
            <Card
                ref={cardRef}
                onClick={() => setShowDetail(true)}
                className={`h-full flex flex-col overflow-hidden hover:shadow-lg transition-all border-[#B4BEC9]/30 touch-none select-none cursor-pointer group ${isDragging ? "opacity-50 scale-95" : "opacity-100"
                    }`}
            >
                <CardContent className="p-0 flex-1 flex flex-col">
                    <div className={`relative ${isSmall ? "h-32" : isMedium ? "h-40" : "h-48"} bg-[#DEEFE7]/20 flex items-center justify-center group-hover:bg-[#DEEFE7]/30 transition-colors shrink-0`}>
                        {imageUrl ? (
                            <Image src={imageUrl} alt={product.nombre} fill className="object-cover transition-transform group-hover:scale-105" />
                        ) : (
                            <Package className={`${isSmall ? "h-8 w-8" : isMedium ? "h-12 w-12" : "h-16 w-16"} text-[#B4BEC9]`} />
                        )}

                        {/* Hover Overlay with "View Details" hint */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#002333] shadow-sm flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Ver detalles
                            </div>
                        </div>
                    </div>

                    <div className={`${isSmall ? "p-2" : isMedium ? "p-3" : "p-4 space-y-3"} flex-1 flex flex-col justify-between`}>
                        <div>
                            <h3 className={`font-semibold text-[#002333] group-hover:text-[#159A9C] transition-colors ${isSmall ? "text-xs truncate" : isMedium ? "text-sm line-clamp-1" : "line-clamp-2"}`}>
                                {product.nombre}
                            </h3>
                            {!isSmall && (
                                <div className="flex flex-col gap-0.5 mt-1">
                                    <p className={`text-[#002333]/60 ${isMedium ? "text-xs truncate" : "text-sm"}`}>
                                        {variant.nombreVariante}
                                    </p>
                                    {product.marca && (
                                        <p className="text-[10px] uppercase tracking-wider text-[#002333]/40 font-medium">
                                            {product.marca}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={`flex items-center ${isSmall ? "flex-col gap-1" : "justify-between gap-4"} mt-2`}>
                            <div>
                                <p className={`font-bold text-[#159A9C] ${isSmall ? "text-sm" : isMedium ? "text-xl" : "text-2xl"}`}>
                                    ${parseFloat(variant.precio).toFixed(2)}
                                </p>
                                {!isSmall && (
                                    <p className="text-xs text-[#002333]/50">
                                        {variant.unidadMedida === 'Unidad' ? 'pza' : variant.unidadMedida}
                                    </p>
                                )}
                            </div>

                            {!isSmall && (
                                <Button onClick={handleAddToCart} size={isMedium ? "sm" : "default"} className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white shadow-sm">
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {isMedium ? "+" : "Agregar"}
                                </Button>
                            )}
                            {isSmall && (
                                <Button onClick={handleAddToCart} size="sm" className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white">
                                    <ShoppingCart className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <ProductDetailModal product={product} isOpen={showDetail} onClose={() => setShowDetail(false)} />
        </>
    );
}
