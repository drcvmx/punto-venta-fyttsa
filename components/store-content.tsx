"use client";

import { useEffect, useState, useRef } from "react";
import { ShoppingCart, Search, List, Grid3x3, Grid2x2, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store-cart-context";
import { api } from "@/lib/api";
import { StoreProductCard } from "@/components/store-product-card";
import { StoreCart } from "@/components/store-cart";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { toast } from "sonner";
import { useBusinessContext, BusinessConfig } from "@/lib/business-context";
import { detectTenantFromDomain } from "@/lib/tenant-detector";

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
        inventario?: Array<{
            cantidad: string;
            sucursalId?: number;
        }>;
    }>;
}

type ViewMode = "list" | "small" | "medium" | "large";

interface StoreContentProps {
    isPublic?: boolean;
}

const ITEMS_PER_PAGE = 20;

export function StoreContent({ isPublic = true }: StoreContentProps) {
    const { selectedBusiness, selectBusiness } = useBusinessContext();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [cartOpen, setCartOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>("large");
    const [isDropZone, setIsDropZone] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const { itemCount, removeItem } = useCart();
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Auto-detect tenant from domain on mount ONLY if public
    useEffect(() => {
        if (!isPublic) return;

        const initStore = async () => {
            console.log('🏪 Initializing store...');
            const tenantConfig = await detectTenantFromDomain();
            if (tenantConfig) {
                selectBusiness(tenantConfig as unknown as BusinessConfig);
            }
        };

        initStore();
    }, [isPublic]);

    // Fetch products when tenant is ready
    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedBusiness) return;

            try {
                const data = await api.get("/catalogo");
                setProducts(data);
            } catch (error) {
                console.error("❌ Error loading products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [selectedBusiness]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        const element = dropZoneRef.current;
        if (!element) return;

        return dropTargetForElements({
            element,
            onDragEnter: () => setIsDropZone(true),
            onDragLeave: () => setIsDropZone(false),
            onDrop: ({ source }) => {
                setIsDropZone(false);
                const data = source.data as { variantId?: string; type: string };
                if (data.type === "cart-item" && data.variantId) {
                    removeItem(data.variantId);
                    toast.success("Producto eliminado del carrito");
                }
            },
        });
    }, [removeItem]);

    const filteredProducts = products.filter((p) =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getGridClasses = () => {
        switch (viewMode) {
            case "small": return "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2";
            case "medium": return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4";
            case "large": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";
            default: return "";
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#B4BEC9]/20 px-4 py-3">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-[#002333]">
                            {selectedBusiness?.name || (selectedBusiness?.type === 'restaurante' ? 'Menú del Restaurante' : 'Tienda Online')}
                        </h1>
                        <p className="text-xs text-[#002333]/60">
                            {selectedBusiness?.description || (selectedBusiness?.type === 'restaurante' ? 'Nuestro Menú Disponible' : 'Catálogo de Productos')}
                        </p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="hidden sm:flex gap-1 bg-[#DEEFE7]/30 p-1 rounded-lg">
                        <Button
                            size="sm"
                            onClick={() => setViewMode("list")}
                            variant={viewMode === "list" ? "default" : "ghost"}
                            className={viewMode === "list" ? "bg-[#159A9C] text-white hover:bg-[#159A9C]/90" : ""}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setViewMode("small")}
                            variant={viewMode === "small" ? "default" : "ghost"}
                            className={viewMode === "small" ? "bg-[#159A9C] text-white hover:bg-[#159A9C]/90" : ""}
                        >
                            <Grid3x3 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setViewMode("medium")}
                            variant={viewMode === "medium" ? "default" : "ghost"}
                            className={viewMode === "medium" ? "bg-[#159A9C] text-white hover:bg-[#159A9C]/90" : ""}
                        >
                            <Grid2x2 className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setViewMode("large")}
                            variant={viewMode === "large" ? "default" : "ghost"}
                            className={viewMode === "large" ? "bg-[#159A9C] text-white hover:bg-[#159A9C]/90" : ""}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={() => setCartOpen(true)}
                        className="relative bg-[#159A9C] hover:bg-[#159A9C]/90 text-white"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                                {itemCount}
                            </span>
                        )}
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="mt-3 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[#B4BEC9]" />
                    <Input
                        placeholder="Buscar productos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-[#B4BEC9]/50 focus:border-[#159A9C]"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main
                ref={dropZoneRef}
                className={`flex-1 overflow-y-auto p-6 transition-all ${isDropZone ? "bg-red-50 ring-4 ring-red-300 ring-inset" : ""
                    }`}
            >
                <div className="max-w-7xl mx-auto pb-12">
                    <h2 className="text-2xl font-bold text-[#002333] mb-6">
                        {selectedBusiness?.type === 'restaurante' ? 'Nuestros Platillos' : 'Nuestros Productos'} ({filteredProducts.length})
                        {isDropZone && (
                            <span className="text-red-500 ml-4 text-base">
                                ← Suelta aquí para eliminar del carrito
                            </span>
                        )}
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-[#002333]/60">Cargando productos...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#002333]/60">No se encontraron productos</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === "list" ? (
                                <div className="space-y-2">
                                    {paginatedProducts.map((product) => (
                                        <StoreProductCard key={product.id} product={product} size="list" />
                                    ))}
                                </div>
                            ) : (
                                <div className={`grid ${getGridClasses()}`}>
                                    {paginatedProducts.map((product) => (
                                        <StoreProductCard key={product.id} product={product} size={viewMode} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-[#B4BEC9]/20">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setCurrentPage(p => Math.max(1, p - 1));
                                            // Scroll to top
                                            dropZoneRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === 1}
                                        className="border-[#B4BEC9]/30 hover:bg-[#DEEFE7]/50"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Anterior
                                    </Button>
                                    <span className="text-sm font-medium text-[#002333]/70">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setCurrentPage(p => Math.min(totalPages, p + 1));
                                            // Scroll to top
                                            dropZoneRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={currentPage === totalPages}
                                        className="border-[#B4BEC9]/30 hover:bg-[#DEEFE7]/50"
                                    >
                                        Siguiente
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Cart Sidebar */}
            <StoreCart open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
