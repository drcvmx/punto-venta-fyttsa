// ============================================
// BARREL EXPORT - TIPOS CENTRALIZADOS
// ============================================

// Productos
export type {
    GlobalProduct,
    Producto,
    Variante,
    Inventario,
    ProductoConVariantes,
    CreateFromGlobalParams,
} from './product';

// Tenants
export type {
    Tenant,
    BusinessConfig,
    BusinessFeatures,
} from './tenant';

// Órdenes
export type {
    Order,
    OrderItem,
    OrderStatus,
} from './order';
