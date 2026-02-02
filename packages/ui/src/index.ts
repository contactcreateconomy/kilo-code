/**
 * @createconomy/ui - Shared UI Component Library
 *
 * This package provides reusable UI components built with Shadcn/ui patterns,
 * Tailwind CSS, and Radix UI primitives for the Createconomy platform.
 */

// Utilities
export { cn } from "./lib/utils";

// Base Components
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

// Shadcn UI Components
export { Avatar, AvatarImage, AvatarFallback } from "./components/avatar";
export { Badge, badgeVariants, type BadgeProps } from "./components/badge";
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
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./components/popover";
export { ScrollArea, ScrollBar } from "./components/scroll-area";
export { Separator } from "./components/separator";

// Layout Components
export {
  DotGridBackground,
  type DotGridBackgroundProps,
  GlassmorphismNavbar,
  type GlassmorphismNavbarProps,
} from "./components/layout";

// Navbar Components
export {
  Logo,
  type LogoProps,
  AnimatedSearch,
  type AnimatedSearchProps,
  ThemeToggle,
  type ThemeToggleProps,
  NotificationsDropdown,
  type NotificationsDropdownProps,
  type Notification,
  ProfileDropdown,
  type ProfileDropdownProps,
  type UserProfile,
  type MenuItem,
  LoginButton,
  type LoginButtonProps,
} from "./components/navbar";

// Hooks
export { useMobile } from "./hooks/use-mobile";
