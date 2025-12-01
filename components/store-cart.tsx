"use client";

import { useEffect, useRef, useState } from "react";
import { X, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/store-cart-context";
import Link from "next/link";
import { dropTargetForElements, draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { toast } from "sonner";

interface StoreCartProps {
    open: boolean;
    onClose: () => void;
}

function CartItem({ item, removeItem, updateQuantity }: any) {
    const itemRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const element = itemRef.current;
        if (!element) return;

        return draggable({
            element,
            getInitialData: () => ({
                variantId: item.variantId,
                type: "cart-item",
            }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [item.variantId]);

    return (
        <div
            ref={itemRef}
            className={`flex gap-3 p-3 bg-[#DEEFE7]/10 rounded-lg border border-[#B4BEC9]/20 transition-all touch-none select-none ${isDragging ? "opacity-50 scale-95" : "opacity-100"
                }`}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
            <div className="flex-1">
                <h3 className="font-medium text-[#002333] text-sm mb-1">
                    {item.name}
                </h3>
                <p className="text-sm text-[#159A9C] font-semibold">
                    ${item.price.toFixed(2)}
                </p>
            </div>

            <div className="flex flex-col items-end gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.variantId)}
                    className="h-6 w-6 text-red-500 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-2 bg-white rounded-md border border-[#B4BEC9]/30">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="h-7 w-7"
                    >
                        <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="h-7 w-7"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function StoreCart({ open, onClose }: StoreCartProps) {
    const { items, removeItem, updateQuantity, total, itemCount, addItem } = useCart();
    const cartRef = useRef<HTMLDivElement>(null);
    const [isOver, setIsOver] = useState(false);

    useEffect(() => {
        const element = cartRef.current;
        if (!element) return;

        return dropTargetForElements({
            element,
            onDragEnter: () => setIsOver(true),
            onDragLeave: () => setIsOver(false),
            onDrop: ({ source }) => {
                setIsOver(false);
                const data = source.data as {
                    productId?: string;
                    variantId: string;
                    name?: string;
                    price?: number;
                    type: string;
                };

                if (data.type === "store-product") {
                    addItem({
                        id: data.productId!,
                        variantId: data.variantId,
                        name: data.name!,
                        price: data.price!,
                    });
                    toast.success("Producto agregado al carrito");
                }
            },
        });
    }, [addItem]);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-[60]"
                onClick={onClose}
            />

            {/* Cart Sidebar */}
            <div
                ref={cartRef}
                className={`fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col transition-all ${isOver ? "ring-4 ring-[#159A9C] ring-inset" : ""
                    }`}
            >
                {/* Header */}
                <div className={`p-4 border-b border-[#B4BEC9]/30 flex items-center justify-between ${isOver ? "bg-[#159A9C]/10" : "bg-[#DEEFE7]/20"
                    }`}>
                    <h2 className="text-lg font-semibold text-[#002333]">
                        Carrito ({itemCount})
                        {isOver && <span className="text-[#159A9C] ml-2">← Suelta aquí</span>}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#002333]/50">
                                {isOver ? "Suelta productos aquí" : "Tu carrito está vacío"}
                            </p>
                            <p className="text-xs text-[#002333]/40 mt-2">
                                Arrastra productos o haz clic en "Agregar"
                            </p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <CartItem
                                key={item.variantId}
                                item={item}
                                removeItem={removeItem}
                                updateQuantity={updateQuantity}
                            />
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-[#B4BEC9]/30 bg-[#DEEFE7]/10 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-[#002333]">
                                Total:
                            </span>
                            <span className="text-2xl font-bold text-[#159A9C]">
                                ${total.toFixed(2)}
                            </span>
                        </div>

                        <Link href="/store/checkout" onClick={onClose}>
                            <Button className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white text-lg py-6">
                                Proceder al Pago
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
