import { PurchasesTable } from "@/components/purchases-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Manage purchase orders and supplier transactions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase
          </Link>
        </Button>
      </div>

      <PurchasesTable />
    </div>
  )
}
