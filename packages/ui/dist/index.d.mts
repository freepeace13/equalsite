import * as react_jsx_runtime from 'react/jsx-runtime';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { ClassValue } from 'clsx';

declare const buttonVariants: (props?: ({
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "ghost-destructive" | "link" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}
declare function Button({ className, variant, size, asChild, ...props }: ButtonProps): react_jsx_runtime.JSX.Element;

declare const statusBadgeVariants: (props?: ({
    status?: "queued" | "processing" | "complete" | "cancelled" | "failed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type StatusBadgeStatus = 'queued' | 'processing' | 'complete' | 'cancelled' | 'failed';
interface StatusBadgeProps extends Omit<React.ComponentProps<'span'>, 'children'> {
    status: StatusBadgeStatus;
    /** Override the default label text (e.g. "crawling" instead of "processing"). */
    label?: string;
}
declare function StatusBadge({ status, label, className, ...props }: StatusBadgeProps): react_jsx_runtime.JSX.Element;

declare const severityBadgeVariants: (props?: ({
    severity?: "critical" | "serious" | "moderate" | "minor" | "pass" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type SeverityBadgeSeverity = 'critical' | 'serious' | 'moderate' | 'minor' | 'pass';
interface SeverityBadgeProps extends Omit<React.ComponentProps<'span'>, 'children'> {
    severity: SeverityBadgeSeverity;
    /** Override the default label text (defaults to the severity name). */
    label?: string;
    /** Hide the leading icon. Severity should still be paired with text — never color alone. */
    hideIcon?: boolean;
}
declare function SeverityBadge({ severity, label, hideIcon, className, ...props }: SeverityBadgeProps): react_jsx_runtime.JSX.Element;

interface ProgressBarProps extends React.ComponentProps<'div'> {
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
interface MetricCardProps extends Omit<React.ComponentProps<'div'>, 'children'> {
    label: string;
    value: React.ReactNode;
    tone?: MetricCardTone;
}
declare function MetricCard({ label, value, tone, className, ...props }: MetricCardProps): react_jsx_runtime.JSX.Element;

interface StatPairItem {
    value: React.ReactNode;
    label: string;
}
interface StatPairProps extends Omit<React.ComponentProps<'div'>, 'children'> {
    items: [StatPairItem, StatPairItem];
}
declare function StatPair({ items, className, ...props }: StatPairProps): react_jsx_runtime.JSX.Element;

declare const calloutVariants: (props?: ({
    variant?: "warning" | "success" | "neutral" | "danger" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type CalloutVariant = 'neutral' | 'danger' | 'success' | 'warning';
interface CalloutProps extends Omit<React.ComponentProps<'div'>, 'title'> {
    variant?: CalloutVariant;
    /** Bold lead-in text before the description, e.g. "Scan failed." */
    title?: string;
    /** Hide the leading icon. */
    hideIcon?: boolean;
    icon?: React.ReactNode;
}
declare function Callout({ variant, title, hideIcon, icon, className, children, ...props }: CalloutProps): react_jsx_runtime.JSX.Element;

interface CollapsibleProps extends React.ComponentProps<'div'> {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
declare function Collapsible({ open: openProp, defaultOpen, onOpenChange, children, ...props }: CollapsibleProps): react_jsx_runtime.JSX.Element;
type CollapsibleTriggerProps = React.ComponentProps<'button'>;
declare function CollapsibleTrigger({ className, children, ...props }: CollapsibleTriggerProps): react_jsx_runtime.JSX.Element;
type CollapsibleContentProps = React.ComponentProps<'div'>;
declare function CollapsibleContent({ className, children, ...props }: CollapsibleContentProps): react_jsx_runtime.JSX.Element;
type CollapsibleChevronProps = React.ComponentProps<'svg'>;
declare function CollapsibleChevron({ className, ...props }: CollapsibleChevronProps): react_jsx_runtime.JSX.Element;

type IconProps = React.ComponentProps<'svg'>;
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

declare function cn(...inputs: ClassValue[]): string;

export { AlertTriangleIcon, ArrowRightIcon, BellIcon, Button, type ButtonProps, Callout, type CalloutProps, type CalloutVariant, CheckCircleIcon, CheckIcon, ClockIcon, Collapsible, CollapsibleChevron, type CollapsibleChevronProps, CollapsibleContent, type CollapsibleContentProps, type CollapsibleProps, CollapsibleTrigger, type CollapsibleTriggerProps, EyeIcon, FileTextIcon, GlobeIcon, type IconProps, ImagePlaceholderIcon, InfoCircleIcon, KeyboardIcon, LockIcon, MetricCard, type MetricCardProps, type MetricCardTone, MinusCircleIcon, PackageIcon, ProgressBar, type ProgressBarProps, SearchIcon, SeverityBadge, type SeverityBadgeProps, type SeverityBadgeSeverity, SlidersIcon, SpinnerIcon, StatPair, type StatPairItem, type StatPairProps, StatusBadge, type StatusBadgeProps, type StatusBadgeStatus, UsersIcon, XCircleIcon, ZapIcon, buttonVariants, calloutVariants, cn, metricCardVariants, severityBadgeVariants, statusBadgeVariants };
