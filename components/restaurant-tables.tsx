"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, DollarSign, CheckCircle2, XCircle, Plus, Minus, Trash2, UtensilsCrossed } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useBusinessContext } from "@/lib/business-context"
import { api } from "@/lib/api"
import { toast } from "sonner"

type TableStatus = "available" | "occupied" | "reserved"

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  image?: string
}

interface OrderItem extends MenuItem {
  quantity: number
}

interface Table {
  id: string
  tableNumber: number
  seats: number
  status: TableStatus
  currentOrder?: {
    items: OrderItem[]
    startTime: string
  }
}

export function RestaurantTables() {
  const { selectedBusiness } = useBusinessContext()
  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar mesas y productos del API
  useEffect(() => {
    const loadData = async () => {
      if (!selectedBusiness) return

      try {
        setLoading(true)

        // Cargar mesas
        const tablesData = await api.get('/restaurant/tables', selectedBusiness.tenantId)
        setTables(tablesData.map((t: any) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          seats: t.seats,
          status: t.status,
          currentOrder: undefined
        })))

        // Cargar productos del catálogo
        const productsData = await api.get('/catalogo', selectedBusiness.tenantId)
        const items: MenuItem[] = productsData.flatMap((p: any) =>
          p.variantes?.map((v: any) => ({
            id: v.id.toString(),
            name: `${p.nombre} - ${v.nombreVariante}`,
            category: p.categoria || "Sin Categoría",  // Usar categoría real del producto
            price: parseFloat(v.precio),
          })) || []
        )
        setMenuItems(items)
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Error al cargar datos del restaurante")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedBusiness])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#002333]/60">Cargando mesas y productos...</p>
      </div>
    )
  }

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "bg-[#DEEFE7] text-[#159A9C] border-[#159A9C]/30"
      case "occupied":
        return "bg-[#159A9C]/10 text-[#159A9C] border-[#159A9C]"
      case "reserved":
        return "bg-[#B4BEC9]/20 text-[#002333] border-[#B4BEC9]"
    }
  }

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case "available":
        return "Disponible"
      case "occupied":
        return "Ocupada"
      case "reserved":
        return "Reservada"
    }
  }

  const changeTableStatus = async (tableId: string, newStatus: TableStatus) => {
    if (!selectedBusiness) return

    try {
      await api.patch(`/restaurant/tables/${tableId}/status`, { status: newStatus }, selectedBusiness.tenantId)

      setTables((prev) =>
        prev.map((table) =>
          table.id === tableId
            ? {
              ...table,
              status: newStatus,
              currentOrder: newStatus === "available" ? undefined : table.currentOrder,
            }
            : table,
        ),
      )
      toast.success("Estado actualizado")
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Error al actualizar estado")
    }
  }

  const addItemToOrder = (tableId: string, menuItem: MenuItem) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId) return table

        const currentOrder = table.currentOrder || {
          items: [],
          startTime: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        }

        const existingItem = currentOrder.items.find((item) => item.id === menuItem.id)

        if (existingItem) {
          return {
            ...table,
            status: "occupied" as TableStatus,
            currentOrder: {
              ...currentOrder,
              items: currentOrder.items.map((item) =>
                item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            },
          }
        }

        return {
          ...table,
          status: "occupied" as TableStatus,
          currentOrder: {
            ...currentOrder,
            items: [...currentOrder.items, { ...menuItem, quantity: 1 }],
          },
        }
      }),
    )
  }

  const updateItemQuantity = (tableId: string, itemId: string, change: number) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId || !table.currentOrder) return table

        const updatedItems = table.currentOrder.items
          .map((item) => (item.id === itemId ? { ...item, quantity: item.quantity + change } : item))
          .filter((item) => item.quantity > 0)

        return {
          ...table,
          currentOrder: {
            ...table.currentOrder,
            items: updatedItems,
          },
        }
      }),
    )
  }

  const removeItemFromOrder = (tableId: string, itemId: string) => {
    setTables((prev) =>
      prev.map((table) => {
        if (table.id !== tableId || !table.currentOrder) return table

        return {
          ...table,
          currentOrder: {
            ...table.currentOrder,
            items: table.currentOrder.items.filter((item) => item.id !== itemId),
          },
        }
      }),
    )
  }

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const closeTable = (tableId: string) => {
    changeTableStatus(tableId, "available")
    setIsOrderDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#B4BEC9]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#002333]/70">Mesas Disponibles</p>
                <p className="text-2xl font-bold text-[#159A9C]">
                  {tables.filter((t) => t.status === "available").length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-[#159A9C]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#B4BEC9]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#002333]/70">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-[#002333]">
                  {tables.filter((t) => t.status === "occupied").length}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#002333]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#B4BEC9]/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#002333]/70">Total en Curso</p>
                <p className="text-2xl font-bold text-[#159A9C]">
                  $
                  {tables
                    .filter((t) => t.status === "occupied")
                    .reduce((sum, t) => sum + calculateTotal(t.currentOrder?.items || []), 0)
                    .toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-[#159A9C]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tables.map((table) => (
          <Dialog key={table.id}>
            <DialogTrigger asChild>
              <Card
                className={`border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${table.status === "available"
                  ? "border-[#159A9C]/30 hover:border-[#159A9C]"
                  : table.status === "occupied"
                    ? "border-[#159A9C] bg-[#DEEFE7]/20"
                    : "border-[#B4BEC9]/50"
                  }`}
                onClick={() => setSelectedTable(table)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#002333] flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#159A9C]" />
                      Mesa {table.tableNumber}
                    </CardTitle>
                    <Badge className={getStatusColor(table.status)}>{getStatusText(table.status)}</Badge>
                  </div>
                  <CardDescription className="text-[#002333]/70">{table.seats} asientos</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Visualización de asientos */}
                  <div className="flex justify-center gap-3 mb-4">
                    {Array.from({ length: table.seats }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${table.status === "occupied"
                          ? "border-[#159A9C] bg-[#159A9C]/20"
                          : "border-[#B4BEC9]/50 bg-white"
                          }`}
                      >
                        <Users
                          className={`h-5 w-5 ${table.status === "occupied" ? "text-[#159A9C]" : "text-[#B4BEC9]"}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Información de la orden */}
                  {table.currentOrder && table.currentOrder.items.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-[#B4BEC9]/30">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#002333]/70 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Inicio:
                        </span>
                        <span className="font-medium text-[#002333]">{table.currentOrder.startTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#002333]/70">Items:</span>
                        <span className="font-medium text-[#002333]">
                          {table.currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#002333]/70">Total:</span>
                        <span className="font-bold text-[#159A9C]">
                          ${calculateTotal(table.currentOrder.items).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </DialogTrigger>

            <DialogContent className="bg-white border-[#B4BEC9]/30 w-full max-w-[95vw] md:max-w-5xl max-h-[95vh] overflow-hidden">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-[#002333] flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-[#159A9C]" />
                      Mesa {table.tableNumber}
                    </DialogTitle>
                    <DialogDescription className="text-[#002333]/70">
                      {table.currentOrder && table.currentOrder.items.length > 0
                        ? "Gestiona la orden de la mesa"
                        : "Selecciona items del menú"}
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(table.status)}>{getStatusText(table.status)}</Badge>
                </div>
              </DialogHeader>

              {/* Botones de cambio de estado */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-[#002333]/70">Estado:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeTableStatus(table.id, "available")}
                    className={`border-[#159A9C]/30 hover:bg-[#DEEFE7]/50 ${table.status === "available" ? "bg-[#DEEFE7]/50 border-[#159A9C]" : ""
                      }`}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Disponible
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeTableStatus(table.id, "occupied")}
                    className={`border-[#159A9C]/30 hover:bg-[#159A9C]/10 ${table.status === "occupied" ? "bg-[#159A9C]/10 border-[#159A9C]" : ""
                      }`}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Ocupar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeTableStatus(table.id, "reserved")}
                    className={`border-[#B4BEC9]/50 hover:bg-[#B4BEC9]/10 ${table.status === "reserved" ? "bg-[#B4BEC9]/10 border-[#B4BEC9]" : ""
                      }`}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Reservar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 h-[calc(95vh-200px)] overflow-hidden">
                {/* Menú de comida */}
                <div className="flex flex-col h-full overflow-hidden">
                  <h3 className="font-semibold text-[#002333] flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-[#159A9C]" />
                    Menú Disponible
                  </h3>
                  <ScrollArea className="flex-1 overflow-auto pr-4">
                    <div className="space-y-4">
                      {/* Obtener categorías únicas dinámicamente */}
                      {Array.from(new Set(menuItems.map(item => item.category))).map((category) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-[#002333]/70 mb-2">{category}</h4>
                          <div className="space-y-2">
                            {menuItems
                              .filter((item) => item.category === category)
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between p-3 border border-[#B4BEC9]/30 rounded-lg hover:bg-[#DEEFE7]/20 transition-colors"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#002333]">{item.name}</p>
                                    <p className="text-sm text-[#159A9C] font-semibold">${item.price.toFixed(2)}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => addItemToOrder(table.id, item)}
                                    className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white shadow-sm"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Orden actual */}
                <div className="flex flex-col h-full overflow-hidden">
                  <h3 className="font-semibold text-[#002333]">Orden Actual</h3>
                  {!table.currentOrder || table.currentOrder.items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#B4BEC9]/30 rounded-lg">
                      <p className="text-[#002333]/50 text-sm">No hay items en la orden</p>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="flex-1 overflow-auto pr-2">
                        <div className="space-y-2">
                          {table.currentOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#DEEFE7]/20 border border-[#B4BEC9]/30 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#002333]">{item.name}</p>
                                <p className="text-xs text-[#002333]/70">${item.price.toFixed(2)} c/u</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateItemQuantity(table.id, item.id, -1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium text-[#002333] w-6 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateItemQuantity(table.id, item.id, 1)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItemFromOrder(table.id, item.id)}
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Footer compacto con total y botón */}
                      <div className="space-y-2 pt-2 border-t border-[#B4BEC9]/30">
                        <div className="flex items-center justify-between p-2 bg-[#DEEFE7]/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-xs text-[#002333]/70">
                              Items: <span className="font-medium text-[#002333]">{table.currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-[#002333]/70">Total: </span>
                              <span className="font-bold text-[#159A9C] text-lg">
                                ${calculateTotal(table.currentOrder.items).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white shadow-sm"
                            onClick={() => closeTable(table.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Cerrar
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}
