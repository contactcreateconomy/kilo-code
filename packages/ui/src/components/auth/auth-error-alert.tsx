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
    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
      {error}
    </div>
  );
}
