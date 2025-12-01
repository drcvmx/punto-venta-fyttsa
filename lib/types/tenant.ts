// ============================================
// TIPOS CENTRALIZADOS - TENANTS
// ============================================

/**
 * Tenant (negocio/empresa) en el sistema
 */
export interface Tenant {
    id: string;                    // UUID
    nombre: string;
    tipoNegocio?: string;          // 'RETAIL', 'Ferreteria', 'Restaurante', etc.
    ownerUserId?: string;          // UUID del usuario propietario
}

/**
 * Configuración de negocio para el frontend
 */
export interface BusinessConfig {
    id: string;
    type: 'abarrotes' | 'ferreteria' | 'restaurante';
    name: string;
    description: string;
    tenantId: string;              // UUID
    features: BusinessFeatures;
}

/**
 * Características habilitadas por tipo de negocio
 */
export interface BusinessFeatures {
    hasRestaurantTables: boolean;
    hasOnlineStore: boolean;
    hasCaja: boolean;
    hasProducts: boolean;
    hasInventory: boolean;
}
