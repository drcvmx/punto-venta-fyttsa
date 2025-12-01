// ============================================
// TIPOS CENTRALIZADOS - ÓRDENES
// ============================================

/**
 * Estado de una orden
 */
export type OrderStatus = 'pending_payment' | 'paid' | 'completed' | 'failed';

/**
 * Orden de compra
 */
export interface Order {
    id: string;                    // UUID
    tenantId: string;              // UUID
    storeId?: number;              // ID de sucursal
    customerEmail?: string;
    customerName?: string;
    totalAmount: number;
    stripePaymentIntentId?: string;
    status: OrderStatus;
    collectionCode?: string;       // Código de recolección
    createdAt: Date;
}

/**
 * Item de una orden
 */
export interface OrderItem {
    id: string;
    orderId: string;
    varianteId: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}
