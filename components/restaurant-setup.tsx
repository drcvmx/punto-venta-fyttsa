"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Check } from "lucide-react"
import { useBusinessContext } from "@/lib/business-context"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TableConfig {
    seats: number
    count: number
}

export function RestaurantSetup() {
    const { selectedBusiness } = useBusinessContext()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [configs, setConfigs] = useState<TableConfig[]>([
        { seats: 2, count: 0 },
        { seats: 4, count: 0 },
        { seats: 6, count: 0 },
        { seats: 8, count: 0 },
    ])

    const updateCount = (seats: number, delta: number) => {
        setConfigs(configs.map(c =>
            c.seats === seats
                ? { ...c, count: Math.max(0, Math.min(50, c.count + delta)) }
                : c
        ))
    }

    const getTotalTables = () => configs.reduce((sum, c) => sum + c.count, 0)
    const getTotalSeats = () => configs.reduce((sum, c) => sum + (c.seats * c.count), 0)

    const handleSubmit = async () => {
        if (!selectedBusiness) {
            toast.error("No hay negocio seleccionado")
            return
        }

        const validConfigs = configs.filter(c => c.count > 0)

        if (validConfigs.length === 0) {
            toast.error("Debes configurar al menos una mesa")
            return
        }

        setLoading(true)
        try {
            await api.post('/restaurant/tables/setup', {
                tables: validConfigs
            }, selectedBusiness.tenantId)

            toast.success(`¡Configuración completada! ${getTotalTables()} mesas creadas`)
            router.refresh()
        } catch (error) {
            console.error("Error al configurar mesas:", error)
            toast.error("Error al configurar las mesas")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-[#159A9C]">
                <CardHeader className="bg-[#DEEFE7]/30">
                    <CardTitle className="text-[#002333] text-2xl">Configuración de Mesas</CardTitle>
                    <CardDescription className="text-[#002333]/70">
                        Configura cuántas mesas tendrá tu restaurante según su capacidad
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {configs.map((config) => (
                        <div
                            key={config.seats}
                            className="flex items-center justify-between p-4 border border-[#B4BEC9]/30 rounded-lg hover:border-[#159A9C]/50 transition-colors"
                        >
                            <div className="flex-1">
                                <Label className="text-lg font-semibold text-[#002333]">
                                    Mesas de {config.seats} personas
                                </Label>
                                <p className="text-sm text-[#002333]/60">
                                    Capacidad total: {config.seats * config.count} personas
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateCount(config.seats, -1)}
                                    disabled={config.count === 0}
                                    className="border-[#B4BEC9]/50 hover:border-[#159A9C] hover:bg-[#DEEFE7]/30"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                <Input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={config.count}
                                    onChange={(e) => {
                                        const newCount = parseInt(e.target.value) || 0
                                        setConfigs(configs.map(c =>
                                            c.seats === config.seats
                                                ? { ...c, count: Math.max(0, Math.min(50, newCount)) }
                                                : c
                                        ))
                                    }}
                                    className="w-20 text-center text-lg font-bold border-[#B4BEC9]/50 focus:border-[#159A9C]"
                                />

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateCount(config.seats, 1)}
                                    disabled={config.count >= 50}
                                    className="border-[#B4BEC9]/50 hover:border-[#159A9C] hover:bg-[#DEEFE7]/30"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {/* Resumen */}
                    <Card className="bg-[#DEEFE7]/20 border-[#159A9C]/30">
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-base">
                                    <span className="text-[#002333]/70">Total de Mesas:</span>
                                    <span className="font-bold text-[#159A9C] text-xl">{getTotalTables()}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span className="text-[#002333]/70">Capacidad Total:</span>
                                    <span className="font-semibold text-[#002333]">{getTotalSeats()} personas</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || getTotalTables() === 0}
                        className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white text-lg py-6"
                    >
                        <Check className="mr-2 h-5 w-5" />
                        {loading ? "Configurando..." : "Confirmar Configuración"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
