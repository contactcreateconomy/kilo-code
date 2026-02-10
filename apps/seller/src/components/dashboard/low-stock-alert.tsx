"use client";

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
import { AlertTriangle, Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { useAuth } from "@/hooks/use-auth";
import type { Id } from "@createconomy/convex/dataModel";

const LOW_STOCK_THRESHOLD = 10;

export function LowStockAlert() {
  const { user } = useAuth();
  const products = useQuery(
    api.functions.products.getProductsBySeller,
    user?._id ? { sellerId: user._id as Id<"users"> } : "skip"
  );

  if (!products) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
          </div>
          <CardDescription>Products that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter for products with trackInventory enabled and low inventory
  const lowStockProducts = products.filter(
    (p) =>
      p.trackInventory &&
      p.inventory !== undefined &&
      p.inventory !== null &&
      p.inventory < LOW_STOCK_THRESHOLD &&
      p.status === "active"
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg">Low Stock Alerts</CardTitle>
        </div>
        <CardDescription>Products that need attention</CardDescription>
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
                const stock = product.inventory ?? 0;
                const stockPercent = Math.round(
                  (stock / LOW_STOCK_THRESHOLD) * 100
                );
                const isCritical = stock <= LOW_STOCK_THRESHOLD * 0.3;

                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Link
                        href={`/products/${product._id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stock}</span>
                        {isCritical ? (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0"
                          >
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
                      <Progress value={stockPercent} className="h-2" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">View all products →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
