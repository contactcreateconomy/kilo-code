"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SellerLayout } from "@/components/layout/seller-layout";
import { SellerGuard } from "@/components/auth/seller-guard";
import { StripeConnectButton } from "@/components/stripe/connect-button";
import {
  getConnectAccountStatus,
  getPayoutHistory,
  getAccountBalance,
  formatPriceFromDollars,
  getPayoutStatusLabel,
  getPayoutStatusColor,
  getConnectStatusInfo,
  type ConnectAccountStatus,
  type PayoutInfo,
} from "@/lib/stripe";
import Link from "next/link";

export default function PayoutsPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null);
  const [payouts, setPayouts] = useState<PayoutInfo[]>([]);
  const [balance, setBalance] = useState<{ available: number; pending: number; currency: string } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check for success/refresh params
    if (searchParams.get("success") === "true") {
      setShowSuccessMessage(true);
      // Clear the URL params
      window.history.replaceState({}, "", "/payouts");
    }

    loadData();
  }, [searchParams]);

  async function loadData() {
    setIsLoading(true);

    try {
      // Load account status
      const status = await getConnectAccountStatus();
      setAccountStatus(status);

      // If account is connected, load balance and payouts
      if (status.hasAccount && status.isOnboarded) {
        const [balanceResult, payoutsResult] = await Promise.all([
          getAccountBalance(),
          getPayoutHistory(10),
        ]);

        if (balanceResult.success && balanceResult.balance) {
          setBalance(balanceResult.balance);
        }

        if (payoutsResult.success && payoutsResult.payouts) {
          setPayouts(payoutsResult.payouts);
        }
      }
    } catch (error) {
      console.error("Failed to load payout data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const statusInfo = accountStatus ? getConnectStatusInfo(accountStatus) : null;

  return (
    <SellerGuard>
      <SellerLayout>
        <div className="space-y-6">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="rounded-lg bg-success/10 border border-success/20 p-4">
              <div className="flex">
                <CheckIcon className="h-5 w-5 text-success" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-success">
                    Stripe account connected successfully!
                  </p>
                  <p className="mt-1 text-sm text-success/80">
                    You can now receive payouts for your sales.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="ml-auto text-success hover:text-success/80"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Payouts</h1>
              <p className="text-[var(--muted-foreground)]">
                Manage your earnings and payout settings
              </p>
            </div>
            {accountStatus?.isOnboarded && (
              <Link
                href="/payouts/settings"
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Payout Settings
              </Link>
            )}
          </div>

          {/* Stripe Connect Status */}
          {!accountStatus?.isOnboarded && (
            <div className="seller-card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <StripeIcon className="h-12 w-12 text-[#635BFF]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Connect with Stripe</h2>
                  <p className="mt-1 text-[var(--muted-foreground)]">
                    {statusInfo?.description || "Connect your Stripe account to receive payouts for your sales."}
                  </p>
                  {statusInfo && (
                    <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  )}
                  <div className="mt-4">
                    <StripeConnectButton
                      onSuccess={() => {
                        setShowSuccessMessage(true);
                        loadData();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Balance Cards */}
          {accountStatus?.isOnboarded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="seller-card">
                <p className="text-sm text-[var(--muted-foreground)]">Available Balance</p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatPriceFromDollars(balance?.available ?? 0, balance?.currency)
                  )}
                </p>
                <button className="mt-3 w-full px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity text-sm">
                  Request Payout
                </button>
              </div>
              <div className="seller-card">
                <p className="text-sm text-[var(--muted-foreground)]">Pending</p>
                <p className="text-3xl font-bold mt-1">
                  {isLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatPriceFromDollars(balance?.pending ?? 0, balance?.currency)
                  )}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-3">Processing in 3-5 days</p>
              </div>
              <div className="seller-card">
                <p className="text-sm text-[var(--muted-foreground)]">Account Status</p>
                <div className="mt-2">
                  {statusInfo && (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>
                <Link
                  href="/api/stripe/connect/dashboard"
                  className="mt-3 block text-sm text-[var(--primary)] hover:underline"
                >
                  View Stripe Dashboard →
                </Link>
              </div>
            </div>
          )}

          {/* Payout History */}
          {accountStatus?.isOnboarded && (
            <div className="seller-card">
              <h2 className="text-lg font-semibold mb-4">Payout History</h2>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-[var(--muted)] rounded animate-pulse" />
                  ))}
                </div>
              ) : payouts.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  <p>No payouts yet</p>
                  <p className="text-sm mt-1">Your payout history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">Method</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-[var(--muted-foreground)]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-4 px-4 font-medium font-mono text-sm">
                            {payout.id.slice(0, 12)}...
                          </td>
                          <td className="py-4 px-4">
                            {new Date(payout.arrivalDate * 1000).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 capitalize">{payout.method}</td>
                          <td className="py-4 px-4 text-right font-medium">
                            {formatPriceFromDollars(payout.amount / 100, payout.currency)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPayoutStatusColor(payout.status)}`}>
                              {getPayoutStatusLabel(payout.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </SellerLayout>
    </SellerGuard>
  );
}

// Icon Components
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}
