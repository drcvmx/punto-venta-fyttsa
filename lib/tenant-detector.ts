/**
 * Detecta el tenant basándose en el hostname/dominio actual
 */
export const detectTenantFromDomain = async (): Promise<TenantConfig | null> => {
    try {
        const hostname = window.location.hostname;
        const port = window.location.port;
        const domain = port ? `${hostname}:${port}` : hostname;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

        console.log('🌐 Detecting tenant from domain:', domain);

        const response = await fetch(`${API_URL}/tenants/by-domain?domain=${domain}`);

        if (!response.ok) {
            console.error('❌ Failed to fetch tenant by domain');
            return null;
        }

        const tenant = await response.json();

        if (tenant.error) {
            console.error('❌ Tenant not found:', tenant);
            return null;
        }

        console.log('✅ Tenant detected:', tenant);

        // Determinar tipo de negocio basado en tipo_negocio
        const tipoNegocio = tenant.tipo_negocio?.toLowerCase() || '';
        let businessType: 'abarrotes' | 'ferreteria' | 'restaurante' = 'abarrotes';

        if (tipoNegocio.includes('ferret') || tipoNegocio.includes('hardware')) {
            businessType = 'ferreteria';
        } else if (tipoNegocio.includes('restaurante') || tipoNegocio.includes('restaurant')) {
            businessType = 'restaurante';
        }

        const tenantConfig: TenantConfig = {
            id: businessType,
            type: businessType,
            name: tenant.nombre,
            description: `Tienda online de ${tenant.nombre}`,
            tenantId: tenant.id,
            features: {
                hasRestaurantTables: businessType === 'restaurante',
                hasOnlineStore: true,
                hasCaja: false, // E-commerce público no tiene caja
                hasProducts: true,
                hasInventory: true,
            }
        };

        console.log('💼 Tenant config created:', tenantConfig);

        return tenantConfig;
    } catch (error) {
        console.error('❌ Error detecting tenant:', error);
        return null;
    }
};

interface TenantConfig {
    id: string;
    type: 'abarrotes' | 'ferreteria' | 'restaurante';
    name: string;
    description: string;
    tenantId: string;
    features: {
        hasRestaurantTables: boolean;
        hasOnlineStore: boolean;
        hasCaja: boolean;
        hasProducts: boolean;
        hasInventory: boolean;
    };
}
