"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  Button,
  Skeleton,
} from "@createconomy/ui";
import { Download, FileDown, Package, LogIn } from "lucide-react";

interface OrderItem {
  product?: {
    id: string;
    name: string;
    slug?: string;
    primaryImage?: string;
  };
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: number;
  status: string;
  items?: OrderItem[];
}

function MyDownloadsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
        <p className="text-muted-foreground">
          Access your purchased digital products
        </p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-9 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MyDownloads() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const orders = useQuery(
    api.functions.orders.getUserOrders,
    isAuthenticated ? { status: "delivered" } : "skip"
  ) as Order[] | undefined;

  // Auth loading state
  if (authLoading) {
    return <MyDownloadsSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
          <p className="text-muted-foreground">
            Access your purchased digital products
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view your downloads.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data loading state
  if (orders === undefined) {
    return <MyDownloadsSkeleton />;
  }

  // Flatten all items from delivered orders
  const downloadItems: {
    orderId: string;
    orderNumber: string;
    purchaseDate: number;
    product: NonNullable<OrderItem["product"]>;
  }[] = [];

  for (const order of orders) {
    if (order.items) {
      for (const item of order.items) {
        if (item.product) {
          downloadItems.push({
            orderId: order._id,
            orderNumber: order.orderNumber,
            purchaseDate: order.createdAt,
            product: item.product,
          });
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Downloads</h1>
        <p className="text-muted-foreground">
          Access your purchased digital products
        </p>
      </div>

      {downloadItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No downloads yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Purchase digital products to see them here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {downloadItems.length}{" "}
            {downloadItems.length === 1 ? "item" : "items"} available
          </p>
          {downloadItems.map((item, index) => (
            <Card key={`${item.orderId}-${item.product.id}-${index}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  {/* Product thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.product.primaryImage ? (
                      <Image
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FileDown className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={
                        item.product.slug
                          ? `/products/${item.product.slug}`
                          : `/products`
                      }
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Purchased {formatDate(new Date(item.purchaseDate))} ·
                      Order #{item.orderNumber}
                    </p>
                  </div>

                  {/* Download button (placeholder — links to product page) */}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                  >
                    <Link
                      href={
                        item.product.slug
                          ? `/products/${item.product.slug}`
                          : `/products`
                      }
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Download</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
