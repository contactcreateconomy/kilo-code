"use client";

import type { ReactNode } from "react";
import { useAuthGuard } from "./use-auth-guard";

/**
 * Props for ProtectedRoute component
 */
export interface ProtectedRouteProps {
  /** Content to render when authenticated */
  children: ReactNode;
  /** URL to redirect to when not authenticated */
  loginUrl?: string;
  /** URL to redirect to when unauthorized (wrong role) */
  unauthorizedUrl?: string;
  /** Required role(s) to access the route */
  requiredRole?: "customer" | "seller" | "admin" | "moderator";
  /** Required roles (any of these) to access the route */
  requiredRoles?: Array<"customer" | "seller" | "admin" | "moderator">;
  /** Loading component to show while checking auth */
  loadingComponent?: ReactNode;
  /** Fallback component to show when not authenticated (instead of redirect) */
  fallback?: ReactNode;
  /** Callback when access is denied */
  onAccessDenied?: (reason: "unauthenticated" | "unauthorized") => void;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes by checking authentication and optionally role-based access.
 * Redirects to login page if not authenticated, or unauthorized page if wrong role.
 *
 * @example
 * ```tsx
 * // Basic protection - requires authentication
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // Role-based protection
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Multiple roles allowed
 * <ProtectedRoute requiredRoles={["admin", "moderator"]}>
 *   <ModerationPanel />
 * </ProtectedRoute>
 *
 * // With custom loading and fallback
 * <ProtectedRoute
 *   loadingComponent={<Spinner />}
 *   fallback={<LoginPrompt />}
 * >
 *   <ProtectedContent />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  loginUrl = "/auth/signin",
  unauthorizedUrl = "/auth/unauthorized",
  requiredRole,
  requiredRoles,
  loadingComponent,
  fallback,
  onAccessDenied,
}: ProtectedRouteProps) {
  const { decision, isLoading } = useAuthGuard({
    requiredRole,
    requiredRoles,
    loginUrl,
    unauthorizedUrl,
    onAccessDenied,
    hasFallback: !!fallback,
  });

  // Show loading state
  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : <DefaultLoadingComponent />;
  }

  // Access denied — show fallback or render nothing (redirect is handled by the hook)
  if (decision !== "allowed") {
    return fallback ? <>{fallback}</> : null;
  }

  // Authorized - render children
  return <>{children}</>;
}

/**
 * Default loading component
 */
function DefaultLoadingComponent() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #f3f3f3",
          borderTop: "3px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Props for AdminRoute component
 */
export interface AdminRouteProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
}

/**
 * AdminRoute Component
 *
 * Shorthand for ProtectedRoute with admin role requirement.
 *
 * @example
 * ```tsx
 * <AdminRoute>
 *   <AdminDashboard />
 * </AdminRoute>
 * ```
 */
export function AdminRoute({ children, loadingComponent, fallback }: AdminRouteProps) {
  return (
    <ProtectedRoute
      requiredRole="admin"
      loadingComponent={loadingComponent}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Props for SellerRoute component
 */
export interface SellerRouteProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
}

/**
 * SellerRoute Component
 *
 * Shorthand for ProtectedRoute with seller role requirement.
 *
 * @example
 * ```tsx
 * <SellerRoute>
 *   <SellerDashboard />
 * </SellerRoute>
 * ```
 */
export function SellerRoute({ children, loadingComponent, fallback }: SellerRouteProps) {
  return (
    <ProtectedRoute
      requiredRole="seller"
      loadingComponent={loadingComponent}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Props for ModeratorRoute component
 */
export interface ModeratorRouteProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  fallback?: ReactNode;
}

/**
 * ModeratorRoute Component
 *
 * Shorthand for ProtectedRoute with admin or moderator role requirement.
 *
 * @example
 * ```tsx
 * <ModeratorRoute>
 *   <ModerationPanel />
 * </ModeratorRoute>
 * ```
 */
export function ModeratorRoute({ children, loadingComponent, fallback }: ModeratorRouteProps) {
  return (
    <ProtectedRoute
      requiredRoles={["admin", "moderator"]}
      loadingComponent={loadingComponent}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Higher-order component for protecting pages
 *
 * @example
 * ```tsx
 * const ProtectedDashboard = withAuth(Dashboard);
 * const AdminDashboard = withAuth(Dashboard, { requiredRole: 'admin' });
 * ```
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, "children">
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
