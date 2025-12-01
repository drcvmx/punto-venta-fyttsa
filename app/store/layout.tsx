import { CartProvider } from "@/lib/store-cart-context";
import { ChatWidget } from "@/components/chat-widget";

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CartProvider>
            <div className="flex min-h-screen w-full">
                <main className="flex-1 overflow-x-hidden bg-gradient-to-br from-[#DEEFE7]/30 to-white">
                    {children}
                </main>
            </div>
            {/* Widget de chat flotante */}
            <ChatWidget />
        </CartProvider>
    );
}
