"use client";

import { StoreContent } from "@/components/store-content";
import { CartProvider } from "@/lib/store-cart-context";

export default function StorePreviewPage() {
    return (
        <CartProvider>
            <div className="h-[calc(100vh-4rem)]">
                <StoreContent isPublic={false} />
            </div>
        </CartProvider>
    );
}
