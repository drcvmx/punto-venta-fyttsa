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
  X,
} from "lucide-react"
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

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

interface ShoppingCart {
  id: string
  name: string
  items: CartItem[]
  createdAt: string
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
  const [inventorySearch, setInventorySearch] = useState("")
  const [products, setProducts] = useState<Product[]>(inventoryProducts)
  const [carts, setCarts] = useState<ShoppingCart[]>([
    {
      id: "1",
      name: "Compra 1",
      items: [],
      createdAt: new Date().toISOString(),
    },
  ])
  const [activeCartId, setActiveCartId] = useState("1")

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

  const activeCart = carts.find((c) => c.id === activeCartId)!

  const filterProducts = (productList: Product[]) => {
    return productList.filter(
      (product) =>
        product.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(inventorySearch.toLowerCase()),
    )
  }

  const addToCart = (product: Product) => {
    if (product.stock === 0) return

    setCarts((prevCarts) =>
      prevCarts.map((cart) => {
        if (cart.id !== activeCartId) return cart

        const existingItem = cart.items.find((item) => item.id === product.id)

        if (existingItem) {
          if (existingItem.quantity < product.stock) {
            return {
              ...cart,
              items: cart.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            }
          }
          return cart
        }

        return {
          ...cart,
          items: [...cart.items, { ...product, quantity: 1 }],
        }
      }),
    )
  }

  const updateCartQuantity = (productId: string, change: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    setCarts((prevCarts) =>
      prevCarts.map((cart) => {
        if (cart.id !== activeCartId) return cart

        return {
          ...cart,
          items: cart.items
            .map((item) => {
              if (item.id === productId) {
                const newQuantity = item.quantity + change
                if (newQuantity > product.stock) return item
                return { ...item, quantity: newQuantity }
              }
              return item
            })
            .filter((item) => item.quantity > 0),
        }
      }),
    )
  }

  const removeFromCart = (productId: string) => {
    setCarts((prevCarts) =>
      prevCarts.map((cart) => {
        if (cart.id !== activeCartId) return cart
        return {
          ...cart,
          items: cart.items.filter((item) => item.id !== productId),
        }
      }),
    )
  }

  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const clearCart = () => {
    setCarts((prevCarts) =>
      prevCarts.map((cart) => {
        if (cart.id !== activeCartId) return cart
        return { ...cart, items: [] }
      }),
    )
  }

  const addNewCart = () => {
    const newCartNumber = carts.length + 1
    const newCart: ShoppingCart = {
      id: `${Date.now()}`,
      name: `Compra ${newCartNumber}`,
      items: [],
      createdAt: new Date().toISOString(),
    }
    setCarts([...carts, newCart])
    setActiveCartId(newCart.id)
  }

  const removeCart = (cartId: string) => {
    if (carts.length === 1) return // No eliminar si es el único carrito

    const remainingCarts = carts.filter((cart) => cart.id !== cartId)
    setCarts(remainingCarts)

    if (activeCartId === cartId) {
      setActiveCartId(remainingCarts[0].id)
    }
  }

  const processCart = () => {
    const currentCart = carts.find((c) => c.id === activeCartId)
    if (!currentCart || currentCart.items.length === 0) {
      toast.error("El carrito está vacío")
      return
    }

    const total = calculateTotal(currentCart.items)
    const itemCount = currentCart.items.reduce((sum, item) => sum + item.quantity, 0)

    // Mostrar mensaje de éxito
    toast.success("¡Compra procesada con éxito!", {
      description: `${itemCount} items - Total: $${total.toFixed(2)}`,
    })

    // Si es el único carrito, vaciarlo
    if (carts.length === 1) {
      clearCart()
    } else {
      // Si hay más carritos, eliminar este
      removeCart(activeCartId)
    }
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
        className={`hover:bg-[#DEEFE7]/20 touch-none select-none transition-all ${
          isDragging ? "opacity-50 scale-95" : "opacity-100"
        }`}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <TableCell className="font-medium text-[#002333]">
          <div className="flex items-center gap-2">
            <span className="text-[#B4BEC9] hidden sm:inline">⋮⋮</span>
            {product.name}
          </div>
        </TableCell>
        <TableCell className="text-[#002333]/70 hidden md:table-cell">{product.sku}</TableCell>
        <TableCell className="text-[#002333]/70 hidden lg:table-cell">{product.category}</TableCell>
        <TableCell className="text-[#159A9C] font-semibold">${product.price.toFixed(2)}</TableCell>
        <TableCell className="text-[#002333]/70 hidden sm:table-cell">{product.stock}</TableCell>
        <TableCell className="hidden md:table-cell">
          <Badge variant={getStatusColor(product.status)}>{product.status}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <Button
            size="sm"
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white h-8 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Agregar</span>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#002333] flex items-center gap-2">
                <Package className="h-5 w-5 text-[#159A9C]" />
                Inventario ({products.length})
              </CardTitle>
              <CardDescription className="text-[#002333]/70">Productos disponibles para la venta</CardDescription>
            </div>
          </div>
          {/* Búsqueda en inventario */}
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#B4BEC9]" />
            <Input
              placeholder="Buscar por nombre o SKU..."
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              className="pl-8 border-[#B4BEC9]/50 focus:border-[#159A9C] focus:ring-[#159A9C]"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border border-[#B4BEC9]/30 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DEEFE7]/30">
                  <TableHead className="text-[#002333] min-w-[180px]">Producto</TableHead>
                  <TableHead className="text-[#002333] hidden md:table-cell">SKU</TableHead>
                  <TableHead className="text-[#002333] hidden lg:table-cell">Categoría</TableHead>
                  <TableHead className="text-[#002333]">Precio</TableHead>
                  <TableHead className="text-[#002333] hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="text-[#002333] hidden md:table-cell">Estado</TableHead>
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
    }, [products, activeCart])

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
            Carritos de Compra
          </CardTitle>
          <CardDescription className="text-[#002333]/70">
            Gestiona múltiples compras simultáneamente
            <span className="hidden sm:inline"> • Arrastra productos aquí o usa el botón "Agregar"</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeCartId} onValueChange={setActiveCartId}>
            <div className="flex items-center gap-2 mb-4">
              <TabsList className="bg-[#DEEFE7] border border-[#B4BEC9]/30 flex-1">
                {carts.map((cart) => (
                  <div key={cart.id} className="relative group">
                    <TabsTrigger
                      value={cart.id}
                      className="data-[state=active]:bg-[#159A9C] data-[state=active]:text-white text-[#002333]"
                    >
                      {cart.name}
                    </TabsTrigger>
                    {carts.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          removeCart(cart.id)
                        }}
                        className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                ))}
              </TabsList>
              <Button
                size="sm"
                onClick={addNewCart}
                className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {carts.map((cart) => (
              <TabsContent key={cart.id} value={cart.id} className="mt-0">
                {cart.items.length === 0 ? (
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
                          {cart.items.map((item) => (
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
                                  <span className="text-sm font-medium text-[#002333] w-8 text-center">
                                    {item.quantity}
                                  </span>
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
                          {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#002333]/70">Subtotal:</span>
                        <span className="font-medium text-[#002333]">${calculateTotal(cart.items).toFixed(2)}</span>
                      </div>
                      <Separator className="bg-[#B4BEC9]/30" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#002333]">Total:</span>
                        <span className="font-bold text-[#159A9C] text-xl">
                          ${calculateTotal(cart.items).toFixed(2)}
                        </span>
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
                      <Button
                        onClick={processCart}
                        className="flex-1 bg-[#159A9C] hover:bg-[#159A9C]/90 text-white"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Procesar Compra
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <InventoryCard />
      <CartCard />
    </div>
  )
}
