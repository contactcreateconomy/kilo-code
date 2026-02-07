'use client';

import { useMutation, useQuery } from 'convex/react';
import { api } from '@createconomy/convex';

export function useAdmin() {
  // Dashboard stats
  const dashboardStats = useQuery(api.functions.admin.getDashboardStats, {});

  // User management
  const changeUserRole = useMutation(api.functions.admin.changeUserRole);
  const updateUserStatus = useMutation(api.functions.admin.updateUserStatus);

  // Seller management
  const approveSeller = useMutation(api.functions.admin.approveSeller);

  // Order management
  const forceUpdateOrderStatus = useMutation(api.functions.admin.forceUpdateOrderStatus);

  // Moderation
  const moderateReview = useMutation(api.functions.admin.moderateReview);
  const moderatePost = useMutation(api.functions.admin.moderatePost);

  // Category management
  const createCategory = useMutation(api.functions.categories.createCategory);
  const updateCategory = useMutation(api.functions.categories.updateCategory);
  const deleteCategory = useMutation(api.functions.categories.deleteCategory);
  const reorderCategories = useMutation(api.functions.categories.reorderCategories);

  return {
    // Stats
    dashboardStats,

    // User actions
    changeUserRole,
    updateUserStatus,

    // Seller actions
    approveSeller,

    // Order actions
    forceUpdateOrderStatus,

    // Moderation actions
    moderateReview,
    moderatePost,

    // Category actions
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
  };
}
