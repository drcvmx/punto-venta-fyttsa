"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  DollarSign,
  Trash2,
  Printer,
  Save,
  X,
  CreditCard,
  Banknote,
  Search,
  ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";
import { clientsData, type Client } from "@/lib/clients-data";

interface SaleItem {
  id: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
}



const mockProducts = [
  {
    id: "1",
    code: "102421",
    name: "Báscula digital con tazón para cocina, 5kg",
    price: 215.0,
  },
  { id: "2", code: "102422", name: "Mouse Inalámbrico", price: 29.99 },
  { id: "3", code: "102423", name: "Teclado Mecánico", price: 89.99 },
  { id: "4", code: "102424", name: "Monitor 24 pulgadas", price: 199.99 },
];

export function CajaInterface() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");

  const addItem = (product: (typeof mockProducts)[0]) => {
    const existingItem = items.find((item) => item.code === product.code);

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
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
    }
    setProductSearch("");
  };

  const updateQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(code);
      return;
    }
    setItems(
      items.map((item) => (item.code === code ? { ...item, quantity } : item))
    );
  };

  const removeItem = (code: string) => {
    setItems(items.filter((item) => item.code !== code));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discount = (itemTotal * item.discount) / 100;
      return sum + (itemTotal - discount);
    }, 0);
  };

  const calculateChange = () => {
    const payment = parseFloat(paymentAmount) || 0;
    const total = calculateTotal();
    return payment - total;
  };

  const processSale = () => {
    if (items.length === 0) {
      toast.error("No hay artículos en la venta");
      return;
    }

    if (!selectedClient) {
      toast.error("Selecciona un cliente");
      return;
    }

    const payment = parseFloat(paymentAmount) || 0;
    const total = calculateTotal();

    if (payment < total) {
      toast.error("El pago es insuficiente");
      return;
    }

    toast.success("¡Venta procesada con éxito!", {
      description: `Total: $${total.toFixed(
        2
      )} - Cambio: $${calculateChange().toFixed(2)}`,
    });

    // Limpiar venta
    setItems([]);
    setPaymentAmount("");
    setSelectedClient(null);
  };

  const clearSale = () => {
    setItems([]);
    setPaymentAmount("");
    setProductSearch("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-full">
      {/* Columna Izquierda - Cliente y Productos */}
      <div className="lg:col-span-2 space-y-4">
        {/* Cliente */}
        <Card className="border-[#B4BEC9]/30">
          <CardHeader className="bg-[#DEEFE7]/20 pb-3">
            <CardTitle className="text-[#002333] text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#002333]/70">Código</Label>
                <Select
                  value={selectedClient?.id || ""}
                  onValueChange={(value) => {
                    const client = clientsData.find((c) => c.id === value);
                    setSelectedClient(client || null);
                  }}
                >
                  <SelectTrigger className="border-[#B4BEC9]/50">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#002333]/70">Nombre</Label>
                <Input
                  value={selectedClient?.name || ""}
                  readOnly
                  className="border-[#B4BEC9]/50 bg-[#DEEFE7]/10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Búsqueda de Productos */}
        <Card className="border-[#B4BEC9]/30">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#B4BEC9]" />
              <Input
                placeholder="Buscar producto por código o nombre..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-10 border-[#B4BEC9]/50 focus:border-[#159A9C]"
              />
            </div>
            {productSearch && (
              <div className="mt-2 border border-[#B4BEC9]/30 rounded-lg max-h-40 overflow-y-auto">
                {mockProducts
                  .filter(
                    (p) =>
                      p.code
                        .toLowerCase()
                        .includes(productSearch.toLowerCase()) ||
                      p.name.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((product) => (
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

        {/* Tabla de Artículos */}
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
                    <TableHead className="text-white text-center">
                      Unidades
                    </TableHead>
                    <TableHead className="text-white text-right">
                      Precio
                    </TableHead>
                    <TableHead className="text-white text-right">
                      Descto
                    </TableHead>
                    <TableHead className="text-white text-right">
                      Total
                    </TableHead>
                    <TableHead className="text-white text-center">
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-[#002333]/50 py-8"
                      >
                        No hay artículos agregados
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow
                        key={item.code}
                        className="hover:bg-[#DEEFE7]/20"
                      >
                        <TableCell className="font-medium text-[#002333]">
                          {item.code}
                        </TableCell>
                        <TableCell className="text-[#002333]">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.code,
                                parseInt(e.target.value) || 1
                              )
                            }
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
                          $
                          {(
                            (item.price *
                              item.quantity *
                              (100 - item.discount)) /
                            100
                          ).toFixed(2)}
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

            {/* Resumen */}
            {items.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#002333]/70">Partidas:</span>
                  <span className="font-medium text-[#002333]">
                    {items.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#002333]/70">TOTAL:</span>
                  <span className="font-bold text-[#159A9C] text-lg">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha - Total y Pago */}
      <div className="space-y-4">
        {/* Total */}
        <Card className="border-[#159A9C] border-2 bg-[#159A9C]">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-white/90 text-sm mb-2">Total</p>
              <p className="text-white text-5xl font-bold">
                ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cambio */}
        <Card className="border-[#B4BEC9]/30">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <span className="text-[#159A9C] text-lg font-semibold">
                Cambio
              </span>
              <span className="text-[#159A9C] text-2xl font-bold">
                $
                {calculateChange() >= 0 ? calculateChange().toFixed(2) : "0.00"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Forma de Pago */}
        <Card className="border-[#B4BEC9]/30">
          <CardHeader className="bg-[#DEEFE7]/20 pb-3">
            <CardTitle className="text-[#002333] text-lg">
              Forma de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[#002333]/70">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="border-[#B4BEC9]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4" />
                      Efectivo
                    </div>
                  </SelectItem>
                  <SelectItem value="tarjeta">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Tarjeta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#002333]/70">Importe</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0.00"
                className="text-right text-lg font-semibold border-[#B4BEC9]/50 focus:border-[#159A9C]"
              />
            </div>

            <div className="bg-[#DEEFE7] border border-[#159A9C]/30 p-3 rounded-lg">
              <div className="flex justify-between">
                <span className="text-[#002333] font-medium">Efectivo</span>
                <span className="font-bold text-[#159A9C]">
                  ${paymentAmount || "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
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
            onClick={processSale}
            className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Cobrar
          </Button>
        </div>
      </div>
    </div>
  );
}
