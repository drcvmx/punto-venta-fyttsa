// ============================================
// TIPOS CENTRALIZADOS - PRODUCTOS
// ============================================

/**
 * Producto del catálogo global compartido entre todos los tenants
 */
export interface GlobalProduct {
    id: string;                    // UUID
    nombre?: string;
    descripcion?: string;
    imagenUrl?: string;
    codigoBarras?: string;
    categoria?: string;
    marca?: string;
    businessType?: string;         // 'abarrotes' | 'ferreteria' | 'restaurante'
    createdAt: Date;
}

/**
 * Producto específico de un tenant
 */
export interface Producto {
    id: string;                    // BIGINT (string)
    tenantId: string;              // UUID
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    marca?: string;
    categoria?: string;
    proveedor?: string;
    codigoBarras?: string;         // Código de barras del producto
    globalProductId?: string;      // UUID - Referencia al catálogo global (opcional)
    globalProduct?: GlobalProduct; // Relación con catálogo global
    variantes: Variante[];
}

/**
 * Variante de un producto (diferentes presentaciones, tamaños, etc.)
 */
export interface Variante {
    id: string;                    // BIGINT (string)
    tenantId: string;              // UUID
    productoId: string;            // BIGINT (string)
    nombreVariante: string;
    precio: number;
    costo?: number;
    unidadMedida: string;          // 'kg', 'lt', 'pza', 'caja', etc.
    trackStock: boolean;
    codigoBarras?: string;         // Código de barras de la variante
    codigoQr?: string;             // Código QR de la variante
    tipoCodigo?: 'BARRAS' | 'QR' | 'AMBOS';
    stock?: number;                // Stock disponible (si trackStock es true)
}

/**
 * Item de inventario
 */
export interface Inventario {
    id: string;                    // BIGINT (string)
    tenantId: string;              // UUID
    varianteId: string;            // BIGINT (string)
    sucursalId?: number;
    cantidad: number;              // Cantidad en stock (con 4 decimales)
    ubicacion?: string;
    fechaActualizacion: Date;
    usuarioActualizacion?: string;
}

/**
 * Respuesta de búsqueda de productos (incluye variantes)
 */
export interface ProductoConVariantes extends Producto {
    variantes: Variante[];
}

/**
 * Parámetros para crear producto desde catálogo global
 */
export interface CreateFromGlobalParams {
    globalProductId: string;       // UUID
    tenantId: string;              // UUID
    precioBase: number;            // Precio inicial
    unidadMedida?: string;         // Unidad de medida por defecto
}
