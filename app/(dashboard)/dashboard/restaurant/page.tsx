"use client"

import { useEffect, useState } from "react"
import { RestaurantTables } from "@/components/restaurant-tables"
import { RestaurantSetup } from "@/components/restaurant-setup"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useBusinessContext } from "@/lib/business-context"
import { api } from "@/lib/api"
import Link from "next/link"

export default function RestaurantPage() {
  const { selectedBusiness } = useBusinessContext()
  const [hasTablesConfigured, setHasTablesConfigured] = useState<boolean | null>(null)

  useEffect(() => {
    const checkTables = async () => {
      if (!selectedBusiness) return

      try {
        const tables = await api.get('/restaurant/tables', selectedBusiness.tenantId)
        setHasTablesConfigured(tables.length > 0)
      } catch (error) {
        console.error("Error checking tables:", error)
        setHasTablesConfigured(false)
      }
    }
    checkTables()
  }, [selectedBusiness])

  if (hasTablesConfigured === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#002333]/60">Cargando...</p>
      </div>
    )
  }

  if (!hasTablesConfigured) {
    return <RestaurantSetup />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#002333]">Restaurante</h1>
          <p className="text-sm sm:text-base text-[#002333]/70">Gestiona las mesas y pedidos del restaurante</p>
        </div>
        <Button asChild className="bg-[#159A9C] hover:bg-[#159A9C]/90 text-white w-full sm:w-auto">
          <Link href="/dashboard/restaurant/new-order">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Link>
        </Button>
      </div>

      <RestaurantTables />
    </div>
  )
}
