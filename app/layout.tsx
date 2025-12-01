import type { Metadata } from "next";
import "./globals.css";
import { BusinessProvider } from '@/lib/business-context';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: "Punto de Venta DRCV",
  description: "Sistema Multi-Tenant para Punto de Venta",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <BusinessProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BusinessProvider>
      </body>
    </html>
  );
}
