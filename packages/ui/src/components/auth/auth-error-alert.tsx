"use client";

export interface AuthErrorAlertProps {
  /** Error message to display. Renders nothing if null/undefined/empty. */
  error: string | null | undefined;
}

/**
 * Standardized auth error alert — matches the forum app's error display.
 * Consistent styling across all four applications.
 */
export function AuthErrorAlert({ error }: AuthErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-600 dark:text-red-400 text-sm">
      {error}
    </div>
  );
}
