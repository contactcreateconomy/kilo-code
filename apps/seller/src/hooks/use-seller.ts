"use client";

import { useQuery, useMutation } from "convex/react";
import { useState, useCallback } from "react";

// Types for seller operations
interface Seller {
  _id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  status: "pending" | "approved" | "suspended";
  createdAt: number;
}

interface Product {
  _id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: "draft" | "active" | "archived";
}

interface Order {
  _id: string;
  sellerId: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  createdAt: number;
}

interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
}

export function useSeller() {
  // TODO: Replace with actual Convex queries
  // const seller = useQuery(api.sellers.current);
  // const products = useQuery(api.products.bySeller);
  // const orders = useQuery(api.orders.bySeller);
  // const stats = useQuery(api.sellers.stats);

  const [isLoading, setIsLoading] = useState(false);

  // Placeholder data - replace with actual Convex queries
  // Using type assertion to avoid TypeScript narrowing to 'never'
  const seller = null as Seller | null;
  const products: Product[] = [];
  const orders: Order[] = [];
  const stats: SellerStats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingOrders: 0,
  };

  return {
    seller,
    products,
    orders,
    stats,
    isLoading,
    isPending: seller?.status === "pending",
    isApproved: seller?.status === "approved",
    isSuspended: seller?.status === "suspended",
  };
}

export function useSellerProducts() {
  // TODO: Replace with actual Convex mutations
  // const createProduct = useMutation(api.products.create);
  // const updateProduct = useMutation(api.products.update);
  // const deleteProduct = useMutation(api.products.remove);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: Partial<Product>) => {
    setIsLoading(true);
    setError(null);
    try {
      // await createProduct(data);
      console.log("Creating product:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Product>) => {
    setIsLoading(true);
    setError(null);
    try {
      // await updateProduct({ id, ...data });
      console.log("Updating product:", id, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // await deleteProduct({ id });
      console.log("Deleting product:", id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    update,
    remove,
    isLoading,
    error,
  };
}

export function useSellerOrders() {
  // TODO: Replace with actual Convex mutations
  // const updateOrderStatus = useMutation(api.orders.updateStatus);
  // const addShippingInfo = useMutation(api.orders.addShipping);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (orderId: string, status: Order["status"]) => {
      setIsLoading(true);
      setError(null);
      try {
        // await updateOrderStatus({ orderId, status });
        console.log("Updating order status:", orderId, status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update order");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const addShipping = useCallback(
    async (
      orderId: string,
      shipping: {
        carrier: string;
        trackingNumber: string;
        shippingDate: string;
      }
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        // await addShippingInfo({ orderId, ...shipping });
        console.log("Adding shipping info:", orderId, shipping);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add shipping info"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    updateStatus,
    addShipping,
    isLoading,
    error,
  };
}

export function useSellerAnalytics(period: "week" | "month" | "year" = "month") {
  // TODO: Replace with actual Convex query
  // const analytics = useQuery(api.analytics.seller, { period });

  // Placeholder data
  const analytics = {
    revenue: [] as { date: string; amount: number }[],
    orders: [] as { date: string; count: number }[],
    topProducts: [] as { id: string; name: string; sales: number }[],
    conversionRate: 0,
    averageOrderValue: 0,
  };

  return {
    analytics,
    isLoading: false,
  };
}
