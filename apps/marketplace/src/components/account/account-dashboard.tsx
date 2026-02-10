"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@createconomy/convex";
import { useAuth } from "@/hooks/use-auth";
import { formatPriceCents, formatDate, getInitials } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  Skeleton,
} from "@createconomy/ui";
import {
  ClipboardList,
  CreditCard,
  Star,
  Heart,
  ArrowRight,
  LogIn,
} from "lucide-react";

export function AccountDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch full user profile
  const fullUser = useQuery(
    api.functions.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Fetch recent orders for stats
  const recentOrders = useQuery(
    api.functions.orders.getUserOrders,
    isAuthenticated ? { limit: 5 } : "skip"
  );

  // Auth loading state
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <LogIn className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Sign in required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please sign in to view your account dashboard.
          </p>
          <Button asChild className="mt-6">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Data loading state
  if (fullUser === undefined || recentOrders === undefined) {
    return <DashboardSkeleton />;
  }

  // Calculate stats from orders
  const totalOrders = recentOrders?.length ?? 0;
  const totalSpentCents = recentOrders?.reduce(
    (sum, order) => sum + (order.total ?? 0),
    0
  ) ?? 0;

  const displayName =
    fullUser?.profile?.displayName ?? fullUser?.name ?? user.name ?? "User";
  const email = fullUser?.email ?? user.email ?? "";
  const avatarUrl = fullUser?.profile?.avatarUrl ?? fullUser?.image ?? user.image;
  const memberSince = fullUser?.profile?.createdAt
    ? formatDate(new Date(fullUser.profile.createdAt))
    : "Recently joined";

  return (
    <div className="space-y-8">
      {/* Profile Overview */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <Avatar className="h-20 w-20 text-2xl">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            <p className="text-muted-foreground">{email}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Member since {memberSince}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPriceCents(totalSpentCents)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviews Written
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wishlist Items
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/account/orders">
              <ClipboardList className="mr-2 h-4 w-4" />
              View Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/settings">
              <Star className="mr-2 h-4 w-4" />
              Edit Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account/settings">
              <CreditCard className="mr-2 h-4 w-4" />
              Account Settings
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile skeleton */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 text-center sm:text-left">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links skeleton */}
      <div>
        <Skeleton className="mb-4 h-6 w-28" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  );
}
