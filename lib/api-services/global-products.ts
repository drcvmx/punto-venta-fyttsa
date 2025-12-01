import { api } from '../api';
import type { GlobalProduct, CreateFromGlobalParams, ProductoConVariantes } from '../types';

/**
 * API para interactuar con el catálogo global de productos
 */
export const globalProductsApi = {
    /**
     * Buscar productos en el catálogo global por código de barras
     */
    searchByBarcode: async (barcode: string): Promise<GlobalProduct | null> => {
        try {
            console.log('🌐 API Call: /catalogo/global/search?barcode=', barcode);
            const result = await api.get(`/catalogo/global/search?barcode=${encodeURIComponent(barcode)}`);
            console.log('🌐 API Response type:', typeof result);
            console.log('🌐 API Response is array:', Array.isArray(result));
            console.log('🌐 API Response value:', result);
            return result || null;
        } catch (error) {
            console.error('Error buscando en catálogo global por código de barras:', error);
            return null;
        }
    },

    /**
     * Buscar productos en el catálogo global por texto
     */
    searchGlobal: async (query: string, businessType?: string): Promise<GlobalProduct[]> => {
        try {
            let url = `/catalogo/global/search?q=${encodeURIComponent(query)}`;
            if (businessType) {
                url += `&businessType=${businessType}`;
            }
            const results = await api.get(url);
            return results || [];
        } catch (error) {
            console.error('Error buscando en catálogo global:', error);
            return [];
        }
    },

    /**
     * Obtener todos los productos del catálogo global
     */
    getAll: async (businessType?: string): Promise<GlobalProduct[]> => {
        try {
            let url = '/catalogo/global';
            if (businessType) {
                url += `?businessType=${businessType}`;
            }
            const results = await api.get(url);
            return results || [];
        } catch (error) {
            console.error('Error obteniendo catálogo global:', error);
            return [];
        }
    },

    /**
     * Crear producto local desde catálogo global
     */
    createFromGlobal: async (params: CreateFromGlobalParams): Promise<ProductoConVariantes> => {
        try {
            const result = await api.post('/catalogo/from-global', params);
            return result;
        } catch (error) {
            console.error('Error creando producto desde catálogo global:', error);
            throw error;
        }
    },

    /**
     * Obtener detalles de un producto del catálogo global
     */
    getById: async (id: string): Promise<GlobalProduct | null> => {
        try {
            const result = await api.get(`/catalogo/global/${id}`);
            return result || null;
        } catch (error) {
            console.error('Error obteniendo producto global:', error);
            return null;
        }
    },
};
