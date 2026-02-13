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
import { Badge } from "@createconomy/ui/components/badge";
import {
  Download,
  FileDown,
  Key,
  Library,
  LogIn,
} from "lucide-react";

interface PurchasedProduct {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    isDigital: boolean;
    primaryImage?: string;
  };
  purchasedAt: number;
  fileCount: number;
  hasLicense: boolean;
  licenseKey?: string;
}

function LibraryItemCard({ item }: { item: PurchasedProduct }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Product thumbnail */}
          <Link
            href={`/products/${item.product.slug}`}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {item.product.primaryImage ? (
              <Image
                src={item.product.primaryImage}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <FileDown className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/products/${item.product.slug}`}
              className="font-medium hover:underline"
            >
              {item.product.name}
            </Link>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Purchased {formatDate(new Date(item.purchasedAt))}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {item.fileCount > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Download className="h-3 w-3" />
                  {item.fileCount} {item.fileCount === 1 ? "file" : "files"}
                </Badge>
              )}
              {item.hasLicense && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Key className="h-3 w-3" />
                  License key
                </Badge>
              )}
            </div>

            {/* License key display */}
            {item.licenseKey && (
              <div className="mt-2 rounded-md bg-muted px-3 py-1.5">
                <p className="text-xs text-muted-foreground">License Key</p>
                <code className="text-sm font-mono">{item.licenseKey}</code>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-col gap-2">
            {item.fileCount > 0 && (
              <Button
                asChild
                size="sm"
                className="gap-1.5"
              >
                <Link href={`/products/${item.product.slug}`}>
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LibrarySkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Your purchased digital products
        </p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-6 w-24" />
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

export function MyLibrary() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const purchased = useQuery(
    api.functions.files.getMyPurchasedProducts,
    isAuthenticated ? {} : "skip"
  ) as { items: PurchasedProduct[] } | undefined;

  if (authLoading) {
    return <LibrarySkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Your purchased digital products
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view your library.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (purchased === undefined) {
    return <LibrarySkeleton />;
  }

  const items = purchased.items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground">
          Your purchased digital products
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Library className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              Your library is empty
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Purchase digital products to access them here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "product" : "products"} in your library
          </p>
          {items.map((item) => (
            <LibraryItemCard key={item.product._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
