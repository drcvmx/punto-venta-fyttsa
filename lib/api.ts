const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper para obtener el token
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

// Helper para obtener headers con autenticación
function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    // Obtener tenant ID del localStorage (para backward compatibility)
    const selectedBusiness = localStorage.getItem('selectedBusiness');
    if (selectedBusiness) {
        const business = JSON.parse(selectedBusiness);
        headers['x-tenant-id'] = business.tenantId;
    }

    // Agregar token JWT si existe
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// Helper para manejar errores de autenticación
async function handleResponse(response: Response) {
    if (response.status === 401) {
        // Token inválido o expirado
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
        throw new Error('Sesión expirada (401).');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
        throw new Error(error.message || `Error: ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    patch: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    delete: async (endpoint: string) => {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};

export { api };
export default api;

