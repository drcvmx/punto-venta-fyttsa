/**
 * Ejemplo de uso de la utilidad de imágenes de productos
 */

import { getProductImageUrl } from '@/lib/product-images';

// Ejemplo 1: Producto de Abarrotes con código de barras
const cocaCola = {
    nombre: 'Coca Cola',
    imagen_url: null,
    codigo_barras: '7501055300013',
};

const imagenCocaCola = getProductImageUrl(
    cocaCola.imagen_url,
    'abarrotes',
    cocaCola.nombre,
    cocaCola.codigo_barras
);
// Resultado: https://images.openfoodfacts.org/images/products/7/5/0/1/0/5/5/3/0/0/0/1/3/front_es.jpg

// Ejemplo 2: Producto de Ferretería sin código de barras
const martillo = {
    nombre: 'Martillo',
    imagen_url: null,
};

const imagenMartillo = getProductImageUrl(
    martillo.imagen_url,
    'ferreteria',
    martillo.nombre
);
// Resultado: https://source.unsplash.com/400x400/?martillo,product

// Ejemplo 3: Platillo de Restaurante con URL manual
const tacos = {
    nombre: 'Tacos al Pastor',
    imagen_url: 'https://mi-servidor.com/imagenes/tacos-pastor.jpg',
};

const imagenTacos = getProductImageUrl(
    tacos.imagen_url,
    'restaurante',
    tacos.nombre
);
// Resultado: https://mi-servidor.com/imagenes/tacos-pastor.jpg

// Ejemplo 4: Producto sin imagen (fallback a placeholder)
const productoGenerico = {
    nombre: 'Producto Nuevo',
    imagen_url: null,
};

const imagenGenerica = getProductImageUrl(
    productoGenerico.imagen_url,
    'abarrotes',
    productoGenerico.nombre
);
// Resultado: https://via.placeholder.com/400x400/159A9C/FFFFFF?text=Producto%20Nuevo
