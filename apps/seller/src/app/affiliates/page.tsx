"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@createconomy/convex";
import type { Id } from "@createconomy/convex/dataModel";

interface AffiliateData {
  _id: string;
  affiliateCode: string;
  commissionPercent: number;
  status: string;
  totalClicks: number;
  totalSales: number;
  totalEarned: number;
  user: {
    _id: string;
    name?: string;
    email?: string;
    displayName?: string;
    avatarUrl?: string;
  } | null;
  productName?: string | null;
}

export default function AffiliatesPage() {
  const affiliatesResult = useQuery(api.functions.affiliates.getSellerAffiliates, {});
  const updateAffiliateStatus = useMutation(api.functions.affiliates.updateAffiliateStatus);

  const affiliates = (affiliatesResult?.items ?? []) as AffiliateData[];
  const pendingAffiliates = affiliates.filter((a) => a.status === "pending");
  const activeAffiliates = affiliates.filter((a) => a.status === "approved");
  const totalEarned = affiliates.reduce((sum, a) => sum + a.totalEarned, 0);

  async function handleApprove(affiliateId: string) {
    try {
      await updateAffiliateStatus({
        affiliateId: affiliateId as Id<"affiliates">,
        status: "approved",
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to approve");
    }
  }

  async function handleReject(affiliateId: string) {
    try {
      await updateAffiliateStatus({
        affiliateId: affiliateId as Id<"affiliates">,
        status: "rejected",
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to reject");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Affiliates</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your affiliate program and track referral sales
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Active Affiliates</p>
          <p className="text-3xl font-bold mt-1">{activeAffiliates.length}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Pending Applications</p>
          <p className="text-3xl font-bold mt-1">{pendingAffiliates.length}</p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Referral Sales</p>
          <p className="text-3xl font-bold mt-1">
            {affiliates.reduce((sum, a) => sum + a.totalSales, 0)}
          </p>
        </div>
        <div className="seller-card">
          <p className="text-sm text-[var(--muted-foreground)]">Total Commissions Paid</p>
          <p className="text-3xl font-bold mt-1">
            ${(totalEarned / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingAffiliates.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Pending Applications</h2>
          {pendingAffiliates.map((affiliate) => (
            <div key={affiliate._id} className="seller-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {affiliate.user?.displayName ?? affiliate.user?.name ?? "Unknown user"}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {affiliate.user?.email}
                    {affiliate.productName && ` · For: ${affiliate.productName}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(affiliate._id)}
                    className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(affiliate._id)}
                    className="px-4 py-1.5 text-sm border border-[var(--border)] rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Affiliates */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All Affiliates</h2>
        {affiliates.length === 0 ? (
          <div className="seller-card text-center py-12">
            <p className="text-[var(--muted-foreground)]">
              No affiliates yet. Affiliates can apply through your product pages.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="py-3 px-4 text-left font-medium text-[var(--muted-foreground)]">
                    Affiliate
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-[var(--muted-foreground)]">
                    Code
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-[var(--muted-foreground)]">
                    Commission
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-[var(--muted-foreground)]">
                    Status
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-[var(--muted-foreground)]">
                    Clicks
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-[var(--muted-foreground)]">
                    Sales
                  </th>
                  <th className="py-3 px-4 text-right font-medium text-[var(--muted-foreground)]">
                    Earned
                  </th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr
                    key={affiliate._id}
                    className="border-b border-[var(--border)] last:border-0"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium">
                        {affiliate.user?.displayName ?? affiliate.user?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {affiliate.user?.email}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <code className="font-mono text-xs bg-[var(--muted)] px-2 py-1 rounded">
                        {affiliate.affiliateCode}
                      </code>
                    </td>
                    <td className="py-3 px-4">{affiliate.commissionPercent}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          affiliate.status === "approved"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : affiliate.status === "pending"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {affiliate.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{affiliate.totalClicks}</td>
                    <td className="py-3 px-4 text-right">{affiliate.totalSales}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${(affiliate.totalEarned / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
