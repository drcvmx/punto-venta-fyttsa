"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// Tipos de negocio disponibles
export type BusinessType = 'abarrotes' | 'ferreteria' | 'restaurante'

// Configuración de cada tipo de negocio
export interface BusinessConfig {
    id: BusinessType
    type: BusinessType  // Alias para facilitar acceso
    name: string
    description: string
    tenantId: string
    features: {
        hasRestaurantTables: boolean
        hasOnlineStore: boolean
        hasCaja: boolean
        hasProducts: boolean
        hasInventory: boolean
    }
}

// Definición de los tres negocios
export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
    abarrotes: {
        id: 'abarrotes',
        type: 'abarrotes',
        name: 'Abarrotes Don Pepe',
        description: 'Tienda de abarrotes y productos básicos',
        tenantId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Abarrotes Don Pepe
        features: {
            hasRestaurantTables: false,
            hasOnlineStore: true,
            hasCaja: true,
            hasProducts: true,
            hasInventory: true,
        },
    },
    ferreteria: {
        id: 'ferreteria',
        type: 'ferreteria',
        name: 'Ferretería El Tornillo',
        description: 'Ferretería con herramientas y materiales de construcción',
        tenantId: '2853318c-e931-4718-b955-4508168e6953', // Ferretería El Tornillo
        features: {
            hasRestaurantTables: false,
            hasOnlineStore: true,
            hasCaja: true,
            hasProducts: true,
            hasInventory: true,
        },
    },
    restaurante: {
        id: 'restaurante',
        type: 'restaurante',
        name: 'Restaurante El Sazón',
        description: 'Restaurante con servicio de mesas y platillos',
        tenantId: '83cfebd6-0668-43d1-a26f-46f32fdd8944', // Restaurante El Sazón
        features: {
            hasRestaurantTables: true,
            hasOnlineStore: true,
            hasCaja: true,
            hasProducts: true,
            hasInventory: true,
        },
    },
}

interface BusinessContextValue {
    selectedBusiness: BusinessConfig | null
    selectBusiness: (config: BusinessConfig) => void
    clearBusiness: () => void
}

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined)

const STORAGE_KEY = 'selectedBusiness' // ✅ Match AuthContext key

export function BusinessProvider({ children }: { children: ReactNode }) {
    const [selectedBusiness, setSelectedBusiness] = useState<BusinessConfig | null>(null)

    // Cargar el negocio seleccionado desde localStorage al montar
    useEffect(() => {
        console.log('🏢 BusinessContext: Loading from localStorage...')
        const stored = localStorage.getItem(STORAGE_KEY)
        console.log('🏢 BusinessContext: Stored value:', stored)

        if (stored) {
            try {
                // Intentar parsear como objeto JSON (nueva versión)
                const parsed = JSON.parse(stored)
                console.log('🏢 BusinessContext: Parsed value:', parsed)

                if (parsed && parsed.id && parsed.tenantId) {
                    setSelectedBusiness(parsed)
                    console.log('✅ BusinessContext: Business loaded successfully:', parsed.name)
                    return
                }
            } catch (e) {
                console.log('⚠️ BusinessContext: Failed to parse, trying legacy format')
                // Si falla, intentar como string antiguo (retrocompatibilidad)
                const businessType = stored as BusinessType
                if (BUSINESS_CONFIGS[businessType]) {
                    setSelectedBusiness(BUSINESS_CONFIGS[businessType])
                    console.log('✅ BusinessContext: Legacy business loaded:', businessType)
                }
            }
        } else {
            console.log('⚠️ BusinessContext: No business found in localStorage')
        }
    }, [])

    const selectBusiness = (config: BusinessConfig) => {
        console.log('💼 BusinessContext: Selecting business:', config.name)
        setSelectedBusiness(config)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
        console.log('✅ BusinessContext: Business saved to localStorage')
    }

    const clearBusiness = () => {
        console.log('🗑️ BusinessContext: Clearing business')
        setSelectedBusiness(null)
        localStorage.removeItem(STORAGE_KEY)
    }

    return (
        <BusinessContext.Provider value={{ selectedBusiness, selectBusiness, clearBusiness }}>
            {children}
        </BusinessContext.Provider>
    )
}

export function useBusinessContext() {
    const context = useContext(BusinessContext)
    if (context === undefined) {
        throw new Error('useBusinessContext must be used within a BusinessProvider')
    }
    return context
}
