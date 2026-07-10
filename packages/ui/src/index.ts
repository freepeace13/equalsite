// Barrel for @equalsite/ui. Add explicit sub-path exports in package.json
// (never a shorthand directory export) if this package grows more than one entry point.
export { Button, buttonVariants } from './components/ui/button';
export type { ButtonProps } from './components/ui/button';

export { StatusBadge, statusBadgeVariants } from './components/ui/status-badge';
export type { StatusBadgeProps, StatusBadgeStatus } from './components/ui/status-badge';

export { SeverityBadge, severityBadgeVariants } from './components/ui/severity-badge';
export type {
  SeverityBadgeProps,
  SeverityBadgeSeverity,
} from './components/ui/severity-badge';

export { ProgressBar } from './components/ui/progress-bar';
export type { ProgressBarProps } from './components/ui/progress-bar';

export { MetricCard, metricCardVariants } from './components/ui/metric-card';
export type { MetricCardProps, MetricCardTone } from './components/ui/metric-card';

export { StatPair } from './components/ui/stat-pair';
export type { StatPairProps, StatPairItem } from './components/ui/stat-pair';

export { Callout, calloutVariants } from './components/ui/callout';
export type { CalloutProps, CalloutVariant } from './components/ui/callout';

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleChevron,
} from './components/ui/collapsible';
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
  CollapsibleChevronProps,
} from './components/ui/collapsible';

export { cn } from './lib/utils';
