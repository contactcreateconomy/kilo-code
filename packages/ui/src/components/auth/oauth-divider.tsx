"use client";

export interface OAuthDividerProps {
  /** Text shown in the divider. Defaults to "Or continue with" */
  text?: string;
}

/**
 * OAuth section divider — horizontal line with centered text.
 * Matches the forum app's "Or continue with" divider design.
 */
export function OAuthDivider({ text = "Or continue with" }: OAuthDividerProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
