"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Search,
  Pencil,
  Trash2,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react"
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { Separator } from "@/components/ui/separator"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: string
}

interface CartItem extends Product {
  quantity: number
}

// Productos en inventario
const inventoryProducts: Product[] = [
  {
    id: "1",
    name: "Mouse Inalámbrico",
    sku: "WM-001",
    category: "Electrónica",
    price: 29.99,
    stock: 150,
    status: "En Stock",
  },
  {
    id: "2",
    name: "Cable USB-C",
    sku: "UC-002",
    category: "Accesorios",
    price: 12.99,
    stock: 5,
    status: "Stock Bajo",
  },
  {
    id: "3",
    name: "Soporte para Laptop",
    sku: "LS-003",
    category: "Muebles",
    price: 49.99,
    stock: 0,
    status: "Sin Stock",
  },
  {
    id: "4",
    name: "Teclado Mecánico",
    sku: "MK-004",
    category: "Electrónica",
    price: 89.99,
    stock: 75,
    status: "En Stock",
  },
  {
    id: "5",
    name: "Webcam HD",
    sku: "WC-005",
    category: "Electrónica",
    price: 59.99,
    stock: 30,
    status: "En Stock",
  },
  {
    id: "6",
    name: "Monitor 24 pulgadas",
    sku: "MN-006",
    category: "Electrónica",
    price: 199.99,
    stock: 12,
    status: "En Stock",
  },
  {
    id: "7",
    name: "Auriculares Bluetooth",
    sku: "AB-007",
    category: "Audio",
    price: 79.99,
    stock: 3,
    status: "Stock Bajo",
  },
  {
    id: "8",
    name: "Hub USB 4 puertos",
    sku: "HU-008",
    category: "Accesorios",
    price: 24.99,
    stock: 45,
    status: "En Stock",
  },
]

export function ProductsSections() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>(inventoryProducts)
  const [cart, setCart] = useState<CartItem[]>([])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En Stock":
        return "default"
      case "Stock Bajo":
        return "secondary"
      case "Sin Stock":
        return "destructive"
      default:
        return "default"
    }
  }

  const filterProducts = (productList: Product[]) => {
    return productList.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const addToCart = (product: Product) => {
    if (product.stock === 0) return

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateCartQuantity = (productId: string, change: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQuantity = item.quantity + change
            if (newQuantity > product.stock) return item
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const clearCart = () => {
    setCart([])
  }

  // Componente de fila arrastrable del inventario
  const DraggableInventoryRow = ({ product }: { product: Product }) => {
    const rowRef = useRef<HTMLTableRowElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
      const element = rowRef.current
      if (!element) return

      return draggable({
        element,
        getInitialData: () => ({ productId: product.id, type: "inventory" }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      })
    }, [product.id])

    return (
      <TableRow
        ref={rowRef}
        className={`hover:bg-[#DEEFE7]/20 cursor-grab active:cursor-grabbing transition-opacity ${
          isDragging ? "opacity-50" : "opacity-100"
        }`}
      >
        <TableCell className="font-medium text-[#002333]">{product.name}</TableCell>
        <TableCell className="text-[#002333]/70">{product.sku}</TableCell>
        <TableCell className="text-[#002333]/70">{product.category}</TableCell>
        <TableCell className="text-[#159A9C] font-semibold">${product.price.toFixed(2)}</TableCell>
        <TableCell className="text-[#002333]/70">{product.stock}</TableCell>
        <TableCell>
          <Badge variant={getStatusColor(product.status)}>{product.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  // Card de inventario con drop zone
  const InventoryCard = () => {
    const filteredProducts = filterProducts(products)

    return (
      <Card className="border-[#B4BEC9]/30 shadow-sm">
        <CardHeader className="bg-[#DEEFE7]/20">
          <CardTitle className="text-[#002333] flex items-center gap-2">
            <Package className="h-5 w-5 text-[#159A9C]" />
            Inventario ({products.length})
          </CardTitle>
          <CardDescription className="text-[#002333]/70">Productos disponibles para la venta</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-[#B4BEC9]/30">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DEEFE7]/30">
                  <TableHead className="text-[#002333]">Producto</TableHead>
                  <TableHead className="text-[#002333]">SKU</TableHead>
                  <TableHead className="text-[#002333]">Categoría</TableHead>
                  <TableHead className="text-[#002333]">Precio</TableHead>
                  <TableHead className="text-[#002333]">Stock</TableHead>
                  <TableHead className="text-[#002333]">Estado</TableHead>
                  <TableHead className="text-right text-[#002333]">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => <DraggableInventoryRow key={product.id} product={product} />)
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Card de carrito con drop zone
  const CartCard = () => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isOver, setIsOver] = useState(false)

    useEffect(() => {
      const element = cardRef.current
      if (!element) return

      return dropTargetForElements({
        element,
        onDragEnter: () => setIsOver(true),
        onDragLeave: () => setIsOver(false),
        onDrop: ({ source }) => {
          setIsOver(false)
          const data = source.data as { productId: string; type: string }
          if (data.type === "inventory") {
            const product = products.find((p) => p.id === data.productId)
            if (product) {
              addToCart(product)
            }
          }
        },
      })
    }, [products, cart])

    return (
      <Card
        ref={cardRef}
        className={`border-[#B4BEC9]/30 shadow-sm transition-all duration-200 ${
          isOver ? "border-[#159A9C] border-2 bg-[#DEEFE7]/30 scale-[1.02]" : ""
        }`}
      >
        <CardHeader className="bg-[#DEEFE7]/20">
          <CardTitle className="text-[#002333] flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#159A9C]" />
            Carrito de Compra ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
          </CardTitle>
          <CardDescription className="text-[#002333]/70">Productos seleccionados por el cliente</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {cart.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-[#B4BEC9]/30 rounded-lg">
              <ShoppingBag className="h-12 w-12 text-[#B4BEC9] mb-3" />
              <p className="text-[#002333]/50 text-sm">El carrito está vacío</p>
              <p className="text-[#002333]/40 text-xs mt-1">Arrastra productos aquí o usa el botón "Agregar"</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-[#B4BEC9]/30 max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#DEEFE7]/30">
                      <TableHead className="text-[#002333]">Producto</TableHead>
                      <TableHead className="text-[#002333]">Precio</TableHead>
                      <TableHead className="text-[#002333]">Cantidad</TableHead>
                      <TableHead className="text-[#002333]">Subtotal</TableHead>
                      <TableHead className="text-right text-[#002333]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id} className="hover:bg-[#DEEFE7]/20">
                        <TableCell className="font-medium text-[#002333]">
                          <div>
                            <p>{item.name}</p>
                            <p className="text-xs text-[#002333]/50">{item.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#159A9C] font-semibold">${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.id, -1)}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium text-[#002333] w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.id, 1)}
                              className="h-7 w-7 p-0"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-[#159A9C] font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator className="bg-[#B4BEC9]/30" />

              <div className="space-y-3 p-4 bg-[#DEEFE7]/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-[#002333]/70">Items totales:</span>
                  <span className="font-medium text-[#002333]">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#002333]/70">Subtotal:</span>
                  <span className="font-medium text-[#002333]">${calculateTotal().toFixed(2)}</span>
                </div>
                <Separator className="bg-[#B4BEC9]/30" />
                <div className="flex justify-between">
                  <span className="font-semibold text-[#002333]">Total:</span>
                  <span className="font-bold text-[#159A9C] text-xl">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="flex-1 border-[#B4BEC9]/50 hover:bg-[#B4BEC9]/10"
                >
                  Vaciar Carrito
                </Button>
                <Button className="flex-1 bg-[#159A9C] hover:bg-[#159A9C]/90 text-white">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Procesar Compra
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex justify-end">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#B4BEC9]" />
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-[#B4BEC9]/50 focus:border-[#159A9C] focus:ring-[#159A9C]"
          />
        </div>
      </div>

      {/* Grid responsive con ambas secciones */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <InventoryCard />
        <CartCard />
      </div>
    </div>
  )
}
