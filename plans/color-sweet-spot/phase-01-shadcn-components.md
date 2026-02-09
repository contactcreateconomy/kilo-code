# Phase 1: Install Missing shadcn Components

> Add the missing shadcn/ui components to `@createconomy/ui` and export them.

## Prerequisites

- None (this phase can start immediately)

## Components to Install

Run from `packages/ui/`:

```bash
cd packages/ui && pnpm dlx shadcn@latest add dialog switch checkbox table tabs select tooltip sheet progress alert scroll-area textarea popover spinner pagination
```

### Component List with Justification

| Component | Why Needed | Replaces |
|-----------|-----------|----------|
| `dialog` | Modal dialogs for reports, confirmations | Custom modal in `report-dialog.tsx` |
| `switch` | Toggle switches | Raw `<input type=checkbox>` + manual CSS in admin settings |
| `checkbox` | Proper accessible checkboxes | Raw `<input type=checkbox>` in data tables, notification prefs |
| `table` | Data tables with consistent styling | Custom `.data-table` CSS class |
| `tabs` | Tab navigation | Custom `feed-tabs.tsx` with manual active states |
| `select` | Dropdown selects | Raw `<select>` in admin pages |
| `tooltip` | Hover hints for icon buttons | Currently missing |
| `sheet` | Slide-in panels for mobile nav | Custom mobile sidebar logic |
| `progress` | Progress bars | Custom poll progress bars |
| `alert` | System alerts and form errors | Inline `text-red-600` messages |
| `scroll-area` | Custom scrollbars | Browser default |
| `textarea` | Multi-line text input | Standard `<textarea>` |
| `popover` | Floating panels | Custom dropdown logic in community selector |
| `spinner` | Loading indicator | `Loader2 + animate-spin` repeated 20+ times |
| `pagination` | Page navigation | Custom `pagination.tsx` |

## Steps

### Step 1: Install components

```bash
cd packages/ui && pnpm dlx shadcn@latest add dialog switch checkbox table tabs select tooltip sheet progress alert scroll-area textarea popover spinner pagination
```

### Step 2: Export from `packages/ui/src/index.ts`

Add exports for each new component:

```typescript
// Add to packages/ui/src/index.ts

// New shadcn components
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "./components/dialog";
export { Switch } from "./components/switch";
export { Checkbox } from "./components/checkbox";
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "./components/table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/tabs";
export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "./components/select";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/tooltip";
export { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./components/sheet";
export { Progress } from "./components/progress";
export { Alert, AlertDescription, AlertTitle } from "./components/alert";
export { ScrollArea, ScrollBar } from "./components/scroll-area";
export { Textarea } from "./components/textarea";
export { Popover, PopoverContent, PopoverTrigger } from "./components/popover";
export { Spinner } from "./components/spinner";
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./components/pagination";
```

### Step 3: Verify build

```bash
cd packages/ui && pnpm build
```

## Acceptance Criteria

- [ ] All 15 components installed in `packages/ui/src/components/`
- [ ] All components exported from `packages/ui/src/index.ts`
- [ ] `pnpm build` passes without errors
- [ ] `pnpm typecheck` passes
