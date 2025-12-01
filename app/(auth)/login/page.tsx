'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            // El redirect se maneja automáticamente en AuthContext
            // super_admin → /admin/dashboard
            // tenant_admin/tenant_user → /dashboard
        } catch (err: any) {
            setError(err.message || 'Credenciales inválidas');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#DEEFE7]/30 via-white to-[#B4BEC9]/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8 space-y-3">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#159A9C] flex items-center justify-center">
                            <LogIn className="h-7 w-7 text-[#159A9C]" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-[#002333] tracking-tight">
                        InventoryPro
                    </h1>
                    <p className="text-lg text-[#002333]/70">
                        Sistema Multi-Tenant de Punto de Venta
                    </p>
                </div>

                {/* Login Card */}
                <Card className="border-2 border-[#B4BEC9]/30 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-[#002333]">Iniciar Sesión</CardTitle>
                        <CardDescription className="text-[#002333]/70">
                            Ingresa tus credenciales para acceder
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-[#002333]">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-[#002333]/40" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#B4BEC9]/30 rounded-lg focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] transition text-[#002333]"
                                        placeholder="tu@email.com"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-[#002333]">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-[#002333]/40" />
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-[#B4BEC9]/30 rounded-lg focus:ring-2 focus:ring-[#159A9C] focus:border-[#159A9C] transition text-[#002333]"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#159A9C] hover:bg-[#159A9C]/90 text-white py-3 transition-all duration-300 hover:shadow-lg"
                            >
                                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-[#002333]/70">
                                ¿No tienes una cuenta?{' '}
                                <Link
                                    href="/register"
                                    className="text-[#159A9C] hover:text-[#159A9C]/80 font-semibold transition"
                                >
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-[#DEEFE7]/30 rounded-lg border border-[#B4BEC9]/30">
                            <p className="text-xs font-semibold text-[#002333] mb-2">Cuentas de Prueba:</p>
                            <div className="space-y-1 text-xs text-[#002333]/70">
                                <p><strong className="text-[#159A9C]">Super Admin:</strong> admin@drcv.com / Admin123!</p>
                                <p><strong className="text-[#159A9C]">Dueño:</strong> dueno@abarrotes.com / Admin123!</p>
                                <p><strong className="text-[#159A9C]">Cajero:</strong> cajero@abarrotes.com / Admin123!</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-[#002333]/50">
                        Sistema Multi-Tenant • Autenticación Segura JWT
                    </p>
                </div>
            </div>
        </div>
    );
}
