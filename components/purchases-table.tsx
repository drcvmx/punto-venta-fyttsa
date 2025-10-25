"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Eye, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data
const purchases = [
  {
    id: "PUR-001",
    date: "2025-01-10",
    supplier: "Tech Supplies Co.",
    items: 50,
    total: 2499.5,
    status: "Received",
    dueDate: "2025-01-25",
  },
  {
    id: "PUR-002",
    date: "2025-01-12",
    supplier: "Office Depot",
    items: 25,
    total: 899.75,
    status: "Pending",
    dueDate: "2025-01-27",
  },
  {
    id: "PUR-003",
    date: "2025-01-13",
    supplier: "Electronics Hub",
    items: 100,
    total: 5499.0,
    status: "Ordered",
    dueDate: "2025-02-01",
  },
  {
    id: "PUR-004",
    date: "2025-01-14",
    supplier: "Furniture World",
    items: 15,
    total: 1299.85,
    status: "Received",
    dueDate: "2025-01-29",
  },
  {
    id: "PUR-005",
    date: "2025-01-15",
    supplier: "Tech Supplies Co.",
    items: 30,
    total: 1799.7,
    status: "Ordered",
    dueDate: "2025-02-05",
  },
]

export function PurchasesTable() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Received":
        return "default"
      case "Ordered":
        return "secondary"
      case "Pending":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Orders</CardTitle>
        <CardDescription>Track all purchase orders and supplier transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purchase ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No purchases found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.items}</TableCell>
                    <TableCell>${purchase.total.toFixed(2)}</TableCell>
                    <TableCell>{new Date(purchase.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(purchase.status)}>{purchase.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {purchase.status !== "Received" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Received
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
