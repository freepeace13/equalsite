// Barrel for @equalsite/ui. Add explicit sub-path exports in package.json
// (never a shorthand directory export) if this package grows more than one entry point.
export { Button, buttonVariants } from './components/atoms/button';
export type { ButtonProps } from './components/atoms/button';

export { StatusBadge, statusBadgeVariants } from './components/molecules/status-badge';
export type { StatusBadgeProps, StatusBadgeStatus } from './components/molecules/status-badge';

export { SeverityBadge, severityBadgeVariants } from './components/molecules/severity-badge';
export type {
  SeverityBadgeProps,
  SeverityBadgeSeverity,
} from './components/molecules/severity-badge';

export { ProgressBar } from './components/molecules/progress-bar';
export type { ProgressBarProps } from './components/molecules/progress-bar';

export { MetricCard, metricCardVariants } from './components/molecules/metric-card';
export type { MetricCardProps, MetricCardTone } from './components/molecules/metric-card';

export { StatPair } from './components/molecules/stat-pair';
export type { StatPairProps, StatPairItem } from './components/molecules/stat-pair';

export { Callout, calloutVariants } from './components/molecules/callout';
export type { CalloutProps, CalloutVariant } from './components/molecules/callout';

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleChevron,
} from './components/molecules/collapsible';
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
  CollapsibleChevronProps,
} from './components/molecules/collapsible';

export {
  LockIcon,
  ArrowRightIcon,
  SlidersIcon,
  SearchIcon,
  UsersIcon,
  ZapIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  XCircleIcon,
  MinusCircleIcon,
  SpinnerIcon,
  GlobeIcon,
  BellIcon,
  KeyboardIcon,
  EyeIcon,
  InfoCircleIcon,
  ImagePlaceholderIcon,
  ClockIcon,
  FileTextIcon,
  PackageIcon,
  CheckIcon,
} from './components/atoms/icons/icons';
export type { IconProps } from './components/atoms/icons/icons';

export { AlertError } from './components/molecules/alert-error';
export type { AlertErrorProps } from './components/molecules/alert-error';

export { CodeBlock } from './components/molecules/code-block';
export type { CodeBlockProps } from './components/molecules/code-block';

export { Container } from './components/molecules/container';
export type { ContainerProps } from './components/molecules/container';

export { Stack } from './components/molecules/stack';
export type { StackProps } from './components/molecules/stack';

export { Heading } from './components/molecules/heading';
export type { HeadingProps } from './components/molecules/heading';

export { InputError } from './components/molecules/input-error';
export type { InputErrorProps } from './components/molecules/input-error';

export { PasswordInput } from './components/molecules/password-input';
export type { PasswordInputProps } from './components/molecules/password-input';

export { Alert, AlertTitle, AlertDescription } from './components/atoms/alert';

export { Avatar, AvatarImage, AvatarFallback } from './components/atoms/avatar';

export { Badge, badgeVariants } from './components/atoms/badge';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './components/atoms/breadcrumb';

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from './components/atoms/button-group';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from './components/atoms/card';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
} from './components/atoms/chart';
export type { ChartConfig } from './components/atoms/chart';

export { Checkbox } from './components/atoms/checkbox';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './components/atoms/dialog';

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './components/atoms/dropdown-menu';

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from './components/atoms/field';

export { Icon } from './components/atoms/icon';
export type { IconWrapperProps } from './components/atoms/icon';

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from './components/atoms/input-group';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './components/atoms/input-otp';

export { Input } from './components/atoms/input';

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
} from './components/atoms/item';

export { Label } from './components/atoms/label';

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './components/atoms/navigation-menu';

export { PlaceholderPattern } from './components/atoms/placeholder-pattern';
export type { PlaceholderPatternProps } from './components/atoms/placeholder-pattern';

export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from './components/atoms/popover';

export { Progress } from './components/atoms/progress';

export { ScrollArea, ScrollBar } from './components/atoms/scroll-area';

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './components/atoms/select';

export { Separator } from './components/atoms/separator';

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './components/atoms/sheet';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './components/atoms/sidebar';

export { Skeleton } from './components/atoms/skeleton';

export { Toaster } from './components/atoms/sonner';

export { Spinner } from './components/atoms/spinner';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/atoms/table';

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants } from './components/atoms/tabs';

export { Textarea } from './components/atoms/textarea';

export { ToggleGroup, ToggleGroupItem } from './components/atoms/toggle-group';

export { Toggle, toggleVariants } from './components/atoms/toggle';

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './components/atoms/tooltip';

export { useIsMobile } from './hooks/use-mobile';

export { cn } from './lib/utils';
