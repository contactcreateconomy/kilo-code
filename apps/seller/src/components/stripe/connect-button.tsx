"use client";

import { useState, useEffect } from "react";
import { Button } from "@createconomy/ui";
import {
  initiateStripeConnect,
  getConnectAccountStatus,
  getStripeDashboardLink,
  getConnectStatusInfo,
  type ConnectAccountStatus,
} from "@/lib/stripe";

/**
 * Stripe Connect Button Component
 *
 * A button that initiates Stripe Connect onboarding for sellers.
 * Shows different states based on account status.
 */

interface StripeConnectButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function StripeConnectButton({
  onSuccess,
  onError,
  className,
}: StripeConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accountStatus, setAccountStatus] = useState<ConnectAccountStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccountStatus();
  }, []);

  async function loadAccountStatus() {
    try {
      const status = await getConnectAccountStatus();
      setAccountStatus(status);
    } catch (err) {
      console.error("Failed to load account status:", err);
    }
  }

  async function handleConnect() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await initiateStripeConnect();

      if (!result.success || !result.onboardingUrl) {
        throw new Error(result.error || "Failed to create Connect account");
      }

      // Redirect to Stripe onboarding
      window.location.href = result.onboardingUrl;
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  }

  async function handleViewDashboard() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getStripeDashboardLink();

      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to get dashboard link");
      }

      // Open Stripe dashboard in new tab
      window.open(result.url, "_blank");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to open dashboard";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleContinueOnboarding() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await initiateStripeConnect();

      if (!result.success || !result.onboardingUrl) {
        throw new Error(result.error || "Failed to continue onboarding");
      }

      window.location.href = result.onboardingUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to continue";
      setError(errorMessage);
      onError?.(errorMessage);
      setIsLoading(false);
    }
  }

  const statusInfo = accountStatus ? getConnectStatusInfo(accountStatus) : null;

  // Not connected - show connect button
  if (!accountStatus?.hasAccount) {
    return (
      <div className={className}>
        <Button
          onClick={handleConnect}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <StripeIcon className="h-4 w-4" />
              Connect with Stripe
            </>
          )}
        </Button>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Incomplete onboarding - show continue button
  if (!accountStatus.isOnboarded) {
    return (
      <div className={className}>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleContinueOnboarding}
            disabled={isLoading}
            variant="outline"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <StripeIcon className="h-4 w-4" />
                Complete Setup
              </>
            )}
          </Button>
          {statusInfo && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // Fully connected - show dashboard button
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleViewDashboard}
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <ExternalLinkIcon className="h-4 w-4" />
              Stripe Dashboard
            </>
          )}
        </Button>
        {statusInfo && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

/**
 * Stripe Connect Status Badge
 *
 * A badge that shows the current Stripe Connect status.
 */
interface StripeConnectStatusBadgeProps {
  status: ConnectAccountStatus;
  className?: string;
}

export function StripeConnectStatusBadge({
  status,
  className,
}: StripeConnectStatusBadgeProps) {
  const statusInfo = getConnectStatusInfo(status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
      <span className="text-sm text-muted-foreground">{statusInfo.description}</span>
    </div>
  );
}

// Icon Components
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export default StripeConnectButton;
