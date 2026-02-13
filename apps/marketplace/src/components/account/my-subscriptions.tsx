"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { centsToDollars, formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  Button,
  Skeleton,
} from "@createconomy/ui";
import { useToast } from "@createconomy/ui";
import { Badge } from "@createconomy/ui/components/badge";
import {
  Pause,
  Play,
  XCircle,
  LogIn,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";

interface SubscriptionData {
  _id: string;
  status: string;
  pricePerPeriod: number;
  billingPeriod: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: number;
  product: {
    _id: string;
    name: string;
    slug: string;
    primaryImage?: string;
  } | null;
  seller: {
    _id: string;
    name?: string;
  } | null;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-700 border-green-500/20",
  paused: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-700 border-red-500/20",
  past_due: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  trialing: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  incomplete: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

function SubscriptionCard({ sub }: { sub: SubscriptionData }) {
  const [isLoading, setIsLoading] = useState(false);
  const cancelSubscription = useMutation(api.functions.subscriptions.cancelSubscription);
  const pauseSubscription = useMutation(api.functions.subscriptions.pauseSubscription);
  const resumeSubscription = useMutation(api.functions.subscriptions.resumeSubscription);
  const toast = useToast();

  async function handleCancel() {
    setIsLoading(true);
    try {
      await cancelSubscription({
        subscriptionId: sub._id as Id<"subscriptions">,
      });
      toast.addToast("Subscription will be cancelled at end of billing period", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel";
      toast.addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePause() {
    setIsLoading(true);
    try {
      await pauseSubscription({
        subscriptionId: sub._id as Id<"subscriptions">,
      });
      toast.addToast("Subscription paused", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to pause";
      toast.addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResume() {
    setIsLoading(true);
    try {
      await resumeSubscription({
        subscriptionId: sub._id as Id<"subscriptions">,
      });
      toast.addToast("Subscription resumed", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resume";
      toast.addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  const periodLabel = sub.billingPeriod === "monthly" ? "/mo" : sub.billingPeriod === "quarterly" ? "/quarter" : "/yr";

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Product image */}
          {sub.product && (
            <Link
              href={`/products/${sub.product.slug}`}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted"
            >
              {sub.product.primaryImage ? (
                <Image
                  src={sub.product.primaryImage}
                  alt={sub.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No image
                </div>
              )}
            </Link>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {sub.product && (
                <Link
                  href={`/products/${sub.product.slug}`}
                  className="font-medium hover:underline"
                >
                  {sub.product.name}
                </Link>
              )}
              <Badge
                variant="outline"
                className={statusColors[sub.status] ?? ""}
              >
                {sub.cancelAtPeriodEnd ? "Cancelling" : sub.status.replace("_", " ")}
              </Badge>
            </div>

            <p className="mt-1 text-sm font-semibold">
              ${centsToDollars(sub.pricePerPeriod)}
              {periodLabel}
            </p>

            {sub.currentPeriodEnd && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {sub.cancelAtPeriodEnd
                  ? `Cancels on ${formatDate(new Date(sub.currentPeriodEnd))}`
                  : `Renews on ${formatDate(new Date(sub.currentPeriodEnd))}`}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1">
            {sub.status === "active" && !sub.cancelAtPeriodEnd && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePause}
                  disabled={isLoading}
                  className="hidden gap-1.5 sm:inline-flex"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Pause className="h-3.5 w-3.5" />
                  )}
                  Pause
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Cancel
                </Button>
              </>
            )}
            {sub.status === "paused" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResume}
                disabled={isLoading}
                className="gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5" />
                )}
                Resume
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage your recurring memberships</p>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function MySubscriptions() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const subscriptions = useQuery(
    api.functions.subscriptions.getMySubscriptions,
    isAuthenticated ? {} : "skip"
  ) as { items: SubscriptionData[] } | undefined;

  if (authLoading) {
    return <SubscriptionsSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">Manage your recurring memberships</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please sign in to view your subscriptions.
            </p>
            <Button asChild className="mt-6">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscriptions === undefined) {
    return <SubscriptionsSkeleton />;
  }

  const items = subscriptions.items;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage your recurring memberships</p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCcw className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">
              No active subscriptions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe to membership products to see them here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "subscription" : "subscriptions"}
          </p>
          {items.map((sub) => (
            <SubscriptionCard key={sub._id} sub={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
