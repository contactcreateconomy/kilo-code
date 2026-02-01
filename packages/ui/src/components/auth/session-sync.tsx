"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAuth } from "./auth-provider";
import { getSessionToken, clearSessionToken } from "../lib/auth-cookies";

/**
 * Session sync message types
 */
type SessionSyncMessageType =
  | "SESSION_UPDATED"
  | "SESSION_EXPIRED"
  | "SESSION_LOGOUT"
  | "SESSION_REFRESH"
  | "SESSION_CHECK";

/**
 * Session sync message structure
 */
interface SessionSyncMessage {
  type: SessionSyncMessageType;
  timestamp: number;
  sessionId?: string;
  token?: string;
  origin?: string;
}

/**
 * Channel name for session synchronization
 */
const SESSION_SYNC_CHANNEL = "createconomy_session_sync";

/**
 * Props for SessionSync component
 */
export interface SessionSyncProps {
  /** Callback when session is synced from another tab */
  onSessionSync?: (message: SessionSyncMessage) => void;
  /** Callback when logout is synced from another tab */
  onLogoutSync?: () => void;
  /** Whether to enable session sync (default: true) */
  enabled?: boolean;
}

/**
 * SessionSync Component
 *
 * Synchronizes session state across browser tabs/windows using the BroadcastChannel API.
 * This ensures that:
 * - Logout in one tab logs out all tabs
 * - Session refresh in one tab updates all tabs
 * - Session expiration is handled consistently
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL!}>
 *       <SessionSync
 *         onLogoutSync={() => {
 *           // Handle logout sync (e.g., redirect to login)
 *           window.location.href = '/auth/signin';
 *         }}
 *       />
 *       <YourApp />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function SessionSync({
  onSessionSync,
  onLogoutSync,
  enabled = true,
}: SessionSyncProps) {
  const auth = useAuth();
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastMessageRef = useRef<number>(0);

  /**
   * Send a message to other tabs
   */
  const sendMessage = useCallback((message: Omit<SessionSyncMessage, "timestamp" | "origin">) => {
    if (!channelRef.current) return;

    const fullMessage: SessionSyncMessage = {
      ...message,
      timestamp: Date.now(),
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    };

    try {
      channelRef.current.postMessage(fullMessage);
    } catch (error) {
      console.error("Failed to send session sync message:", error);
    }
  }, []);

  /**
   * Handle incoming messages from other tabs
   */
  const handleMessage = useCallback(
    (event: MessageEvent<SessionSyncMessage>) => {
      const message = event.data;

      // Ignore messages from the same tab (within 100ms)
      if (Date.now() - lastMessageRef.current < 100) {
        return;
      }

      // Ignore old messages
      if (message.timestamp < Date.now() - 5000) {
        return;
      }

      lastMessageRef.current = Date.now();

      switch (message.type) {
        case "SESSION_LOGOUT":
          // Another tab logged out, clear local session
          auth.clearSession();
          onLogoutSync?.();
          break;

        case "SESSION_EXPIRED":
          // Session expired in another tab
          auth.clearSession();
          onLogoutSync?.();
          break;

        case "SESSION_REFRESH":
          // Session was refreshed in another tab
          // Re-validate our session to get the new token
          if (message.token) {
            auth.refreshSession();
          }
          break;

        case "SESSION_UPDATED":
          // Session was updated in another tab
          onSessionSync?.(message);
          break;

        case "SESSION_CHECK":
          // Another tab is checking session status
          // Respond with our current session state
          if (auth.session) {
            sendMessage({
              type: "SESSION_UPDATED",
              sessionId: auth.session.sessionId,
              token: auth.session.token,
            });
          }
          break;
      }
    },
    [auth, onLogoutSync, onSessionSync, sendMessage]
  );

  // Initialize BroadcastChannel
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    try {
      channelRef.current = new BroadcastChannel(SESSION_SYNC_CHANNEL);
      channelRef.current.addEventListener("message", handleMessage);

      // Check session status on mount
      sendMessage({ type: "SESSION_CHECK" });
    } catch (error) {
      console.error("Failed to create BroadcastChannel:", error);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.removeEventListener("message", handleMessage);
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [enabled, handleMessage, sendMessage]);

  // Broadcast logout when signing out
  useEffect(() => {
    if (!auth.isAuthenticated && !auth.isLoading) {
      // Check if we had a session before (logout occurred)
      const token = getSessionToken();
      if (!token) {
        sendMessage({ type: "SESSION_LOGOUT" });
      }
    }
  }, [auth.isAuthenticated, auth.isLoading, sendMessage]);

  // Broadcast session refresh
  useEffect(() => {
    if (auth.session?.token) {
      sendMessage({
        type: "SESSION_REFRESH",
        sessionId: auth.session.sessionId,
        token: auth.session.token,
      });
    }
  }, [auth.session?.token, auth.session?.sessionId, sendMessage]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for session synchronization
 *
 * Provides functions to manually trigger session sync events.
 *
 * @example
 * ```tsx
 * function LogoutButton() {
 *   const { broadcastLogout } = useSessionSync();
 *   const { signOut } = useAuth();
 *
 *   const handleLogout = async () => {
 *     await signOut();
 *     broadcastLogout();
 *   };
 *
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 */
export function useSessionSync() {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    try {
      channelRef.current = new BroadcastChannel(SESSION_SYNC_CHANNEL);
    } catch (error) {
      console.error("Failed to create BroadcastChannel:", error);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, []);

  const broadcastLogout = useCallback(() => {
    if (!channelRef.current) return;

    const message: SessionSyncMessage = {
      type: "SESSION_LOGOUT",
      timestamp: Date.now(),
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    };

    try {
      channelRef.current.postMessage(message);
    } catch (error) {
      console.error("Failed to broadcast logout:", error);
    }
  }, []);

  const broadcastRefresh = useCallback((token: string, sessionId: string) => {
    if (!channelRef.current) return;

    const message: SessionSyncMessage = {
      type: "SESSION_REFRESH",
      timestamp: Date.now(),
      token,
      sessionId,
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    };

    try {
      channelRef.current.postMessage(message);
    } catch (error) {
      console.error("Failed to broadcast refresh:", error);
    }
  }, []);

  const broadcastExpired = useCallback(() => {
    if (!channelRef.current) return;

    const message: SessionSyncMessage = {
      type: "SESSION_EXPIRED",
      timestamp: Date.now(),
      origin: typeof window !== "undefined" ? window.location.origin : undefined,
    };

    try {
      channelRef.current.postMessage(message);
    } catch (error) {
      console.error("Failed to broadcast expired:", error);
    }
  }, []);

  return {
    broadcastLogout,
    broadcastRefresh,
    broadcastExpired,
  };
}

/**
 * Storage event listener for cross-tab sync fallback
 *
 * For browsers that don't support BroadcastChannel, we can use
 * localStorage events as a fallback.
 */
export function useStorageSync(onLogout: () => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      // Check if the session token was removed
      if (event.key === "__createconomy_session" && event.newValue === null) {
        onLogout();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [onLogout]);
}
