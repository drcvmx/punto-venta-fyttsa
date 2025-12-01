"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Wrench, UtensilsCrossed, ArrowRight, ArrowLeft, Building2 } from "lucide-react"
import { useBusinessContext, type BusinessType, BUSINESS_CONFIGS } from "@/lib/business-context"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Tenant {
    id: string
    nombre: string
    tipoNegocio?: string  // Cambiado de tipo_negocio a tipoNegocio (camelCase)
}

const businessTypeOptions = [
    {
        type: 'abarrotes' as BusinessType,
        icon: ShoppingBag,
        title: 'Abarrotes',
        description: 'Tienda de abarrotes y productos básicos',
        gradient: 'from-[#159A9C]/20 to-[#DEEFE7]/20',
        iconColor: 'text-[#159A9C]',
    },
    {
        type: 'ferreteria' as BusinessType,
        icon: Wrench,
        title: 'Ferretería',
        description: 'Herramientas y materiales de construcción',
        gradient: 'from-[#159A9C]/20 to-[#DEEFE7]/20',
        iconColor: 'text-[#159A9C]',
    },
    {
        type: 'restaurante' as BusinessType,
        icon: UtensilsCrossed,
        title: 'Restaurante',
        description: 'Gestión de mesas, pedidos y servicios de comida',
        gradient: 'from-[#159A9C]/15 to-[#002333]/10',
        iconColor: 'text-[#159A9C]',
    },
]

export function BusinessSelector() {
    const { selectBusiness } = useBusinessContext()
    const router = useRouter()
    const [step, setStep] = useState<'type' | 'specific'>('type')
    const [selectedType, setSelectedType] = useState<BusinessType | null>(null)
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [loading, setLoading] = useState(false)

    const handleSelectType = async (type: BusinessType) => {
        setSelectedType(type)
        setLoading(true)

        try {
            // Obtener todos los tenants del backend usando api helper
            const allTenants: Tenant[] = await api.get('/tenants')

            console.log('📊 Tenants obtenidos:', allTenants)

            // Filtrar por tipo de negocio
            const typeMapping: Record<BusinessType, string[]> = {
                'abarrotes': ['RETAIL', 'Abarrotes', 'abarrotes'],
                'ferreteria': ['Ferreteria', 'ferreteria', 'HARDWARE'],
                'restaurante': ['Restaurante', 'restaurante', 'RESTAURANT']
            }

            const filteredTenants = allTenants.filter(t =>
                t.tipoNegocio && typeMapping[type].some(typeStr =>
                    t.tipoNegocio!.toLowerCase().includes(typeStr.toLowerCase())
                )
            )

            console.log(`🔍 Tenants filtrados para ${type}:`, filteredTenants)

            setTenants(filteredTenants)

            // Si solo hay un negocio de este tipo, seleccionarlo automáticamente
            if (filteredTenants.length === 1) {
                handleSelectSpecific(filteredTenants[0].id)
            } else if (filteredTenants.length > 0) {
                setStep('specific')
            } else {
                // No hay tenants de este tipo, usar configuración por defecto
                console.warn(`⚠️ No se encontraron tenants de tipo ${type}, usando configuración por defecto`)
                const defaultConfig = BUSINESS_CONFIGS[type]
                selectBusiness(defaultConfig)
                router.push('/dashboard')
            }
        } catch (error) {
            console.error('❌ Error fetching tenants:', error)
            // Fallback: usar el negocio predeterminado
            const defaultConfig = BUSINESS_CONFIGS[type]
            selectBusiness(defaultConfig)
            router.push('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectSpecific = (tenantId: string) => {
        // Encontrar el tenant seleccionado
        const tenant = tenants.find(t => t.id === tenantId)
        if (!tenant || !selectedType) return

        // Configuración base de características según el tipo de negocio
        const baseFeatures = {
            abarrotes: {
                hasRestaurantTables: false,
                hasOnlineStore: true,
                hasCaja: true,
                hasProducts: true,
                hasInventory: true,
            },
            ferreteria: {
                hasRestaurantTables: false,
                hasOnlineStore: true,
                hasCaja: true,
                hasProducts: true,
                hasInventory: true,
            },
            restaurante: {
                hasRestaurantTables: true,
                hasOnlineStore: true,
                hasCaja: true,
                hasProducts: true,
                hasInventory: true,
            }
        }

        // Construir la configuración completa del negocio
        const businessConfig = {
            id: selectedType,
            type: selectedType,
            name: tenant.nombre,
            description: `Sistema de punto de venta para ${selectedType}`,
            tenantId: tenant.id,
            features: baseFeatures[selectedType]
        }

        selectBusiness(businessConfig)
        router.push('/dashboard')
    }

    const handleBack = () => {
        setStep('type')
        setSelectedType(null)
        setTenants([])
    }

    if (step === 'specific' && selectedType) {
        const selectedOption = businessTypeOptions.find(opt => opt.type === selectedType)!

        return (
            <div className="min-h-screen bg-gradient-to-br from-[#DEEFE7]/30 via-white to-[#B4BEC9]/10 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <selectedOption.icon className={`h-10 w-10 ${selectedOption.iconColor}`} />
                            <h1 className="text-4xl font-bold text-[#002333] tracking-tight">
                                Selecciona tu {selectedOption.title}
                            </h1>
                        </div>
                        <p className="text-lg text-[#002333]/70 max-w-2xl mx-auto">
                            Elige el negocio específico al que deseas acceder
                        </p>
                    </div>

                    {/* Tenants Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-[#002333]/60">Cargando negocios...</p>
                        </div>
                    ) : tenants.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-[#002333]/60">No hay negocios de este tipo disponibles</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tenants.map((tenant) => (
                                <Card
                                    key={tenant.id}
                                    className="group relative overflow-hidden border-2 border-[#B4BEC9]/30 hover:border-[#159A9C] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                                    onClick={() => handleSelectSpecific(tenant.id)}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedOption.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    <CardHeader className="relative z-10 space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#B4BEC9]/30 group-hover:border-[#159A9C] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                            <Building2 className={`h-8 w-8 ${selectedOption.iconColor}`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-[#002333] text-xl group-hover:text-[#159A9C] transition-colors">
                                                {tenant.nombre}
                                            </CardTitle>
                                            <CardDescription className="text-[#002333]/70 mt-2">
                                                {tenant.tipoNegocio || 'Sin tipo'}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="relative z-10">
                                        <Button
                                            className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white group-hover:shadow-lg transition-all duration-300"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleSelectSpecific(tenant.id)
                                            }}
                                        >
                                            Seleccionar
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#DEEFE7]/30 via-white to-[#B4BEC9]/10 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold text-[#002333] tracking-tight">
                        Bienvenido a InventoryPro
                    </h1>
                    <p className="text-lg text-[#002333]/70 max-w-2xl mx-auto">
                        Selecciona el tipo de negocio para acceder a tu dashboard personalizado
                    </p>
                </div>

                {/* Business Type Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {businessTypeOptions.map((business) => (
                        <Card
                            key={business.type}
                            className="group relative overflow-hidden border-2 border-[#B4BEC9]/30 hover:border-[#159A9C] transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                            onClick={() => handleSelectType(business.type)}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${business.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <CardHeader className="relative z-10 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#B4BEC9]/30 group-hover:border-[#159A9C] flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                                    <business.icon className={`h-8 w-8 ${business.iconColor}`} />
                                </div>
                                <div>
                                    <CardTitle className="text-[#002333] text-xl group-hover:text-[#159A9C] transition-colors">
                                        {business.title}
                                    </CardTitle>
                                    <CardDescription className="text-[#002333]/70 mt-2">
                                        {business.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="relative z-10">
                                <Button
                                    className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white group-hover:shadow-lg transition-all duration-300"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleSelectType(business.type)
                                    }}
                                >
                                    Seleccionar
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="text-center">
                    <p className="text-sm text-[#002333]/50">
                        Demo Multi-Tenant SaaS • Segregación Lógica de Datos
                    </p>
                </div>
            </div>
        </div>
    )
}
