"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Trash2,
  Printer,
  Save,
  X,
  Search,
  ShoppingCart,
  ScanBarcode,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { type Client } from "@/lib/clients-data";
import { api } from "@/lib/api";
import { useBusinessContext } from "@/lib/business-context";
import { PosPaymentModal } from "@/components/pos/pos-payment-modal";

interface SaleItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TicketView } from "@/components/ticket-view";
import { OrderValidator } from "@/components/pos/order-validator";

export function CajaInterface() {
  const { selectedBusiness } = useBusinessContext();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isValidatorOpen, setIsValidatorOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);

  // --- SCANNER LOGIC START ---
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const scannerRef = useRef<HTMLInputElement>(null);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const addItem = (product: any) => {
    const existingItem = items.find((item) => item.code === product.code);

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`+1 ${product.name}`);
    } else {
      setItems([
        ...items,
        {
          id: product.id,
          code: product.code,
          name: product.name,
          quantity: 1,
          price: product.price,
          discount: 0,
        },
      ]);
      toast.success(`Agregado: ${product.name}`);
    }
    setProductSearch("");
    setFilteredProducts([]);
  };

  const handleScannerInput = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    console.log("Scanned:", cleanText);

    try {
      if (!selectedBusiness) return;

      // Usar endpoint específico para búsqueda por código de barras
      const product = await api.get(
        `/catalogo/buscar-codigo?codigo=${cleanText}`
      );

      if (product) {
        // Si es un producto global sin registrar, no tiene precio ni ID de variante
        if (product.isGlobal) {
          toast.error("Producto global encontrado pero no registrado. Regístralo primero para asignarle precio.");
          return;
        }

        // Encontrar la variante que coincide con el código escaneado
        const matchingVariant = product.variantes?.find((v: any) =>
          v.codigoBarras === cleanText || v.codigoQr === cleanText
        ) || product.variantes?.[0];

        if (!matchingVariant) {
          toast.error("Producto encontrado pero sin variantes válidas.");
          return;
        }

        const itemToAdd = {
          id: matchingVariant.id,
          code: matchingVariant.codigoBarras || cleanText,
          name: `${product.nombre} ${matchingVariant.nombreVariante && matchingVariant.nombreVariante !== 'Presentación Única' ? '- ' + matchingVariant.nombreVariante : ''}`,
          price: parseFloat(matchingVariant.precio),
          discount: 0
        };

        addItem(itemToAdd);
      } else {
        toast.error(`Producto no encontrado: ${cleanText}`);
      }
    } catch (error) {
      console.error("Scanner search error:", error);
      toast.error("Producto no encontrado");
    }

    if (scannerRef.current) {
      scannerRef.current.value = "";
    }
  };

  const focusScanner = useCallback(() => {
    if (!scannerEnabled || isValidatorOpen) return;

    requestAnimationFrame(() => {
      if (
        scannerRef.current &&
        document.activeElement !== manualInputRef.current &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        (document.activeElement as HTMLElement)?.id !== "payment-amount"
      ) {
        scannerRef.current.focus();
      }
    });
  }, [scannerEnabled, isValidatorOpen]);

  useEffect(() => {
    if (!scannerEnabled) return;
    focusScanner();
    const handleInteraction = () => setTimeout(focusScanner, 5);
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('input') && !target.closest('textarea')) {
        handleInteraction();
      }
    };
    document.addEventListener("click", handleClick, true);
    document.addEventListener("focusout", handleInteraction, true);
    window.addEventListener("focus", focusScanner);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("focusout", handleInteraction, true);
      window.removeEventListener("focus", focusScanner);
    };
  }, [focusScanner, scannerEnabled]);
  // --- SCANNER LOGIC END ---

  // --- API SEARCH LOGIC ---
  useEffect(() => {
    const searchProducts = async () => {
      if (productSearch.length > 2) {
        try {
          if (!selectedBusiness) return;
          const results = await api.get(`/catalogo/search?q=${productSearch}`);
          const flatResults = results.flatMap((p: any) =>
            p.variantes.map((v: any) => ({
              id: v.id,
              code: v.id,
              name: `${p.nombre} - ${v.nombreVariante}`,
              price: parseFloat(v.precio),
              image: p.imagenUrl
            }))
          );
          setFilteredProducts(flatResults);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setFilteredProducts([]);
      }
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);

  const updateQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(code);
      return;
    }
    setItems(items.map((item) => (item.code === code ? { ...item, quantity } : item)));
  };

  const removeItem = (code: string) => {
    setItems(items.filter((item) => item.code !== code));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = (itemTotal * item.discount) / 100;
      return sum + (itemTotal - discount);
    }, 0);
  };

  const handleCashPayment = async (cashAmount: number) => {
    if (items.length === 0) {
      toast.error("No hay productos en la venta");
      return;
    }

    try {
      const total = calculateTotal();
      const orderData = {
        storeId: 1,
        customerName: selectedClient?.name || "Público General",
        customerEmail: selectedClient?.email || "ventas@mostrador.com",
        amount: total,
        items: items.map(item => ({
          variantId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: 'cash',
        cashReceived: cashAmount
      };

      if (!selectedBusiness) {
        toast.error("Error: No hay negocio seleccionado");
        return;
      }

      const response = await api.post('/orders', orderData);

      if (response.id) {
        const change = cashAmount - total;
        // toast.success(`Venta completada! Cambio: $${change.toFixed(2)}. Ticket: ${response.collectionCode || response.id}`);

        setLastOrder({
          ...response,
          items: items.map(item => ({
            quantity: item.quantity,
            productName: item.name,
            price: item.price,
            subtotal: item.price * item.quantity
          })),
          totalAmount: total,
          customerName: selectedClient?.name || "Público General",
          createdAt: new Date().toISOString()
        });
        setIsTicketOpen(true);
        clearSale();
      } else {
        toast.error("Error al procesar la venta");
      }
    } catch (error: any) {
      console.error("Cash sale error:", error);
      toast.error(error.message || "Error al procesar la venta");
    }
  };

  const handleCardPayment = async (token: string, deviceSessionId: string) => {
    if (items.length === 0) {
      toast.error("No hay productos en la venta");
      return;
    }

    try {
      const total = calculateTotal();
      const chargeData = {
        tenantId: selectedBusiness?.tenantId,
        storeId: 1,
        customerName: selectedClient?.name || "Cliente General",
        customerEmail: selectedClient?.email || "cliente@general.com",
        amount: total,
        items: items.map(item => ({
          variantId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        token_id: token,
        device_session_id: deviceSessionId,
        description: `Venta POS - ${selectedClient?.name || "General"}`,
        customer: {
          name: selectedClient?.name || "Cliente General",
          email: selectedClient?.email || "cliente@general.com",
          phone_number: selectedClient?.phone || '5555555555'
        }
      };

      if (!selectedBusiness) {
        toast.error("Error: No hay negocio seleccionado");
        return;
      }

      const response = await api.post('/payments/charge', chargeData);

      if (response.id) {
        // toast.success(`¡Pago con tarjeta exitoso! Ticket: ${response.collectionCode || response.id}`);
        setLastOrder({
          ...response,
          items: items.map(item => ({
            quantity: item.quantity,
            productName: item.name,
            price: item.price,
            subtotal: item.price * item.quantity
          })),
          totalAmount: total,
          customerName: selectedClient?.name || "Cliente General",
          createdAt: new Date().toISOString()
        });
        setIsTicketOpen(true);
        clearSale();
      } else {
        toast.error("Error al procesar el pago con tarjeta");
      }
    } catch (error: any) {
      console.error("Card payment error:", error);
      toast.error(error.message || "Error al procesar el pago con tarjeta");
    }
  };

  const clearSale = () => {
    setItems([]);
    setSelectedClient(null);
    setProductSearch("");
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-full relative">
      <input
        ref={scannerRef}
        onChange={(e) => handleScannerInput(e.target.value)}
        className="absolute w-px h-px opacity-0 -z-10"
        autoComplete="off"
      />

      <div className="lg:col-span-2 space-y-4">
        {/* Información de Caja */}
        <Card className="border-[#B4BEC9]/30">
          <CardHeader className="bg-[#DEEFE7]/20 pb-3">
            <CardTitle className="text-[#002333] text-lg flex items-center gap-2">
              <ScanBarcode className="h-5 w-5 text-[#159A9C]" />
              Punto de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-[#002333]/70 text-xs uppercase tracking-wider">Caja</Label>
                <div className="font-medium text-[#002333] text-lg">Principal (01)</div>
              </div>
              <div className="space-y-1">
                <Label className="text-[#002333]/70 text-xs uppercase tracking-wider">Vendedor</Label>
                <div className="font-medium text-[#002333] text-lg">Cajero Turno Matutino</div>
              </div>
              <div className="space-y-1">
                <Label className="text-[#002333]/70 text-xs uppercase tracking-wider">Cliente</Label>
                <div className="font-medium text-[#002333]/60 text-lg italic">Público General</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Búsqueda */}
        <Card className="border-[#B4BEC9]/30">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#B4BEC9]" />
              <Input
                ref={manualInputRef}
                placeholder="Buscar producto por código o nombre..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10 border-[#B4BEC9]/50 focus:border-[#159A9C]"
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline-block">
                  {scannerEnabled ? "Scanner Activo" : "Scanner Pausado"}
                </span>
                <ScanBarcode className={`h-4 w-4 ${scannerEnabled ? "text-green-500" : "text-gray-400"}`} />
              </div>
            </div>
            {filteredProducts.length > 0 && (
              <div className="mt-2 border border-[#B4BEC9]/30 rounded-lg max-h-40 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addItem(product)}
                    className="p-3 hover:bg-[#DEEFE7]/30 cursor-pointer border-b border-[#B4BEC9]/20 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-[#002333]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#002333]/50">
                          Código: {product.code}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#159A9C]">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card className="border-[#B4BEC9]/30">
          <CardHeader className="bg-[#DEEFE7]/20 pb-3">
            <CardTitle className="text-[#002333] text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#159A9C]" />
              Artículos ({items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border border-[#B4BEC9]/30">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#159A9C]">
                    <TableHead className="text-white">Artículo</TableHead>
                    <TableHead className="text-white">Nombre</TableHead>
                    <TableHead className="text-white text-center">Unidades</TableHead>
                    <TableHead className="text-white text-right">Precio</TableHead>
                    <TableHead className="text-white text-right">Descto</TableHead>
                    <TableHead className="text-white text-right">Total</TableHead>
                    <TableHead className="text-white text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-[#002333]/50 py-8">
                        No hay artículos agregados
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow key={item.code} className="hover:bg-[#DEEFE7]/20">
                        <TableCell className="font-medium text-[#002333]">{item.code}</TableCell>
                        <TableCell className="text-[#002333]">{item.name}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.code, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-[#B4BEC9]/50"
                          />
                        </TableCell>
                        <TableCell className="text-right text-[#159A9C] font-semibold">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-[#002333]">
                          {item.discount.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right text-[#159A9C] font-bold">
                          ${((item.price * item.quantity * (100 - item.discount)) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.code)}
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#002333]/70">Partidas:</span>
                  <span className="font-medium text-[#002333]">{items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#002333]/70">TOTAL:</span>
                  <span className="font-bold text-[#159A9C] text-lg">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-[#159A9C] border-2 bg-[#159A9C]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-white/90 text-sm mb-2">Total</p>
              <p className="text-white text-5xl font-bold">${calculateTotal().toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>



        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={clearSale}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={() => setIsValidatorOpen(true)}
            className="bg-[#002333] hover:bg-[#002333]/90 text-white"
          >
            <PackageCheck className="h-4 w-4 mr-2" />
            Validar Entrega
          </Button>
          <Button
            onClick={() => toast.info("Función en desarrollo")}
            className="bg-[#B4BEC9] hover:bg-[#B4BEC9]/90"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button
            onClick={() => toast.info("Función en desarrollo")}
            className="bg-[#B4BEC9] hover:bg-[#B4BEC9]/90"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            onClick={() => setIsPaymentModalOpen(true)}
            disabled={items.length === 0}
            className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Cobrar
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <PosPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={calculateTotal()}
        items={items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))}
        customer={selectedClient}
        onCashPayment={handleCashPayment}
        onCardPayment={handleCardPayment}
      />
      {/* Ticket Modal */}
      <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
        <DialogContent className="max-w-md">
          {lastOrder && (
            <TicketView
              orderId={lastOrder.id}
              collectionCode={lastOrder.collectionCode}
              date={lastOrder.createdAt}
              customerName={lastOrder.customerName}
              items={lastOrder.items}
              total={Number(lastOrder.totalAmount)}
              storeName={selectedBusiness?.name || "Mi Tiendita"}
              storeAddress="Sucursal Principal"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Order Validator Modal */}
      <OrderValidator
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
      />
    </div>
  );
}
