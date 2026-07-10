import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { jsx, jsxs } from 'react/jsx-runtime';
import * as React2 from 'react';

// src/components/ui/button.tsx
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        "ghost-destructive": "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
var statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      status: {
        queued: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
        complete: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
        cancelled: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      }
    },
    defaultVariants: {
      status: "queued"
    }
  }
);
var STATUS_ICON = {
  queued: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 6v6l4 2" })
  ] }),
  processing: /* @__PURE__ */ jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: "animate-spin",
      children: /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 11-3.5-7.1" })
    }
  ),
  complete: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("path", { d: "M9 12l2 2 4-4" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" })
  ] }),
  cancelled: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M6 6l12 12M18 6L6 18" }) }),
  failed: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M15 9l-6 6M9 9l6 6" })
  ] })
};
var STATUS_LABEL = {
  queued: "queued",
  processing: "processing",
  complete: "complete",
  cancelled: "cancelled",
  failed: "failed"
};
function StatusBadge({ status, label, className, ...props }) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      "data-slot": "status-badge",
      className: cn(statusBadgeVariants({ status }), className),
      ...props,
      children: [
        STATUS_ICON[status],
        label ?? STATUS_LABEL[status]
      ]
    }
  );
}
var severityBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      severity: {
        critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        serious: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
        moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        minor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        pass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      }
    },
    defaultVariants: {
      severity: "minor"
    }
  }
);
var SEVERITY_ICON = {
  critical: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("path", { d: "M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" }),
    /* @__PURE__ */ jsx("path", { d: "M13.7 21a2 2 0 01-3.4 0" })
  ] }),
  serious: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("rect", { x: "2", y: "6", width: "20", height: "12", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" })
  ] }),
  moderate: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
  ] }),
  minor: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 8v4M12 16h.01" })
  ] }),
  pass: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsx("path", { d: "M20 6L9 17l-5-5" }) })
};
function SeverityBadge({
  severity,
  label,
  hideIcon = false,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "span",
    {
      "data-slot": "severity-badge",
      className: cn(severityBadgeVariants({ severity }), className),
      ...props,
      children: [
        !hideIcon && SEVERITY_ICON[severity],
        label ?? severity
      ]
    }
  );
}
function ProgressBar({
  value,
  size = "default",
  className,
  "aria-label": ariaLabel,
  ...props
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "progress-bar",
      role: "progressbar",
      "aria-valuenow": clamped,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": ariaLabel,
      className: cn(
        "overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800",
        size === "sm" ? "h-1.5" : "h-2",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "h-full rounded-full bg-indigo-700 transition-[width] duration-500 ease-out",
          style: { width: `${clamped}%` }
        }
      )
    }
  );
}
var metricCardVariants = cva("rounded-lg p-4", {
  variants: {
    tone: {
      default: "bg-slate-100 dark:bg-slate-800/60",
      warning: "bg-yellow-50 dark:bg-yellow-900/20",
      success: "bg-emerald-50 dark:bg-emerald-900/20"
    }
  },
  defaultVariants: {
    tone: "default"
  }
});
var metricCardLabelVariants = cva("mb-1 text-xs", {
  variants: {
    tone: {
      default: "text-slate-500 dark:text-slate-400",
      warning: "text-yellow-700 dark:text-yellow-400",
      success: "text-emerald-700 dark:text-emerald-400"
    }
  },
  defaultVariants: {
    tone: "default"
  }
});
var metricCardValueVariants = cva("text-xl font-medium", {
  variants: {
    tone: {
      default: "",
      warning: "text-yellow-700 dark:text-yellow-400",
      success: "text-emerald-700 dark:text-emerald-400"
    }
  },
  defaultVariants: {
    tone: "default"
  }
});
function MetricCard({ label, value, tone = "default", className, ...props }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "metric-card",
      className: cn(metricCardVariants({ tone }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsx("p", { className: cn(metricCardLabelVariants({ tone })), children: label }),
        /* @__PURE__ */ jsx("p", { className: cn(metricCardValueVariants({ tone })), children: value })
      ]
    }
  );
}
function StatPair({ items, className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "stat-pair",
      className: cn(
        "flex items-center justify-center gap-8 rounded-lg bg-slate-100 py-7 dark:bg-slate-800/60",
        className
      ),
      ...props,
      children: items.map((item, i) => /* @__PURE__ */ jsxs(React2.Fragment, { children: [
        i > 0 && /* @__PURE__ */ jsx("div", { className: "h-10 w-px bg-slate-300 dark:bg-slate-700" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-3xl leading-none font-medium", children: item.value }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-slate-500 dark:text-slate-400", children: item.label })
        ] })
      ] }, item.label))
    }
  );
}
var calloutVariants = cva(
  "flex items-start gap-2.5 rounded-lg border px-4 py-3.5 text-xs",
  {
    variants: {
      variant: {
        neutral: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400",
        danger: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-400",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/40 dark:bg-yellow-900/20 dark:text-yellow-400"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);
var CALLOUT_ICON = {
  neutral: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 16v-4M12 8h.01" })
  ] }),
  danger: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "M12 8v4M12 16h.01" })
  ] }),
  success: /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsx("path", { d: "M9 12l2 2 4-4" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" })
  ] }),
  warning: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("path", { d: "M12 9v4M12 17h.01M10.3 3.9L2.5 18a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" }) })
};
function Callout({
  variant = "neutral",
  title,
  hideIcon = false,
  icon,
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "callout",
      className: cn(calloutVariants({ variant }), className),
      ...props,
      children: [
        !hideIcon && /* @__PURE__ */ jsx("span", { className: "mt-0.5 size-3.5 shrink-0 [&_svg]:size-3.5", children: icon ?? CALLOUT_ICON[variant] }),
        /* @__PURE__ */ jsxs("p", { children: [
          title && /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            title,
            " "
          ] }),
          children
        ] })
      ]
    }
  );
}
var CollapsibleContext = React2.createContext(null);
function useCollapsibleContext() {
  const ctx = React2.useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error("Collapsible.* components must be used within <Collapsible>");
  }
  return ctx;
}
function Collapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React2.useState(defaultOpen);
  const isControlled = openProp !== void 0;
  const open = isControlled ? openProp : uncontrolledOpen;
  const contentId = React2.useId();
  const toggle = React2.useCallback(() => {
    const next = !open;
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);
  const value = React2.useMemo(() => ({ open, toggle, contentId }), [open, toggle, contentId]);
  return /* @__PURE__ */ jsx(CollapsibleContext.Provider, { value, children: /* @__PURE__ */ jsx("div", { "data-slot": "collapsible", ...props, children }) });
}
function CollapsibleTrigger({ className, children, ...props }) {
  const { open, toggle, contentId } = useCollapsibleContext();
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      "data-slot": "collapsible-trigger",
      "aria-expanded": open,
      "aria-controls": contentId,
      onClick: toggle,
      className: cn(
        "flex w-full items-center gap-2.5 px-4 py-3 text-left hover:bg-slate-50 focus:ring-2 focus:ring-indigo-600 focus:outline-none focus:ring-inset dark:hover:bg-slate-800/40",
        className
      ),
      ...props,
      children
    }
  );
}
function CollapsibleContent({ className, children, ...props }) {
  const { open, contentId } = useCollapsibleContext();
  return /* @__PURE__ */ jsx(
    "div",
    {
      id: contentId,
      "data-slot": "collapsible-content",
      className: cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      ),
      children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsx("div", { className, ...props, children }) })
    }
  );
}
function CollapsibleChevron({ className, ...props }) {
  const { open } = useCollapsibleContext();
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn(
        "shrink-0 text-slate-400 transition-transform duration-200",
        open && "rotate-180",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx("path", { d: "M6 9l6 6 6-6" })
    }
  );
}

export { Button, Callout, Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger, MetricCard, ProgressBar, SeverityBadge, StatPair, StatusBadge, buttonVariants, calloutVariants, cn, metricCardVariants, severityBadgeVariants, statusBadgeVariants };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map