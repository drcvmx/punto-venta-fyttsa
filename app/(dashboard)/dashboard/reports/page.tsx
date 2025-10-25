import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesReport } from "@/components/sales-report"
import { InventoryReport } from "@/components/inventory-report"
import { FinancialReport } from "@/components/financial-report"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Analyze your business performance with detailed reports</p>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="financial">Financial Report</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <SalesReport />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <InventoryReport />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <FinancialReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
