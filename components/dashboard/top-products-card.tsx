"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Product {
    name: string
    sales: number
}

interface TopProductsCardProps {
    products?: Product[]
}

const defaultProducts = [
    { name: "Producto A", sales: 120 },
    { name: "Producto B", sales: 98 },
    { name: "Producto C", sales: 85 },
    { name: "Producto D", sales: 72 },
    { name: "Producto E", sales: 65 },
]

export function TopProductsCard({ products = defaultProducts }: TopProductsCardProps) {
    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle>Top Productos</CardTitle>
                <CardDescription>Artículos más vendidos este mes</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <div key={product.name} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {index + 1}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.sales.toLocaleString()} vendidos</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
