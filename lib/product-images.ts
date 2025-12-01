/**
 * Utilidad para manejar imágenes de productos según el tipo de negocio
 */

export type BusinessType = 'abarrotes' | 'ferreteria' | 'restaurante';

/**
 * Obtiene la URL de imagen para un producto
 * @param imagenUrl - URL almacenada en la base de datos (puede ser null)
 * @param businessType - Tipo de negocio
 * @param nombreProducto - Nombre del producto para búsqueda
 * @param codigoBarras - Código de barras (opcional, para Open Food Facts)
 * @returns URL de la imagen a mostrar
 */
export function getProductImageUrl(
    imagenUrl: string | null,
    businessType: BusinessType,
    nombreProducto: string,
    codigoBarras?: string
): string {
    // 1. Si ya tiene una URL (restaurante o manual), usarla
    // 1. Si ya tiene una URL (restaurante o manual), usarla
    if (imagenUrl) {
        // Limpiar dobles slashes que no sean del protocolo (https://)
        return imagenUrl.replace(/([^:]\/)\/+/g, '$1');
    }

    // 2. Para abarrotes con código de barras, intentar Open Food Facts
    if (businessType === 'abarrotes' && codigoBarras) {
        return getOpenFoodFactsImage(codigoBarras);
    }

    // 3. Para ferretería o abarrotes sin código, usar Unsplash
    if (businessType === 'ferreteria' || businessType === 'abarrotes') {
        return getUnsplashImage(nombreProducto);
    }

    // 4. Fallback a placeholder por tipo de negocio
    return getPlaceholderImage(businessType, nombreProducto);
}

/**
 * Obtiene imagen desde Open Food Facts API
 */
function getOpenFoodFactsImage(barcode: string): string {
    // Formato del código de barras para la URL
    const formattedBarcode = barcode.replace(/\s/g, '');

    // Intentar obtener imagen frontal en español, si no existe, fallback a genérica
    return `https://images.openfoodfacts.org/images/products/${formattedBarcode.split('').join('/')}/front_es.jpg`;
}

/**
 * Obtiene imagen desde Unsplash (genérica por búsqueda)
 */
function getUnsplashImage(productName: string): string {
    // Limpiar el nombre del producto para la búsqueda
    const searchTerm = encodeURIComponent(productName.toLowerCase());

    // Unsplash Source API - imagen aleatoria por término de búsqueda
    return `https://source.unsplash.com/400x400/?${searchTerm},product`;
}

/**
 * Obtiene imagen placeholder según tipo de negocio
 */
function getPlaceholderImage(businessType: BusinessType, productName: string): string {
    const encodedName = encodeURIComponent(productName);

    const placeholders = {
        abarrotes: `https://via.placeholder.com/400x400/159A9C/FFFFFF?text=${encodedName}`,
        ferreteria: `https://via.placeholder.com/400x400/002333/FFFFFF?text=${encodedName}`,
        restaurante: `https://via.placeholder.com/400x400/DEEFE7/002333?text=${encodedName}`,
    };

    return placeholders[businessType];
}

/**
 * Valida si una URL de imagen es válida
 */
export async function validateImageUrl(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        return response.ok && (contentType?.startsWith('image/') ?? false);
    } catch {
        return false;
    }
}

/**
 * Obtiene imagen con fallback automático si la URL falla
 */
export async function getProductImageWithFallback(
    imagenUrl: string | null,
    businessType: BusinessType,
    nombreProducto: string,
    codigoBarras?: string
): Promise<string> {
    const primaryUrl = getProductImageUrl(imagenUrl, businessType, nombreProducto, codigoBarras);

    // Intentar validar la URL primaria
    const isValid = await validateImageUrl(primaryUrl);

    if (isValid) {
        return primaryUrl;
    }

    // Si falla, usar placeholder
    return getPlaceholderImage(businessType, nombreProducto);
}
