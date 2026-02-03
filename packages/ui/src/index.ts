/**
 * @createconomy/ui - Shared UI Component Library
 *
 * This package provides reusable UI components built with Shadcn/ui patterns,
 * Tailwind CSS, and Radix UI primitives for the Createconomy platform.
 */

// Utilities
export { cn } from "./lib/utils";

// Components
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

// Hooks
export { useMobile } from "./hooks/use-mobile";
