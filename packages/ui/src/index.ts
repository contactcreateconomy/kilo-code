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
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/dialog";
export { Switch } from "./components/switch";
export { Checkbox } from "./components/checkbox";
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/table";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./components/tabs";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "./components/select";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/tooltip";
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "./components/sheet";
export { Progress } from "./components/progress";
export { Alert, AlertTitle, AlertDescription } from "./components/alert";
export { ScrollArea, ScrollBar } from "./components/scroll-area";
export { Textarea } from "./components/textarea";
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./components/popover";
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./components/pagination";

// Components — Design System
export { GlowButton } from "./components/glow-button";
export { GlowCard } from "./components/glow-card";
export { DotGridBackground } from "./components/dot-grid-background";
export { ToastProvider, useToast } from "./components/toast";
export { Spinner } from "./components/spinner";
export { NotificationIcon, type NotificationType } from "./components/notification-icon";

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

// Types — Shared contracts
export type { QueryEnvelope, MutationEnvelope } from "./types/envelope";

// Auth form components available via "@createconomy/ui/components/auth"
// See packages/ui/src/components/auth/index.ts for full list
