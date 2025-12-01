'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessContext } from '@/lib/business-context';

interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'super_admin' | 'tenant_admin' | 'tenant_user';
    tenantId?: string;
    tenantName?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string;
    businessType: 'tienda' | 'ferreteria' | 'restaurante';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { selectBusiness, clearBusiness } = useBusinessContext();

    // Cargar token y usuario del localStorage al montar
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al iniciar sesión');
            }

            const data = await response.json();

            console.log('✅ Login response:', data);

            // Guardar token y usuario
            localStorage.setItem('auth_token', data.access_token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            setToken(data.access_token);
            setUser(data.user);

            console.log('🔐 Token saved:', data.access_token.substring(0, 20) + '...');
            console.log('👤 User saved:', data.user);

            // Redirigir según rol
            if (data.user.role === 'super_admin') {
                // Super admin va a BusinessSelector para elegir cliente
                console.log('🚀 Super Admin - Redirecting to / (BusinessSelector)');
                router.push('/');
            } else {
                // Tenant admin/user: configurar su negocio y ir directo al dashboard
                console.log('🚀 Tenant User - Setting up business config and redirecting to /dashboard');

                // Determinar tipo de negocio basado en tenantName
                const tenantName = data.user.tenantName?.toLowerCase() || '';
                let businessType: 'abarrotes' | 'ferreteria' | 'restaurante' = 'abarrotes';

                if (tenantName.includes('ferret') || tenantName.includes('api')) {
                    businessType = 'ferreteria';
                } else if (tenantName.includes('restaurante') || tenantName.includes('sazón')) {
                    businessType = 'restaurante';
                }

                // Configurar el negocio automáticamente
                const businessConfig = {
                    id: businessType,
                    type: businessType,
                    name: data.user.tenantName || 'Mi Negocio',
                    description: `Sistema de punto de venta`,
                    tenantId: data.user.tenantId,
                    features: {
                        hasRestaurantTables: businessType === 'restaurante',
                        hasOnlineStore: true,
                        hasCaja: true,
                        hasProducts: true,
                        hasInventory: true,
                    }
                };

                localStorage.setItem('selectedBusiness', JSON.stringify(businessConfig));

                // 🔥 ACTUALIZAR ESTADO DEL NEGOCIO (Sync con BusinessContext)
                selectBusiness(businessConfig);
                console.log('💼 Business config synced:', businessConfig);

                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al registrarse');
            }

            const responseData = await response.json();

            // Auto-login después del registro
            localStorage.setItem('auth_token', responseData.access_token);
            localStorage.setItem('auth_user', JSON.stringify(responseData.user));

            setToken(responseData.access_token);
            setUser(responseData.user);

            router.push('/dashboard');
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = () => {
        // Limpiar storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('selectedBusiness');

        // Limpiar estados
        setToken(null);
        setUser(null);
        clearBusiness(); // Limpiar estado del negocio

        // 🚀 Hard Reload para limpiar memoria y cache de Next.js
        // Esto previene que usuarios vean datos de sesiones anteriores
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                register,
                logout,
                isAuthenticated: !!token && !!user,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
