import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@createconomy/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@createconomy/ui/components/table";
import { Badge } from "@createconomy/ui/components/badge";
import { Progress } from "@createconomy/ui/components/progress";
import { Button } from "@createconomy/ui/components/button";
import { AlertTriangle } from "lucide-react";

// Mock data — in production this would come from Convex
const lowStockProducts = [
  { id: "prod-001", name: "Premium UI Kit", stock: 3, threshold: 10 },
  { id: "prod-002", name: "Icon Pack Pro", stock: 1, threshold: 5 },
  { id: "prod-003", name: "Landing Templates", stock: 7, threshold: 15 },
  { id: "prod-004", name: "Photo Presets", stock: 2, threshold: 10 },
];

export function LowStockAlert() {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
        </div>
        <CardDescription>Products that need restocking</CardDescription>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            All products are well stocked
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-[100px]">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((product) => {
                const stockPercent = Math.round(
                  (product.stock / product.threshold) * 100
                );
                const isCritical = product.stock <= product.threshold * 0.3;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{product.stock}</span>
                        {isCritical ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Critical
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] px-1.5 py-0"
                          >
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Progress
                        value={stockPercent}
                        className="h-2"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products?filter=low-stock">
              View all low stock →
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
