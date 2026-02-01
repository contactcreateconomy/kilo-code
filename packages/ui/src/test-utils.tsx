import React, { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * Custom render function that wraps components with necessary providers.
 * Extend this to add more providers as needed (e.g., ThemeProvider, ConvexProvider).
 */

interface WrapperProps {
  children: ReactNode;
}

// Add providers here as the application grows
function AllProviders({ children }: WrapperProps) {
  return <>{children}</>;
}

/**
 * Custom render function with all providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render with custom render
export { customRender as render };

// Export userEvent for convenience
export { userEvent };

/**
 * Helper to create a mock function with type safety
 */
export function createMockFn<T extends (...args: unknown[]) => unknown>() {
  return vi.fn() as unknown as T;
}

/**
 * Helper to wait for async operations
 */
export async function waitForAsync(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create a mock event
 */
export function createMockEvent<T extends Event>(
  type: string,
  props: Partial<T> = {}
): T {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, props);
  return event as T;
}

/**
 * Helper to mock window.location
 */
export function mockWindowLocation(url: string) {
  const location = new URL(url);
  Object.defineProperty(window, "location", {
    value: {
      href: location.href,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      origin: location.origin,
      host: location.host,
      hostname: location.hostname,
      port: location.port,
      protocol: location.protocol,
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  });
}

/**
 * Helper to mock fetch
 */
export function mockFetch(response: unknown, options: { ok?: boolean; status?: number } = {}) {
  const { ok = true, status = 200 } = options;
  
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers(),
  });
  
  return global.fetch;
}

/**
 * Helper to restore fetch
 */
export function restoreFetch() {
  vi.restoreAllMocks();
}

// Import vi for the helpers
import { vi } from "vitest";
