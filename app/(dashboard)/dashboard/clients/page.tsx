import { ClientsTable } from "@/components/clients-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#002333]">
            Clientes
          </h1>
          <p className="text-sm sm:text-base text-[#002333]/70">
            Gestiona las relaciones con tus clientes e información de contacto
          </p>
        </div>
        <Button
          asChild
          className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white w-full sm:w-auto"
        >
          <Link href="/dashboard/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Link>
        </Button>
      </div>

      <ClientsTable />
    </div>
  );
}
