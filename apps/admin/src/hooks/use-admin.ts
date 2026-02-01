'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@createconomy/convex';

export function useAdmin() {
  // Dashboard stats
  const dashboardStats = useQuery(api.functions.admin.getDashboardStats);

  // User management
  const updateUserRole = useMutation(api.functions.admin.updateUserRole);
  const suspendUser = useMutation(api.functions.admin.suspendUser);
  const unsuspendUser = useMutation(api.functions.admin.unsuspendUser);

  // Product management
  const approveProduct = useMutation(api.functions.admin.approveProduct);
  const rejectProduct = useMutation(api.functions.admin.rejectProduct);
  const featureProduct = useMutation(api.functions.admin.featureProduct);

  // Seller management
  const approveSeller = useMutation(api.functions.admin.approveSeller);
  const rejectSeller = useMutation(api.functions.admin.rejectSeller);
  const suspendSeller = useMutation(api.functions.admin.suspendSeller);

  // Order management
  const updateOrderStatus = useMutation(api.functions.admin.updateOrderStatus);
  const processRefund = useMutation(api.functions.admin.processRefund);

  // Moderation
  const resolveReport = useMutation(api.functions.admin.resolveReport);
  const deleteContent = useMutation(api.functions.admin.deleteContent);
  const warnUser = useMutation(api.functions.admin.warnUser);

  // Category management
  const createCategory = useMutation(api.functions.categories.create);
  const updateCategory = useMutation(api.functions.categories.update);
  const deleteCategory = useMutation(api.functions.categories.remove);
  const reorderCategories = useMutation(api.functions.admin.reorderCategories);

  return {
    // Stats
    dashboardStats,

    // User actions
    updateUserRole,
    suspendUser,
    unsuspendUser,

    // Product actions
    approveProduct,
    rejectProduct,
    featureProduct,

    // Seller actions
    approveSeller,
    rejectSeller,
    suspendSeller,

    // Order actions
    updateOrderStatus,
    processRefund,

    // Moderation actions
    resolveReport,
    deleteContent,
    warnUser,

    // Category actions
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
