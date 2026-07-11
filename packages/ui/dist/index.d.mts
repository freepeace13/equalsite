import * as react_jsx_runtime from 'react/jsx-runtime';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as React$1 from 'react';
import React__default, { HTMLAttributes, ComponentProps, Ref } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as RechartsPrimitive from 'recharts';
import { TooltipValueType } from 'recharts';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as LabelPrimitive from '@radix-ui/react-label';
import { LucideIcon } from 'lucide-react';
import * as input_otp from 'input-otp';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { ToasterProps } from 'sonner';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { ClassValue } from 'clsx';

declare const buttonVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "ghost-destructive" | "link" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React$1.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare function Button({ className, variant, size, asChild, ...props }: ButtonProps): react_jsx_runtime.JSX.Element;

declare const statusBadgeVariants: (props?: ({
    status?: "queued" | "processing" | "complete" | "cancelled" | "failed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type StatusBadgeStatus = 'queued' | 'processing' | 'complete' | 'cancelled' | 'failed';
interface StatusBadgeProps extends Omit<React$1.ComponentProps<'span'>, 'children'> {
    status: StatusBadgeStatus;
    /** Override the default label text (e.g. "crawling" instead of "processing"). */
    label?: string;
}
declare function StatusBadge({ status, label, className, ...props }: StatusBadgeProps): react_jsx_runtime.JSX.Element;

declare const severityBadgeVariants: (props?: ({
    severity?: "critical" | "serious" | "moderate" | "minor" | "pass" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type SeverityBadgeSeverity = 'critical' | 'serious' | 'moderate' | 'minor' | 'pass';
interface SeverityBadgeProps extends Omit<React$1.ComponentProps<'span'>, 'children'> {
    severity: SeverityBadgeSeverity;
    /** Override the default label text (defaults to the severity name). */
    label?: string;
    /** Hide the leading icon. Severity should still be paired with text — never color alone. */
    hideIcon?: boolean;
}
declare function SeverityBadge({ severity, label, hideIcon, className, ...props }: SeverityBadgeProps): react_jsx_runtime.JSX.Element;

interface ProgressBarProps extends React$1.ComponentProps<'div'> {
    /** 0-100 */
    value: number;
    /** Track/fill thickness. `sm` matches inline card progress, `default` matches full-page progress. */
    size?: 'sm' | 'default';
    'aria-label'?: string;
}
declare function ProgressBar({ value, size, className, 'aria-label': ariaLabel, ...props }: ProgressBarProps): react_jsx_runtime.JSX.Element;

declare const metricCardVariants: (props?: ({
    tone?: "default" | "warning" | "success" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type MetricCardTone = 'default' | 'warning' | 'success';
interface MetricCardProps extends Omit<React$1.ComponentProps<'div'>, 'children'> {
    label: string;
    value: React$1.ReactNode;
    tone?: MetricCardTone;
}
declare function MetricCard({ label, value, tone, className, ...props }: MetricCardProps): react_jsx_runtime.JSX.Element;

interface StatPairItem {
    value: React$1.ReactNode;
    label: string;
}
interface StatPairProps extends Omit<React$1.ComponentProps<'div'>, 'children'> {
    items: [StatPairItem, StatPairItem];
}
declare function StatPair({ items, className, ...props }: StatPairProps): react_jsx_runtime.JSX.Element;

declare const calloutVariants: (props?: ({
    variant?: "warning" | "success" | "neutral" | "danger" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type CalloutVariant = 'neutral' | 'danger' | 'success' | 'warning';
interface CalloutProps extends Omit<React$1.ComponentProps<'div'>, 'title'> {
    variant?: CalloutVariant;
    /** Bold lead-in text before the description, e.g. "Scan failed." */
    title?: string;
    /** Hide the leading icon. */
    hideIcon?: boolean;
    icon?: React$1.ReactNode;
}
declare function Callout({ variant, title, hideIcon, icon, className, children, ...props }: CalloutProps): react_jsx_runtime.JSX.Element;

interface CollapsibleProps extends React$1.ComponentProps<'div'> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
declare function Collapsible({ open: openProp, defaultOpen, onOpenChange, children, ...props }: CollapsibleProps): react_jsx_runtime.JSX.Element;
type CollapsibleTriggerProps = React$1.ComponentProps<'button'>;
declare function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps): react_jsx_runtime.JSX.Element;
type CollapsibleContentProps = React$1.ComponentProps<'div'>;
declare function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps): react_jsx_runtime.JSX.Element;
type CollapsibleChevronProps = React$1.ComponentProps<'svg'>;
declare function CollapsibleChevron({ className, ...props }: CollapsibleChevronProps): react_jsx_runtime.JSX.Element;

type IconProps = React$1.ComponentProps<'svg'>;
declare function LockIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function ArrowRightIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function SlidersIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function SearchIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function UsersIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function ZapIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function CheckCircleIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function AlertTriangleIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function XCircleIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function MinusCircleIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function SpinnerIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function GlobeIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function BellIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function KeyboardIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function EyeIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function InfoCircleIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function ImagePlaceholderIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function ClockIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function FileTextIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function PackageIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;
declare function CheckIcon({ className, ...props }: IconProps): react_jsx_runtime.JSX.Element;

interface AlertErrorProps {
    errors: string[];
    title?: string;
}
declare function AlertError({ errors, title }: AlertErrorProps): react_jsx_runtime.JSX.Element;

interface CodeBlockProps {
    code: string;
    label?: string;
    maxHeightClassName?: string;
    enableHorizontalScroll?: boolean;
    className?: string;
}
declare function CodeBlock({ code, label, maxHeightClassName, enableHorizontalScroll, className, }: CodeBlockProps): react_jsx_runtime.JSX.Element;

type ContainerProps = Omit<React__default.ComponentPropsWithoutRef<'div'>, 'className' | 'style'> & {
    /** Deprecated: present for backward compatibility */
    className?: string;
    style?: React__default.CSSProperties;
    size?: 'sm' | 'md' | 'lg';
};
declare function Container({ className, style, size, ...rest }: ContainerProps): react_jsx_runtime.JSX.Element;

type StackProps = Omit<React__default.ComponentPropsWithoutRef<'div'>, 'className' | 'style'> & {
    /** Deprecated: present for backward compatibility */
    className?: string;
    style?: React__default.CSSProperties;
    direction?: 'row' | 'col';
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between';
    wrap?: boolean;
};
declare function Stack({ className, style, direction, gap, align, justify, wrap, ...rest }: StackProps): react_jsx_runtime.JSX.Element;

interface HeadingProps {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}
declare function Heading({ title, description, variant }: HeadingProps): react_jsx_runtime.JSX.Element;

interface InputErrorProps extends HTMLAttributes<HTMLParagraphElement> {
    message?: string;
}
declare function InputError({ message, className, ...props }: InputErrorProps): react_jsx_runtime.JSX.Element | null;

interface PasswordInputProps extends Omit<ComponentProps<'input'>, 'type'> {
    ref?: Ref<HTMLInputElement>;
}
declare function PasswordInput({ className, ref, ...props }: PasswordInputProps): react_jsx_runtime.JSX.Element;

declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Alert({ className, variant, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof alertVariants>): react_jsx_runtime.JSX.Element;
declare function AlertTitle({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function AlertDescription({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare function Avatar({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function AvatarImage({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Image>): react_jsx_runtime.JSX.Element;
declare function AvatarFallback({ className, ...props }: React$1.ComponentProps<typeof AvatarPrimitive.Fallback>): react_jsx_runtime.JSX.Element;

declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Badge({ className, variant, asChild, ...props }: React$1.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Breadcrumb({ ...props }: React$1.ComponentProps<"nav">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbList({ className, ...props }: React$1.ComponentProps<"ol">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbItem({ className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbLink({ asChild, className, ...props }: React$1.ComponentProps<"a"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function BreadcrumbPage({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbSeparator({ children, className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare function BreadcrumbEllipsis({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;

declare function Separator({ className, orientation, decorative, ...props }: React$1.ComponentProps<typeof SeparatorPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare const buttonGroupVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function ButtonGroup({ className, orientation, ...props }: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>): react_jsx_runtime.JSX.Element;
declare function ButtonGroupText({ className, asChild, ...props }: React.ComponentProps<"div"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function ButtonGroupSeparator({ className, orientation, ...props }: React.ComponentProps<typeof Separator>): react_jsx_runtime.JSX.Element;

declare function Card({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardAction({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardTitle({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardDescription({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function CardFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare const THEMES: {
    readonly light: "";
    readonly dark: ".dark";
};
type TooltipNameType = number | string;
type ChartConfig = Record<string, {
    label?: React$1.ReactNode;
    icon?: React$1.ComponentType;
} & ({
    color?: string;
    theme?: never;
} | {
    color?: never;
    theme: Record<keyof typeof THEMES, string>;
})>;
declare function ChartContainer({ id, className, children, config, initialDimension, ...props }: React$1.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React$1.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
    initialDimension?: {
        width: number;
        height: number;
    };
}): react_jsx_runtime.JSX.Element;
declare const ChartStyle: ({ id, config }: {
    id: string;
    config: ChartConfig;
}) => react_jsx_runtime.JSX.Element | null;
declare const ChartTooltip: typeof RechartsPrimitive.Tooltip;
declare function ChartTooltipContent({ active, payload, className, indicator, hideLabel, hideIndicator, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }: React$1.ComponentProps<typeof RechartsPrimitive.Tooltip> & React$1.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
} & Omit<RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>, "accessibilityLayer">): react_jsx_runtime.JSX.Element | null;
declare const ChartLegend: React$1.MemoExoticComponent<(outsideProps: RechartsPrimitive.LegendProps) => React$1.ReactPortal | null>;
declare function ChartLegendContent({ className, hideIcon, payload, verticalAlign, nameKey, }: React$1.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps): react_jsx_runtime.JSX.Element | null;

declare function Checkbox({ className, ...props }: React$1.ComponentProps<typeof CheckboxPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function Dialog({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function DialogTrigger({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function DialogPortal({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function DialogClose({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Close>): react_jsx_runtime.JSX.Element;
declare function DialogOverlay({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Overlay>): react_jsx_runtime.JSX.Element;
declare function DialogContent({ className, children, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function DialogHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function DialogFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function DialogTitle({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Title>): react_jsx_runtime.JSX.Element;
declare function DialogDescription({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Description>): react_jsx_runtime.JSX.Element;

declare function DropdownMenu({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuPortal({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Portal>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuTrigger({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuContent({ className, sideOffset, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuGroup({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Group>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuItem({ className, inset, variant, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: "default" | "destructive";
}): react_jsx_runtime.JSX.Element;
declare function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuRadioGroup({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuRadioItem({ className, children, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuLabel({ className, inset, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSeparator({ className, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Separator>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuShortcut({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSub({ ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.Sub>): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSubTrigger({ className, inset, children, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function DropdownMenuSubContent({ className, ...props }: React$1.ComponentProps<typeof DropdownMenuPrimitive.SubContent>): react_jsx_runtime.JSX.Element;

declare function Label({ className, ...props }: React$1.ComponentProps<typeof LabelPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">): react_jsx_runtime.JSX.Element;
declare function FieldLegend({ className, variant, ...props }: React.ComponentProps<"legend"> & {
    variant?: "legend" | "label";
}): react_jsx_runtime.JSX.Element;
declare function FieldGroup({ className, ...props }: React.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare const fieldVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | "responsive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Field({ className, orientation, ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>): react_jsx_runtime.JSX.Element;
declare function FieldContent({ className, ...props }: React.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>): react_jsx_runtime.JSX.Element;
declare function FieldTitle({ className, ...props }: React.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function FieldDescription({ className, ...props }: React.ComponentProps<"p">): react_jsx_runtime.JSX.Element;
declare function FieldSeparator({ children, className, ...props }: React.ComponentProps<"div"> & {
    children?: React.ReactNode;
}): react_jsx_runtime.JSX.Element;
declare function FieldError({ className, children, errors, ...props }: React.ComponentProps<"div"> & {
    errors?: Array<{
        message?: string;
    } | undefined>;
}): react_jsx_runtime.JSX.Element | null;

interface IconWrapperProps {
    iconNode?: LucideIcon | null;
    className?: string;
}
declare function Icon({ iconNode: IconComponent, className }: IconWrapperProps): react_jsx_runtime.JSX.Element | null;

declare function InputGroup({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare const inputGroupAddonVariants: (props?: ({
    align?: "inline-start" | "inline-end" | "block-start" | "block-end" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function InputGroupAddon({ className, align, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>): react_jsx_runtime.JSX.Element;
declare const inputGroupButtonVariants: (props?: ({
    size?: "sm" | "icon-xs" | "icon-sm" | "xs" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function InputGroupButton({ className, type, variant, size, ...props }: Omit<React$1.ComponentProps<typeof Button>, "size"> & VariantProps<typeof inputGroupButtonVariants>): react_jsx_runtime.JSX.Element;
declare function InputGroupText({ className, ...props }: React$1.ComponentProps<"span">): react_jsx_runtime.JSX.Element;
declare function InputGroupInput({ className, ...props }: React$1.ComponentProps<"input">): react_jsx_runtime.JSX.Element;
declare function InputGroupTextarea({ className, ...props }: React$1.ComponentProps<"textarea">): react_jsx_runtime.JSX.Element;

declare const InputOTP: React$1.ForwardRefExoticComponent<(Omit<Omit<React$1.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "maxLength" | "textAlign" | "onComplete" | "pushPasswordManagerStrategy" | "pasteTransformer" | "containerClassName" | "noScriptCSSFallback"> & {
    value?: string;
    onChange?: (newValue: string) => unknown;
    maxLength: number;
    textAlign?: "left" | "center" | "right";
    onComplete?: (...args: any[]) => unknown;
    pushPasswordManagerStrategy?: "increase-width" | "none";
    pasteTransformer?: (pasted: string) => string;
    containerClassName?: string;
    noScriptCSSFallback?: string | null;
} & {
    render: (props: input_otp.RenderProps) => React$1.ReactNode;
    children?: never;
} & React$1.RefAttributes<HTMLInputElement>, "ref"> | Omit<Omit<React$1.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "maxLength" | "textAlign" | "onComplete" | "pushPasswordManagerStrategy" | "pasteTransformer" | "containerClassName" | "noScriptCSSFallback"> & {
    value?: string;
    onChange?: (newValue: string) => unknown;
    maxLength: number;
    textAlign?: "left" | "center" | "right";
    onComplete?: (...args: any[]) => unknown;
    pushPasswordManagerStrategy?: "increase-width" | "none";
    pasteTransformer?: (pasted: string) => string;
    containerClassName?: string;
    noScriptCSSFallback?: string | null;
} & {
    render?: never;
    children: React$1.ReactNode;
} & React$1.RefAttributes<HTMLInputElement>, "ref">) & React$1.RefAttributes<HTMLInputElement>>;
declare const InputOTPGroup: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const InputOTPSlot: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & {
    index: number;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const InputOTPSeparator: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare function Input({ className, type, ...props }: React$1.ComponentProps<"input">): react_jsx_runtime.JSX.Element;

declare function ItemGroup({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function ItemSeparator({ className, ...props }: React$1.ComponentProps<typeof Separator>): react_jsx_runtime.JSX.Element;
declare const itemVariants: (props?: ({
    variant?: "default" | "outline" | "muted" | null | undefined;
    size?: "default" | "sm" | "xs" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Item({ className, variant, size, asChild, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof itemVariants> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare const itemMediaVariants: (props?: ({
    variant?: "default" | "icon" | "image" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function ItemMedia({ className, variant, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>): react_jsx_runtime.JSX.Element;
declare function ItemContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function ItemTitle({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function ItemDescription({ className, ...props }: React$1.ComponentProps<"p">): react_jsx_runtime.JSX.Element;
declare function ItemActions({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function ItemHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function ItemFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare function NavigationMenu({ className, children, viewport, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
    viewport?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function NavigationMenuList({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.List>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuItem({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Item>): react_jsx_runtime.JSX.Element;
declare const navigationMenuTriggerStyle: (props?: class_variance_authority_types.ClassProp | undefined) => string;
declare function NavigationMenuTrigger({ className, children, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuContent({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuViewport({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Viewport>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuLink({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Link>): react_jsx_runtime.JSX.Element;
declare function NavigationMenuIndicator({ className, ...props }: React$1.ComponentProps<typeof NavigationMenuPrimitive.Indicator>): react_jsx_runtime.JSX.Element;

interface PlaceholderPatternProps {
    className?: string;
}
declare function PlaceholderPattern({ className }: PlaceholderPatternProps): react_jsx_runtime.JSX.Element;

declare function Popover({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function PopoverTrigger({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function PopoverContent({ className, align, sideOffset, ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function PopoverAnchor({ ...props }: React$1.ComponentProps<typeof PopoverPrimitive.Anchor>): react_jsx_runtime.JSX.Element;
declare function PopoverHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function PopoverTitle({ className, ...props }: React$1.ComponentProps<"h2">): react_jsx_runtime.JSX.Element;
declare function PopoverDescription({ className, ...props }: React$1.ComponentProps<"p">): react_jsx_runtime.JSX.Element;

declare function Progress({ className, value, ...props }: React$1.ComponentProps<typeof ProgressPrimitive.Root>): react_jsx_runtime.JSX.Element;

declare function ScrollArea({ className, children, ...props }: React$1.ComponentProps<typeof ScrollAreaPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function ScrollBar({ className, orientation, ...props }: React$1.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>): react_jsx_runtime.JSX.Element;

declare function Select({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function SelectGroup({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Group>): react_jsx_runtime.JSX.Element;
declare function SelectValue({ ...props }: React$1.ComponentProps<typeof SelectPrimitive.Value>): react_jsx_runtime.JSX.Element;
declare function SelectTrigger({ className, size, children, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "default";
}): react_jsx_runtime.JSX.Element;
declare function SelectContent({ className, children, position, side, sideOffset, align, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Content>): react_jsx_runtime.JSX.Element;
declare function SelectLabel({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Label>): react_jsx_runtime.JSX.Element;
declare function SelectItem({ className, children, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Item>): react_jsx_runtime.JSX.Element;
declare function SelectSeparator({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.Separator>): react_jsx_runtime.JSX.Element;
declare function SelectScrollUpButton({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.ScrollUpButton>): react_jsx_runtime.JSX.Element;
declare function SelectScrollDownButton({ className, ...props }: React$1.ComponentProps<typeof SelectPrimitive.ScrollDownButton>): react_jsx_runtime.JSX.Element;

declare function Sheet({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function SheetTrigger({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function SheetClose({ ...props }: React$1.ComponentProps<typeof DialogPrimitive.Close>): react_jsx_runtime.JSX.Element;
declare function SheetContent({ className, children, side, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left";
}): react_jsx_runtime.JSX.Element;
declare function SheetHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SheetFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SheetTitle({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Title>): react_jsx_runtime.JSX.Element;
declare function SheetDescription({ className, ...props }: React$1.ComponentProps<typeof DialogPrimitive.Description>): react_jsx_runtime.JSX.Element;

declare function TooltipProvider({ delayDuration, ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Provider>): react_jsx_runtime.JSX.Element;
declare function Tooltip({ ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare function TooltipTrigger({ ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function TooltipContent({ className, sideOffset, children, ...props }: React$1.ComponentProps<typeof TooltipPrimitive.Content>): react_jsx_runtime.JSX.Element;

type SidebarContext = {
    state: "expanded" | "collapsed";
    open: boolean;
    setOpen: (open: boolean) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
};
declare const SidebarContext: React$1.Context<SidebarContext | null>;
declare function useSidebar(): SidebarContext;
declare function SidebarProvider({ defaultOpen, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }: React$1.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}): react_jsx_runtime.JSX.Element;
declare function Sidebar({ side, variant, collapsible, className, children, ...props }: React$1.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
}): react_jsx_runtime.JSX.Element;
declare function SidebarTrigger({ className, onClick, ...props }: React$1.ComponentProps<typeof Button>): react_jsx_runtime.JSX.Element;
declare function SidebarRail({ className, ...props }: React$1.ComponentProps<"button">): react_jsx_runtime.JSX.Element;
declare function SidebarInset({ className, ...props }: React$1.ComponentProps<"main">): react_jsx_runtime.JSX.Element;
declare function SidebarInput({ className, ...props }: React$1.ComponentProps<typeof Input>): react_jsx_runtime.JSX.Element;
declare function SidebarHeader({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarFooter({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarSeparator({ className, ...props }: React$1.ComponentProps<typeof Separator>): react_jsx_runtime.JSX.Element;
declare function SidebarContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarGroup({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarGroupLabel({ className, asChild, ...props }: React$1.ComponentProps<"div"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarGroupAction({ className, asChild, ...props }: React$1.ComponentProps<"button"> & {
    asChild?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarGroupContent({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarMenu({ className, ...props }: React$1.ComponentProps<"ul">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuItem({ className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare const sidebarMenuButtonVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function SidebarMenuButton({ asChild, isActive, variant, size, tooltip, className, ...props }: React$1.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React$1.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>): react_jsx_runtime.JSX.Element;
declare function SidebarMenuAction({ className, asChild, showOnHover, ...props }: React$1.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarMenuBadge({ className, ...props }: React$1.ComponentProps<"div">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSkeleton({ className, showIcon, ...props }: React$1.ComponentProps<"div"> & {
    showIcon?: boolean;
}): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSub({ className, ...props }: React$1.ComponentProps<"ul">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSubItem({ className, ...props }: React$1.ComponentProps<"li">): react_jsx_runtime.JSX.Element;
declare function SidebarMenuSubButton({ asChild, size, isActive, className, ...props }: React$1.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
}): react_jsx_runtime.JSX.Element;

declare function Skeleton({ className, ...props }: React.ComponentProps<"div">): react_jsx_runtime.JSX.Element;

declare function Toaster({ ...props }: ToasterProps): react_jsx_runtime.JSX.Element;

declare function Spinner({ className, ...props }: React.ComponentProps<"svg">): react_jsx_runtime.JSX.Element;

declare function Table({ className, ...props }: React$1.ComponentProps<"table">): react_jsx_runtime.JSX.Element;
declare function TableHeader({ className, ...props }: React$1.ComponentProps<"thead">): react_jsx_runtime.JSX.Element;
declare function TableBody({ className, ...props }: React$1.ComponentProps<"tbody">): react_jsx_runtime.JSX.Element;
declare function TableFooter({ className, ...props }: React$1.ComponentProps<"tfoot">): react_jsx_runtime.JSX.Element;
declare function TableRow({ className, ...props }: React$1.ComponentProps<"tr">): react_jsx_runtime.JSX.Element;
declare function TableHead({ className, ...props }: React$1.ComponentProps<"th">): react_jsx_runtime.JSX.Element;
declare function TableCell({ className, ...props }: React$1.ComponentProps<"td">): react_jsx_runtime.JSX.Element;
declare function TableCaption({ className, ...props }: React$1.ComponentProps<"caption">): react_jsx_runtime.JSX.Element;

declare function Tabs({ className, orientation, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Root>): react_jsx_runtime.JSX.Element;
declare const tabsListVariants: (props?: ({
    variant?: "default" | "line" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function TabsList({ className, variant, ...props }: React$1.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>): react_jsx_runtime.JSX.Element;
declare function TabsTrigger({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Trigger>): react_jsx_runtime.JSX.Element;
declare function TabsContent({ className, ...props }: React$1.ComponentProps<typeof TabsPrimitive.Content>): react_jsx_runtime.JSX.Element;

declare function Textarea({ className, ...props }: React$1.ComponentProps<"textarea">): react_jsx_runtime.JSX.Element;

declare const toggleVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Toggle({ className, variant, size, ...props }: React$1.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>): react_jsx_runtime.JSX.Element;

declare function ToggleGroup({ className, variant, size, children, ...props }: React$1.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>): react_jsx_runtime.JSX.Element;
declare function ToggleGroupItem({ className, children, variant, size, ...props }: React$1.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>): react_jsx_runtime.JSX.Element;

declare function useIsMobile(): boolean;

declare function cn(...inputs: ClassValue[]): string;

export { Alert, AlertDescription, AlertError, type AlertErrorProps, AlertTitle, AlertTriangleIcon, ArrowRightIcon, Avatar, AvatarFallback, AvatarImage, Badge, BellIcon, Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText, type ButtonProps, Callout, type CalloutProps, type CalloutVariant, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent, CheckCircleIcon, CheckIcon, Checkbox, ClockIcon, CodeBlock, type CodeBlockProps, Collapsible, CollapsibleChevron, type CollapsibleChevronProps, CollapsibleContent, type CollapsibleContentProps, type CollapsibleProps, CollapsibleTrigger, type CollapsibleTriggerProps, Container, type ContainerProps, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, EyeIcon, Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle, FileTextIcon, GlobeIcon, Heading, type HeadingProps, Icon, type IconProps, type IconWrapperProps, ImagePlaceholderIcon, InfoCircleIcon, Input, InputError, type InputErrorProps, InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemHeader, ItemMedia, ItemSeparator, ItemTitle, KeyboardIcon, Label, LockIcon, MetricCard, type MetricCardProps, type MetricCardTone, MinusCircleIcon, NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport, PackageIcon, PasswordInput, type PasswordInputProps, PlaceholderPattern, type PlaceholderPatternProps, Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger, Progress, ProgressBar, type ProgressBarProps, ScrollArea, ScrollBar, SearchIcon, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Separator, SeverityBadge, type SeverityBadgeProps, type SeverityBadgeSeverity, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, Skeleton, SlidersIcon, Spinner, SpinnerIcon, Stack, type StackProps, StatPair, type StatPairItem, type StatPairProps, StatusBadge, type StatusBadgeProps, type StatusBadgeStatus, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, Toaster, Toggle, ToggleGroup, ToggleGroupItem, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, UsersIcon, XCircleIcon, ZapIcon, badgeVariants, buttonGroupVariants, buttonVariants, calloutVariants, cn, metricCardVariants, navigationMenuTriggerStyle, severityBadgeVariants, statusBadgeVariants, tabsListVariants, toggleVariants, useIsMobile, useSidebar };
