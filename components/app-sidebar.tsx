"use client";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Users,
  FileText,
  BarChart3,
  Settings,
  CreditCard,
  UtensilsCrossed,
  LogOut,
  ArrowLeftRight,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useBusinessContext } from "@/lib/business-context";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedBusiness, clearBusiness } = useBusinessContext();
  const { user, logout } = useAuth();

  console.log('Sidebar Debug:', {
    role: user?.role,
    businessType: selectedBusiness?.type,
    hasCaja: selectedBusiness?.features.hasCaja
  });

  // Define todas las opciones de navegación con sus condiciones de visibilidad
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      visible: user?.role !== 'tenant_user', // Ocultar Dashboard para empleados
    },
    {
      title: "Caja",
      url: "/dashboard/caja",
      icon: CreditCard,
      visible: selectedBusiness?.features.hasCaja,
    },
    {
      title: "Tienda Online",
      url: "/dashboard/store-preview",
      icon: ShoppingBag,
      visible: selectedBusiness?.features.hasOnlineStore,
    },
    {
      title: "Mesas de Restaurante",
      url: "/dashboard/restaurant",
      icon: UtensilsCrossed,
      visible: selectedBusiness?.features.hasRestaurantTables,
    },
    {
      title: "Inventario",
      url: "/dashboard/inventario",
      icon: ClipboardList,
      visible: selectedBusiness?.features.hasInventory,
    },
    // HIDDEN SECTIONS - Uncomment when needed
    // {
    //   title: "Sales",
    //   url: "/dashboard/sales",
    //   icon: ShoppingCart,
    //   visible: true,
    // },
    // {
    //   title: "Purchases",
    //   url: "/dashboard/purchases",
    //   icon: ShoppingBag,
    //   visible: true,
    // },
    // {
    //   title: "Clients",
    //   url: "/dashboard/clients",
    //   icon: Users,
    //   visible: true,
    // },
    // {
    //   title: "Invoices",
    //   url: "/dashboard/invoices",
    //   icon: FileText,
    //   visible: true,
    // },
    // {
    //   title: "Reports",
    //   url: "/dashboard/reports",
    //   icon: BarChart3,
    //   visible: true,
    // },
  ].filter((item) => item.visible);

  const handleChangeBusiness = () => {
    clearBusiness();
    router.push("/");
  };

  return (
    <Sidebar className="bg-white/40 backdrop-blur-md border-r border-[#B4BEC9]/20">
      <SidebarHeader className="border-b border-[#B4BEC9]/10 px-6 py-4 bg-white/30">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#159A9C]/90 text-white shadow-sm">
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-sm font-semibold text-[#002333]">
              {selectedBusiness?.name || "InventoryPro"}
            </span>
            <span className="text-xs text-[#002333]/60">
              {selectedBusiness ? (selectedBusiness.id.charAt(0).toUpperCase() + selectedBusiness.id.slice(1)) : "Sistema Multi-Tenant"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#002333]/70 text-xs font-medium px-3">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="data-[active=true]:bg-[#159A9C]/10 data-[active=true]:text-[#159A9C] data-[active=true]:border-l-2 data-[active=true]:border-[#159A9C] hover:bg-[#DEEFE7]/50 text-[#002333]/80 transition-all duration-200"
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#B4BEC9]/10 p-4 bg-white/30 flex flex-col gap-2">
        {user?.role === 'super_admin' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleChangeBusiness}
            className="w-full justify-start border-[#B4BEC9]/30 hover:bg-[#DEEFE7]/50 text-[#002333]/80 transition-all duration-200"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Cambiar Negocio
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start hover:bg-red-50 text-red-600/80 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
