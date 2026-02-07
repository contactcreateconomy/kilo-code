/**
 * @createconomy/ui - Shared UI Component Library & Design System
 *
 * This package provides reusable UI components built with Shadcn/ui patterns,
 * Tailwind CSS, and Radix UI primitives for the Createconomy platform.
 *
 * It also serves as the single source of truth for the design system,
 * including OKLCH color tokens, animation presets, and theme management.
 */

// Utilities
export { cn } from "./lib/utils";

// Components — Base (Shadcn/ui)
export { Button, buttonVariants, type ButtonProps } from "./components/button";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./components/card";
export { Input } from "./components/input";
export { Label } from "./components/label";
export { Skeleton } from "./components/skeleton";
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/dropdown-menu";
export { Badge, badgeVariants, type BadgeProps } from "./components/badge";
export { Separator } from "./components/separator";

// Components — Design System
export { GlowButton } from "./components/glow-button";
export { GlowCard } from "./components/glow-card";
export { DotGridBackground } from "./components/dot-grid-background";
export { ToastProvider, useToast } from "./components/toast";

// Providers
export { ThemeProvider, useTheme } from "./providers/theme-provider";

// Hooks
export { useMobile } from "./hooks/use-mobile";
export {
  useAuthForm,
  type UseAuthFormOptions,
  type UseAuthFormReturn,
} from "./hooks/use-auth-form";
export {
  validateSignUpForm,
  validateSignInForm,
  type ValidationRules,
  type ValidationResult,
} from "./hooks/use-auth-validation";

// Auth form components available via "@createconomy/ui/components/auth"
// See packages/ui/src/components/auth/index.ts for full list
