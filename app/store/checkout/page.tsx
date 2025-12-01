"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentForm } from "@/components/store/payment-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/store-cart-context";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useBusinessContext } from "@/lib/business-context";

export default function CheckoutPage() {
    const { selectedBusiness } = useBusinessContext();
    const router = useRouter();
    const { items, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const handlePaymentSuccess = async (token: string, deviceSessionId: string) => {
        if (!formData.name || !formData.email) {
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        if (items.length === 0) {
            toast.error("Tu carrito está vacío");
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                tenantId: selectedBusiness?.tenantId, // Use the correct UUID property
                storeId: 1, // Default store ID (number) for now, or get from context if available
                customerName: formData.name,
                customerEmail: formData.email,
                amount: total,
                items: items.map((item) => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.price,
                })),
                token_id: token,
                device_session_id: deviceSessionId,
            };

            if (!selectedBusiness) {
                // If we are in the public store, selectedBusiness might be null if not set by middleware/context
                // But for now let's assume we need it or handle the error
                // In public store mode, we might need a different way to get tenantId
                console.warn("No selectedBusiness found, using default or context");
            }

            // Use the payments/charge endpoint or modify orders endpoint to handle payment
            // For this integration, we'll use the payments/charge endpoint we created
            const response = await api.post("/payments/charge", {
                ...orderData,
                description: `Pedido de ${formData.name}`,
                customer: {
                    name: formData.name,
                    email: formData.email,
                    phone_number: `52${formData.phone}`
                }
            });

            console.log("Charge response:", response);
            toast.success("¡Pago realizado con éxito!");
            clearCart();

            // Redirect to success page with Order ID
            // Assuming response is the Order object returned by backend
            router.push(`/store/success?orderId=${response.id}`);

        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error("Error al procesar el pago: " + (error.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <Card className="border-[#B4BEC9]/30">
                    <CardContent className="py-12 text-center">
                        <ShoppingBag className="h-16 w-16 text-[#B4BEC9] mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-[#002333] mb-2">
                            Tu carrito está vacío
                        </h2>
                        <p className="text-[#002333]/60 mb-6">
                            Agrega productos para continuar con tu compra
                        </p>
                        <Link href="/store">
                            <Button className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver a la tienda
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link
                href="/store"
                className="inline-flex items-center text-[#159A9C] hover:underline mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a la tienda
            </Link>

            <h1 className="text-3xl font-bold text-[#002333] mb-8">Checkout</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Customer Form */}
                <Card className="border-[#B4BEC9]/30">
                    <CardHeader className="bg-[#DEEFE7]/20">
                        <CardTitle className="text-[#002333]">
                            Información de Contacto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#002333]/70">
                                    Nombre Completo *
                                </Label>
                                <Input
                                    id="name"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className="border-[#B4BEC9]/50 focus:border-[#159A9C]"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#002333]/70">
                                    Correo Electrónico *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="border-[#B4BEC9]/50 focus:border-[#159A9C]"
                                    placeholder="juan@ejemplo.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[#002333]/70">
                                    Teléfono
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#002333]/60">
                                        +52
                                    </span>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setFormData({ ...formData, phone: value });
                                        }}
                                        className="pl-12 border-[#B4BEC9]/50 focus:border-[#159A9C]"
                                        placeholder="5512345678"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold mb-4">Pago Seguro</h3>
                                <PaymentForm
                                    amount={total}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    isProcessing={loading}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card className="border-[#B4BEC9]/30 h-fit">
                    <CardHeader className="bg-[#DEEFE7]/20">
                        <CardTitle className="text-[#002333]">Resumen del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {items.map((item) => (
                            <div
                                key={item.variantId}
                                className="flex justify-between text-sm pb-3 border-b border-[#B4BEC9]/20"
                            >
                                <div>
                                    <p className="font-medium text-[#002333]">{item.name}</p>
                                    <p className="text-[#002333]/60">Cantidad: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-[#159A9C]">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}

                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between text-base">
                                <span className="text-[#002333]/70">Subtotal:</span>
                                <span className="font-medium text-[#002333]">
                                    ${total.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-[#159A9C]/20">
                                <span className="text-[#002333]">Total:</span>
                                <span className="text-[#159A9C]">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-[#DEEFE7]/30 p-4 rounded-lg mt-4">
                            <p className="text-xs text-[#002333]/60 text-center">
                                Tu pedido será procesado de inmediato. Recibirás un código de
                                confirmación por correo electrónico.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
