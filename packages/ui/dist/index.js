'use strict';

var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var jsxRuntime = require('react/jsx-runtime');
var React6 = require('react');
var lucideReact = require('lucide-react');
var ScrollAreaPrimitive = require('@radix-ui/react-scroll-area');
var AvatarPrimitive = require('@radix-ui/react-avatar');
var SeparatorPrimitive = require('@radix-ui/react-separator');
var RechartsPrimitive = require('recharts');
var CheckboxPrimitive = require('@radix-ui/react-checkbox');
var DialogPrimitive = require('@radix-ui/react-dialog');
var DropdownMenuPrimitive = require('@radix-ui/react-dropdown-menu');
var LabelPrimitive = require('@radix-ui/react-label');
var inputOtp = require('input-otp');
var NavigationMenuPrimitive = require('@radix-ui/react-navigation-menu');
var PopoverPrimitive = require('@radix-ui/react-popover');
var ProgressPrimitive = require('@radix-ui/react-progress');
var SelectPrimitive = require('@radix-ui/react-select');
var TooltipPrimitive = require('@radix-ui/react-tooltip');
var sonner = require('sonner');
var TabsPrimitive = require('@radix-ui/react-tabs');
var ToggleGroupPrimitive = require('@radix-ui/react-toggle-group');
var TogglePrimitive = require('@radix-ui/react-toggle');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React6__namespace = /*#__PURE__*/_interopNamespace(React6);
var ScrollAreaPrimitive__namespace = /*#__PURE__*/_interopNamespace(ScrollAreaPrimitive);
var AvatarPrimitive__namespace = /*#__PURE__*/_interopNamespace(AvatarPrimitive);
var SeparatorPrimitive__namespace = /*#__PURE__*/_interopNamespace(SeparatorPrimitive);
var RechartsPrimitive__namespace = /*#__PURE__*/_interopNamespace(RechartsPrimitive);
var CheckboxPrimitive__namespace = /*#__PURE__*/_interopNamespace(CheckboxPrimitive);
var DialogPrimitive__namespace = /*#__PURE__*/_interopNamespace(DialogPrimitive);
var DropdownMenuPrimitive__namespace = /*#__PURE__*/_interopNamespace(DropdownMenuPrimitive);
var LabelPrimitive__namespace = /*#__PURE__*/_interopNamespace(LabelPrimitive);
var NavigationMenuPrimitive__namespace = /*#__PURE__*/_interopNamespace(NavigationMenuPrimitive);
var PopoverPrimitive__namespace = /*#__PURE__*/_interopNamespace(PopoverPrimitive);
var ProgressPrimitive__namespace = /*#__PURE__*/_interopNamespace(ProgressPrimitive);
var SelectPrimitive__namespace = /*#__PURE__*/_interopNamespace(SelectPrimitive);
var TooltipPrimitive__namespace = /*#__PURE__*/_interopNamespace(TooltipPrimitive);
var TabsPrimitive__namespace = /*#__PURE__*/_interopNamespace(TabsPrimitive);
var ToggleGroupPrimitive__namespace = /*#__PURE__*/_interopNamespace(ToggleGroupPrimitive);
var TogglePrimitive__namespace = /*#__PURE__*/_interopNamespace(TogglePrimitive);

// src/components/atoms/button.tsx
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
var buttonVariants = classVarianceAuthority.cva(
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
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
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
  const Comp = asChild ? reactSlot.Slot : "button";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
var statusBadgeVariants = classVarianceAuthority.cva(
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
  queued: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 6v6l4 2" })
  ] }),
  processing: /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: "animate-spin",
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 12a9 9 0 11-3.5-7.1" })
    }
  ),
  complete: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 12l2 2 4-4" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" })
  ] }),
  cancelled: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 6l12 12M18 6L6 18" }) }),
  failed: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M15 9l-6 6M9 9l6 6" })
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
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
var severityBadgeVariants = classVarianceAuthority.cva(
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
  critical: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13.7 21a2 2 0 01-3.4 0" })
  ] }),
  serious: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "2", y: "6", width: "20", height: "12", rx: "2" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" })
  ] }),
  moderate: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "3" })
  ] }),
  minor: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 8v4M12 16h.01" })
  ] }),
  pass: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20 6L9 17l-5-5" }) })
};
function SeverityBadge({
  severity,
  label,
  hideIcon = false,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
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
  return /* @__PURE__ */ jsxRuntime.jsx(
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
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: "h-full rounded-full bg-indigo-700 transition-[width] duration-500 ease-out",
          style: { width: `${clamped}%` }
        }
      )
    }
  );
}
var metricCardVariants = classVarianceAuthority.cva("rounded-lg p-4", {
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
var metricCardLabelVariants = classVarianceAuthority.cva("mb-1 text-xs", {
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
var metricCardValueVariants = classVarianceAuthority.cva("text-xl font-medium", {
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "data-slot": "metric-card",
      className: cn(metricCardVariants({ tone }), className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: cn(metricCardLabelVariants({ tone })), children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: cn(metricCardValueVariants({ tone })), children: value })
      ]
    }
  );
}
function StatPair({ items, className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "stat-pair",
      className: cn(
        "flex items-center justify-center gap-8 rounded-lg bg-slate-100 py-7 dark:bg-slate-800/60",
        className
      ),
      ...props,
      children: items.map((item, i) => /* @__PURE__ */ jsxRuntime.jsxs(React6__namespace.Fragment, { children: [
        i > 0 && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-10 w-px bg-slate-300 dark:bg-slate-700" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-3xl leading-none font-medium", children: item.value }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-2 text-xs text-slate-500 dark:text-slate-400", children: item.label })
        ] })
      ] }, item.label))
    }
  );
}
var calloutVariants = classVarianceAuthority.cva(
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
  neutral: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 16v-4M12 8h.01" })
  ] }),
  danger: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 8v4M12 16h.01" })
  ] }),
  success: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 12l2 2 4-4" }),
    /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" })
  ] }),
  warning: /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 9v4M12 17h.01M10.3 3.9L2.5 18a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" }) })
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
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "data-slot": "callout",
      className: cn(calloutVariants({ variant }), className),
      ...props,
      children: [
        !hideIcon && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mt-0.5 size-3.5 shrink-0 [&_svg]:size-3.5", children: icon ?? CALLOUT_ICON[variant] }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { children: [
          title && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-medium", children: [
            title,
            " "
          ] }),
          children
        ] })
      ]
    }
  );
}
var CollapsibleContext = React6__namespace.createContext(null);
function useCollapsibleContext() {
  const ctx = React6__namespace.useContext(CollapsibleContext);
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
  const [uncontrolledOpen, setUncontrolledOpen] = React6__namespace.useState(defaultOpen);
  const isControlled = openProp !== void 0;
  const open = isControlled ? openProp : uncontrolledOpen;
  const contentId = React6__namespace.useId();
  const toggle = React6__namespace.useCallback(() => {
    const next = !open;
    if (!isControlled) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  }, [open, isControlled, onOpenChange]);
  const value = React6__namespace.useMemo(() => ({ open, toggle, contentId }), [open, toggle, contentId]);
  return /* @__PURE__ */ jsxRuntime.jsx(CollapsibleContext.Provider, { value, children: /* @__PURE__ */ jsxRuntime.jsx("div", { "data-slot": "collapsible", ...props, children }) });
}
function CollapsibleTrigger({ className, children, ...props }) {
  const { open, toggle, contentId } = useCollapsibleContext();
  return /* @__PURE__ */ jsxRuntime.jsx(
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
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      id: contentId,
      "data-slot": "collapsible-content",
      className: cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className, ...props, children }) })
    }
  );
}
function CollapsibleChevron({ className, ...props }) {
  const { open } = useCollapsibleContext();
  return /* @__PURE__ */ jsxRuntime.jsx(
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
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 9l6 6 6-6" })
    }
  );
}
function LockIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "5", y: "11", width: "14", height: "9", rx: "2" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 11V7a4 4 0 018 0v4" })
      ]
    }
  );
}
function ArrowRightIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      className: cn("shrink-0", className),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 12h14M13 6l6 6-6 6" })
    }
  );
}
function SlidersIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "4", y1: "21", x2: "4", y2: "14" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "4", y1: "10", x2: "4", y2: "3" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "12", y1: "21", x2: "12", y2: "12" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "3" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "20", y1: "21", x2: "20", y2: "16" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "20", y1: "12", x2: "20", y2: "3" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "1", y1: "14", x2: "7", y2: "14" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "9", y1: "8", x2: "15", y2: "8" }),
        /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "17", y1: "16", x2: "23", y2: "16" })
      ]
    }
  );
}
function SearchIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "11", cy: "11", r: "7" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 21l-4.3-4.3" })
      ]
    }
  );
}
function UsersIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" }),
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "9", cy: "7", r: "4" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" })
      ]
    }
  );
}
function ZapIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13 2L4 14h6l-1 8 9-12h-6l1-8z" })
    }
  );
}
function CheckCircleIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 12l2 2 4-4" })
      ]
    }
  );
}
function AlertTriangleIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 9v4M12 17h.01M10.3 3.9L2.5 18a2 2 0 001.7 3h15.6a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" })
    }
  );
}
function XCircleIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M15 9l-6 6M9 9l6 6" })
      ]
    }
  );
}
function MinusCircleIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 12h8" })
      ]
    }
  );
}
function SpinnerIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      width: "15",
      height: "15",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0 animate-spin", className),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 12a9 9 0 11-3.5-7.1" })
    }
  );
}
function GlobeIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" })
      ]
    }
  );
}
function BellIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9z" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13.7 21a2 2 0 01-3.4 0" })
      ]
    }
  );
}
function KeyboardIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "2", y: "6", width: "20", height: "12", rx: "2" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12" })
      ]
    }
  );
}
function EyeIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }),
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "3" })
      ]
    }
  );
}
function InfoCircleIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 8v4M12 16h.01" })
      ]
    }
  );
}
function ImagePlaceholderIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 15l-5-5L5 21" })
      ]
    }
  );
}
function ClockIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 6v6l4 2" })
      ]
    }
  );
}
function FileTextIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M14 2v6h6" })
      ]
    }
  );
}
function PackageIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "12",
      height: "12",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      className: cn("shrink-0", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "2", y: "7", width: "20", height: "14", rx: "2" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" })
      ]
    }
  );
}
function CheckIcon({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      width: "22",
      height: "22",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      className: cn("shrink-0", className),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M20 6L9 17l-5-5" })
    }
  );
}
var alertVariants = classVarianceAuthority.cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/80"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Alert({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "alert",
      role: "alert",
      className: cn(alertVariants({ variant }), className),
      ...props
    }
  );
}
function AlertTitle({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "alert-title",
      className: cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      ),
      ...props
    }
  );
}
function AlertDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "alert-description",
      className: cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      ),
      ...props
    }
  );
}
function AlertError({ errors, title }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(Alert, { variant: "destructive", children: [
    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertCircleIcon, {}),
    /* @__PURE__ */ jsxRuntime.jsx(AlertTitle, { children: title || "Something went wrong." }),
    /* @__PURE__ */ jsxRuntime.jsx(AlertDescription, { children: /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "list-inside list-disc text-sm", children: Array.from(new Set(errors)).map((error, index) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: error }, index)) }) })
  ] });
}
function ScrollArea({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    ScrollAreaPrimitive__namespace.Root,
    {
      "data-slot": "scroll-area",
      className: cn("relative", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          ScrollAreaPrimitive__namespace.Viewport,
          {
            "data-slot": "scroll-area-viewport",
            className: "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-1",
            children
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(ScrollBar, {}),
        /* @__PURE__ */ jsxRuntime.jsx(ScrollAreaPrimitive__namespace.Corner, {})
      ]
    }
  );
}
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    ScrollAreaPrimitive__namespace.ScrollAreaScrollbar,
    {
      "data-slot": "scroll-area-scrollbar",
      "data-orientation": orientation,
      orientation,
      className: cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        ScrollAreaPrimitive__namespace.ScrollAreaThumb,
        {
          "data-slot": "scroll-area-thumb",
          className: "relative flex-1 rounded-full bg-border"
        }
      )
    }
  );
}
function CodeBlock({
  code,
  label = "Code",
  maxHeightClassName = "max-h-56",
  enableHorizontalScroll = true,
  className
}) {
  const [copied, setCopied] = React6__namespace.useState(false);
  const copyResetTimeoutRef = React6__namespace.useRef(null);
  React6__namespace.useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current);
        copyResetTimeoutRef.current = null;
      }
    };
  }, []);
  const copy = React6__namespace.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    if (copyResetTimeoutRef.current) {
      window.clearTimeout(copyResetTimeoutRef.current);
    }
    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      copyResetTimeoutRef.current = null;
    }, 1200);
  }, [code]);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "relative rounded-md border border-border bg-slate-950 text-slate-100",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          Button,
          {
            type: "button",
            size: "icon-sm",
            variant: "ghost",
            className: "absolute top-2 right-2 z-10 grid place-items-center leading-none text-slate-100/90 hover:bg-white/10 hover:text-slate-100",
            onClick: copy,
            "aria-label": copied ? `Copied ${label}` : `Copy ${label}`,
            children: copied ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, {}) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CopyIcon, {})
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(ScrollArea, { className: cn("w-full", maxHeightClassName), children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "pre",
            {
              className: cn(
                "px-5 py-4 font-mono text-xs leading-relaxed",
                enableHorizontalScroll ? "whitespace-pre" : "whitespace-pre-wrap",
                !enableHorizontalScroll ? "wrap-break-word" : null
              ),
              children: /* @__PURE__ */ jsxRuntime.jsx("code", { children: code })
            }
          ),
          enableHorizontalScroll && /* @__PURE__ */ jsxRuntime.jsx(ScrollBar, { orientation: "horizontal" })
        ] })
      ]
    }
  );
}
function Container({
  className,
  style,
  size = "lg",
  ...rest
}) {
  const widths = size === "sm" ? "max-w-md" : size === "md" ? "max-w-3xl" : "max-w-6xl";
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "mx-auto w-full px-4 sm:px-6",
        widths,
        "text-slate-900 dark:text-slate-100",
        className
      ),
      style,
      ...rest
    }
  );
}
var gapMap = {
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8"
};
var alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch"
};
var justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between"
};
function Stack({
  className,
  style,
  direction = "col",
  gap = "md",
  align = "stretch",
  justify = "start",
  wrap = false,
  ...rest
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapMap[gap],
        alignMap[align],
        justifyMap[justify],
        wrap ? "flex-wrap" : "flex-nowrap",
        className
      ),
      style,
      ...rest
    }
  );
}
function Heading({ title, description, variant = "default" }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("header", { className: variant === "small" ? "" : "mb-8 space-y-0.5", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "h2",
      {
        className: variant === "small" ? "mb-0.5 text-base font-medium" : "font-display text-xl font-medium tracking-tight",
        children: title
      }
    ),
    description && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-muted-foreground", children: description })
  ] });
}
function InputError({ message, className = "", ...props }) {
  return message ? /* @__PURE__ */ jsxRuntime.jsx(
    "p",
    {
      ...props,
      className: cn("text-sm text-red-600 dark:text-red-400", className),
      children: message
    }
  ) : null;
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
function PasswordInput({ className, ref, ...props }) {
  const [showPassword, setShowPassword] = React6.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      Input,
      {
        type: showPassword ? "text" : "password",
        className: cn("pr-10", className),
        ref,
        ...props
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: () => setShowPassword((prev) => !prev),
        className: "absolute inset-y-0 right-0 flex items-center rounded-r-md px-3 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none",
        "aria-label": showPassword ? "Hide password" : "Show password",
        tabIndex: -1,
        children: showPassword ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Eye, { className: "size-4" })
      }
    )
  ] });
}
function Avatar({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    AvatarPrimitive__namespace.Root,
    {
      "data-slot": "avatar",
      className: cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      ),
      ...props
    }
  );
}
function AvatarImage({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    AvatarPrimitive__namespace.Image,
    {
      "data-slot": "avatar-image",
      className: cn("aspect-square size-full", className),
      ...props
    }
  );
}
function AvatarFallback({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    AvatarPrimitive__namespace.Fallback,
    {
      "data-slot": "avatar-fallback",
      className: cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
      ...props
    }
  );
}
var badgeVariants = classVarianceAuthority.cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "span";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "badge",
      className: cn(badgeVariants({ variant }), className),
      ...props
    }
  );
}
function Breadcrumb({ ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("nav", { "aria-label": "breadcrumb", "data-slot": "breadcrumb", ...props });
}
function BreadcrumbList({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "ol",
    {
      "data-slot": "breadcrumb-list",
      className: cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5",
        className
      ),
      ...props
    }
  );
}
function BreadcrumbItem({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "li",
    {
      "data-slot": "breadcrumb-item",
      className: cn("inline-flex items-center gap-1.5", className),
      ...props
    }
  );
}
function BreadcrumbLink({
  asChild,
  className,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "a";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "breadcrumb-link",
      className: cn("hover:text-foreground transition-colors", className),
      ...props
    }
  );
}
function BreadcrumbPage({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      "data-slot": "breadcrumb-page",
      role: "link",
      "aria-disabled": "true",
      "aria-current": "page",
      className: cn("text-foreground font-normal", className),
      ...props
    }
  );
}
function BreadcrumbSeparator({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "li",
    {
      "data-slot": "breadcrumb-separator",
      role: "presentation",
      "aria-hidden": "true",
      className: cn("[&>svg]:size-3.5", className),
      ...props,
      children: children ?? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, {})
    }
  );
}
function BreadcrumbEllipsis({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      "data-slot": "breadcrumb-ellipsis",
      role: "presentation",
      "aria-hidden": "true",
      className: cn("flex size-9 items-center justify-center", className),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.MoreHorizontal, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: "More" })
      ]
    }
  );
}
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    SeparatorPrimitive__namespace.Root,
    {
      "data-slot": "separator-root",
      decorative,
      orientation,
      className: cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      ),
      ...props
    }
  );
}
var buttonGroupVariants = classVarianceAuthority.cva(
  "group/button-group flex w-fit items-stretch *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-lg [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal: "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-lg!",
        vertical: "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-lg!"
      }
    },
    defaultVariants: {
      orientation: "horizontal"
    }
  }
);
function ButtonGroup({
  className,
  orientation,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "group",
      "data-slot": "button-group",
      "data-orientation": orientation,
      className: cn(buttonGroupVariants({ orientation }), className),
      ...props
    }
  );
}
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "div";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      className: cn(
        "flex items-center gap-2 rounded-lg border bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Separator,
    {
      "data-slot": "button-group-separator",
      orientation,
      className: cn(
        "relative self-stretch bg-input data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className
      ),
      ...props
    }
  );
}
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-lg border py-6",
        className
      ),
      ...props
    }
  );
}
function CardAction({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card-action",
      className: cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 rounded-t-xl px-6 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn("leading-none font-medium", className),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function CardFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "card-footer",
      className: cn("flex items-center px-6", className),
      ...props
    }
  );
}
var THEMES = { light: "", dark: ".dark" };
var INITIAL_DIMENSION = { width: 320, height: 200 };
var ChartContext = React6__namespace.createContext(null);
function useChart() {
  const context = React6__namespace.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}) {
  const uniqueId = React6__namespace.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;
  return /* @__PURE__ */ jsxRuntime.jsx(ChartContext.Provider, { value: { config }, children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "data-slot": "chart",
      "data-chart": chartId,
      className: cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(ChartStyle, { id: chartId, config }),
        /* @__PURE__ */ jsxRuntime.jsx(
          RechartsPrimitive__namespace.ResponsiveContainer,
          {
            initialDimension,
            children
          }
        )
      ]
    }
  ) });
}
var ChartStyle = ({ id, config }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config2]) => config2.theme ?? config2.color
  );
  if (!colorConfig.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "style",
    {
      dangerouslySetInnerHTML: {
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, itemConfig]) => {
            const color = itemConfig.theme?.[theme] ?? itemConfig.color;
            return color ? `  --color-${key}: ${color};` : null;
          }).join("\n")}
}
`
        ).join("\n")
      }
    }
  );
};
var ChartTooltip = RechartsPrimitive__namespace.Tooltip;
function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const { config } = useChart();
  const tooltipLabel = React6__namespace.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }
    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value = !labelKey && typeof label === "string" ? config[label]?.label ?? label : itemConfig?.label;
    if (labelFormatter) {
      return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("font-medium", labelClassName), children: labelFormatter(value, payload) });
    }
    if (!value) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("font-medium", labelClassName), children: value });
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey
  ]);
  if (!active || !payload?.length) {
    return null;
  }
  const nestLabel = payload.length === 1 && indicator !== "dot";
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      ),
      children: [
        !nestLabel ? tooltipLabel : null,
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid gap-1.5", children: payload.filter((item) => item.type !== "none").map((item, index) => {
          const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color ?? item.payload?.fill ?? item.color;
          return /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              ),
              children: formatter && item?.value !== void 0 && item.name ? formatter(item.value, item.name, item, index, item.payload) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                itemConfig?.icon ? /* @__PURE__ */ jsxRuntime.jsx(itemConfig.icon, {}) : !hideIndicator && /* @__PURE__ */ jsxRuntime.jsx(
                  "div",
                  {
                    className: cn(
                      "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                      {
                        "h-2.5 w-2.5": indicator === "dot",
                        "w-1": indicator === "line",
                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                        "my-0.5": nestLabel && indicator === "dashed"
                      }
                    ),
                    style: {
                      "--color-bg": indicatorColor,
                      "--color-border": indicatorColor
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsxs(
                  "div",
                  {
                    className: cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    ),
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid gap-1.5", children: [
                        nestLabel ? tooltipLabel : null,
                        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-muted-foreground", children: itemConfig?.label ?? item.name })
                      ] }),
                      item.value !== null && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono font-medium text-foreground tabular-nums", children: typeof item.value === "number" ? item.value.toLocaleString() : String(item.value) })
                    ]
                  }
                )
              ] })
            },
            index
          );
        }) })
      ]
    }
  );
}
var ChartLegend = RechartsPrimitive__namespace.Legend;
function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}) {
  const { config } = useChart();
  if (!payload?.length) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      ),
      children: payload.filter((item) => item.type !== "none").map((item, index) => {
        const key = `${nameKey ?? item.dataKey ?? "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            ),
            children: [
              itemConfig?.icon && !hideIcon ? /* @__PURE__ */ jsxRuntime.jsx(itemConfig.icon, {}) : /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: "h-2 w-2 shrink-0 rounded-[2px]",
                  style: {
                    backgroundColor: item.color
                  }
                }
              ),
              itemConfig?.label
            ]
          },
          index
        );
      })
    }
  );
}
function getPayloadConfigFromPayload(config, payload, key) {
  if (typeof payload !== "object" || payload === null) {
    return void 0;
  }
  const payloadPayload = "payload" in payload && typeof payload.payload === "object" && payload.payload !== null ? payload.payload : void 0;
  let configLabelKey = key;
  if (key in payload && typeof payload[key] === "string") {
    configLabelKey = payload[key];
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key] === "string") {
    configLabelKey = payloadPayload[key];
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}
function Checkbox({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    CheckboxPrimitive__namespace.Root,
    {
      "data-slot": "checkbox",
      className: cn(
        "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border transition-shadow outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        CheckboxPrimitive__namespace.Indicator,
        {
          "data-slot": "checkbox-indicator",
          className: "flex items-center justify-center text-current transition-none",
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, { className: "size-3.5" })
        }
      )
    }
  );
}
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Root, { "data-slot": "dialog", ...props });
}
function DialogTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Trigger, { "data-slot": "dialog-trigger", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogClose({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Close, { "data-slot": "dialog-close", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DialogPrimitive__namespace.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-slate-900/40 dark:bg-black/60",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsxRuntime.jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxRuntime.jsxs(
      DialogPrimitive__namespace.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border p-6 duration-200 sm:max-w-sm",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxRuntime.jsxs(DialogPrimitive__namespace.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.XIcon, {}),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DialogPrimitive__namespace.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-medium", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DialogPrimitive__namespace.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function DropdownMenu({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.Portal, { "data-slot": "dropdown-menu-portal", ...props });
}
function DropdownMenuTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Trigger,
    {
      "data-slot": "dropdown-menu-trigger",
      ...props
    }
  );
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Content,
    {
      "data-slot": "dropdown-menu-content",
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md",
        className
      ),
      ...props
    }
  ) });
}
function DropdownMenuGroup({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.Group, { "data-slot": "dropdown-menu-group", ...props });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    DropdownMenuPrimitive__namespace.CheckboxItem,
    {
      "data-slot": "dropdown-menu-checkbox-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      checked,
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.ItemIndicator, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, { className: "size-4" }) }) }),
        children
      ]
    }
  );
}
function DropdownMenuRadioGroup({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.RadioGroup,
    {
      "data-slot": "dropdown-menu-radio-group",
      ...props
    }
  );
}
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    DropdownMenuPrimitive__namespace.RadioItem,
    {
      "data-slot": "dropdown-menu-radio-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.ItemIndicator, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CircleIcon, { className: "size-2 fill-current" }) }) }),
        children
      ]
    }
  );
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Label,
    {
      "data-slot": "dropdown-menu-label",
      "data-inset": inset,
      className: cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.Separator,
    {
      "data-slot": "dropdown-menu-separator",
      className: cn("bg-border -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
function DropdownMenuShortcut({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      "data-slot": "dropdown-menu-shortcut",
      className: cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      ),
      ...props
    }
  );
}
function DropdownMenuSub({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DropdownMenuPrimitive__namespace.Sub, { "data-slot": "dropdown-menu-sub", ...props });
}
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    DropdownMenuPrimitive__namespace.SubTrigger,
    {
      "data-slot": "dropdown-menu-sub-trigger",
      "data-inset": inset,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRightIcon, { className: "ml-auto size-4" })
      ]
    }
  );
}
function DropdownMenuSubContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DropdownMenuPrimitive__namespace.SubContent,
    {
      "data-slot": "dropdown-menu-sub-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      ),
      ...props
    }
  );
}
function Label2({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    LabelPrimitive__namespace.Root,
    {
      "data-slot": "label",
      className: cn(
        "text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function FieldSet({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "fieldset",
    {
      "data-slot": "field-set",
      className: cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      ),
      ...props
    }
  );
}
function FieldLegend({
  className,
  variant = "legend",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "legend",
    {
      "data-slot": "field-legend",
      "data-variant": variant,
      className: cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className
      ),
      ...props
    }
  );
}
function FieldGroup({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "field-group",
      className: cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      ),
      ...props
    }
  );
}
var fieldVariants = classVarianceAuthority.cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal: "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive: "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
      }
    },
    defaultVariants: {
      orientation: "vertical"
    }
  }
);
function Field({
  className,
  orientation = "vertical",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "group",
      "data-slot": "field",
      "data-orientation": orientation,
      className: cn(fieldVariants({ orientation }), className),
      ...props
    }
  );
}
function FieldContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "field-content",
      className: cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className
      ),
      ...props
    }
  );
}
function FieldLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Label2,
    {
      "data-slot": "field-label",
      className: cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      ),
      ...props
    }
  );
}
function FieldTitle({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "field-label",
      className: cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled=true]/field:opacity-50",
        className
      ),
      ...props
    }
  );
}
function FieldDescription({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "p",
    {
      "data-slot": "field-description",
      className: cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      ),
      ...props
    }
  );
}
function FieldSeparator({
  children,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "data-slot": "field-separator",
      "data-content": !!children,
      className: cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(Separator, { className: "absolute inset-0 top-1/2" }),
        children && /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            className: "relative mx-auto block w-fit bg-background px-2 text-muted-foreground",
            "data-slot": "field-separator-content",
            children
          }
        )
      ]
    }
  );
}
function FieldError({
  className,
  children,
  errors,
  ...props
}) {
  const content = React6.useMemo(() => {
    if (children) {
      return children;
    }
    if (!errors?.length) {
      return null;
    }
    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values()
    ];
    if (uniqueErrors?.length === 1) {
      return uniqueErrors[0]?.message;
    }
    return /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "ml-4 flex list-disc flex-col gap-1", children: uniqueErrors.map(
      (error, index) => error?.message && /* @__PURE__ */ jsxRuntime.jsx("li", { children: error.message }, index)
    ) });
  }, [children, errors]);
  if (!content) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "alert",
      "data-slot": "field-error",
      className: cn("text-sm font-normal text-destructive", className),
      ...props,
      children: content
    }
  );
}
function Icon({ iconNode: IconComponent, className }) {
  if (!IconComponent) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(IconComponent, { className });
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      ),
      ...props
    }
  );
}
function InputGroup({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "input-group",
      role: "group",
      className: cn(
        "group/input-group relative flex h-8 w-full min-w-0 items-center rounded-lg border border-input transition-colors outline-none in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 has-disabled:bg-input/50 has-disabled:opacity-50 has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-ring has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-3 has-[[data-slot][aria-invalid=true]]:ring-destructive/20 has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto dark:bg-input/30 dark:has-disabled:bg-input/80 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pr-1.5 has-[>[data-align=inline-start]]:[&>input]:pl-1.5",
        className
      ),
      ...props
    }
  );
}
var inputGroupAddonVariants = classVarianceAuthority.cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start": "order-first pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem]",
        "inline-end": "order-last pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem]",
        "block-start": "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",
        "block-end": "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2"
      }
    },
    defaultVariants: {
      align: "inline-start"
    }
  }
);
function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "group",
      "data-slot": "input-group-addon",
      "data-align": align,
      className: cn(inputGroupAddonVariants({ align }), className),
      onClick: (e) => {
        if (e.target.closest("button")) {
          return;
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus();
      },
      ...props
    }
  );
}
var inputGroupButtonVariants = classVarianceAuthority.cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-3px)] px-1.5 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "",
        "icon-xs": "size-6 rounded-[calc(var(--radius)-3px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0"
      }
    },
    defaultVariants: {
      size: "xs"
    }
  }
);
function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Button,
    {
      type,
      "data-size": size,
      variant,
      className: cn(inputGroupButtonVariants({ size }), className),
      ...props
    }
  );
}
function InputGroupText({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: cn(
        "flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function InputGroupInput({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Input,
    {
      "data-slot": "input-group-control",
      className: cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className
      ),
      ...props
    }
  );
}
function InputGroupTextarea({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Textarea,
    {
      "data-slot": "input-group-control",
      className: cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0 dark:bg-transparent dark:disabled:bg-transparent",
        className
      ),
      ...props
    }
  );
}
var InputOTP = React6__namespace.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  inputOtp.OTPInput,
  {
    ref,
    containerClassName: cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    ),
    className: cn("disabled:cursor-not-allowed", className),
    ...props
  }
));
InputOTP.displayName = "InputOTP";
var InputOTPGroup = React6__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: cn("flex items-center", className), ...props }));
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = React6__namespace.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React6__namespace.useContext(inputOtp.OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref,
      className: cn(
        "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-1 ring-ring",
        className
      ),
      ...props,
      children: [
        char,
        hasFakeCaret && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pointer-events-none absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" }) })
      ]
    }
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = React6__namespace.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, role: "separator", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Minus, {}) }));
InputOTPSeparator.displayName = "InputOTPSeparator";
function ItemGroup({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      role: "list",
      "data-slot": "item-group",
      className: cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        className
      ),
      ...props
    }
  );
}
function ItemSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Separator,
    {
      "data-slot": "item-separator",
      orientation: "horizontal",
      className: cn("my-2", className),
      ...props
    }
  );
}
var itemVariants = classVarianceAuthority.cva(
  "group/item flex w-full flex-wrap items-center rounded-lg border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring [a]:transition-colors [a]:hover:bg-muted",
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50"
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Item2({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "div";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "item",
      "data-variant": variant,
      "data-size": size,
      className: cn(itemVariants({ variant, size, className })),
      ...props
    }
  );
}
var itemMediaVariants = classVarianceAuthority.cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image: "size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function ItemMedia({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "item-media",
      "data-variant": variant,
      className: cn(itemMediaVariants({ variant, className })),
      ...props
    }
  );
}
function ItemContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "item-content",
      className: cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className
      ),
      ...props
    }
  );
}
function ItemTitle({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "item-title",
      className: cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-sm leading-snug font-medium underline-offset-4",
        className
      ),
      ...props
    }
  );
}
function ItemDescription({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "p",
    {
      "data-slot": "item-description",
      className: cn(
        "line-clamp-2 text-left text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      ),
      ...props
    }
  );
}
function ItemActions({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "item-actions",
      className: cn("flex items-center gap-2", className),
      ...props
    }
  );
}
function ItemHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "item-header",
      className: cn(
        "flex basis-full items-center justify-between gap-2",
        className
      ),
      ...props
    }
  );
}
function ItemFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "item-footer",
      className: cn(
        "flex basis-full items-center justify-between gap-2",
        className
      ),
      ...props
    }
  );
}
function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    NavigationMenuPrimitive__namespace.Root,
    {
      "data-slot": "navigation-menu",
      "data-viewport": viewport,
      className: cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      ),
      ...props,
      children: [
        children,
        viewport && /* @__PURE__ */ jsxRuntime.jsx(NavigationMenuViewport, {})
      ]
    }
  );
}
function NavigationMenuList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    NavigationMenuPrimitive__namespace.List,
    {
      "data-slot": "navigation-menu-list",
      className: cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      ),
      ...props
    }
  );
}
function NavigationMenuItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    NavigationMenuPrimitive__namespace.Item,
    {
      "data-slot": "navigation-menu-item",
      className: cn("relative", className),
      ...props
    }
  );
}
var navigationMenuTriggerStyle = classVarianceAuthority.cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent/50 data-[state=open]:bg-accent/50 data-[active=true]:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1"
);
function NavigationMenuTrigger({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    NavigationMenuPrimitive__namespace.Trigger,
    {
      "data-slot": "navigation-menu-trigger",
      className: cn(navigationMenuTriggerStyle(), "group", className),
      ...props,
      children: [
        children,
        " ",
        /* @__PURE__ */ jsxRuntime.jsx(
          lucideReact.ChevronDownIcon,
          {
            className: "relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180",
            "aria-hidden": "true"
          }
        )
      ]
    }
  );
}
function NavigationMenuContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    NavigationMenuPrimitive__namespace.Content,
    {
      "data-slot": "navigation-menu-content",
      className: cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      ),
      ...props
    }
  );
}
function NavigationMenuViewport({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx(
        NavigationMenuPrimitive__namespace.Viewport,
        {
          "data-slot": "navigation-menu-viewport",
          className: cn(
            "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
            className
          ),
          ...props
        }
      )
    }
  );
}
function NavigationMenuLink({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    NavigationMenuPrimitive__namespace.Link,
    {
      "data-slot": "navigation-menu-link",
      className: cn(
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function NavigationMenuIndicator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    NavigationMenuPrimitive__namespace.Indicator,
    {
      "data-slot": "navigation-menu-indicator",
      className: cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" })
    }
  );
}
function PlaceholderPattern({ className }) {
  const patternId = React6.useId();
  return /* @__PURE__ */ jsxRuntime.jsxs("svg", { className, fill: "none", children: [
    /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("pattern", { id: patternId, x: "0", y: "0", width: "10", height: "10", patternUnits: "userSpaceOnUse", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M-3 13 15-5M-5 5l18-18M-1 21 17 3" }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx("rect", { stroke: "none", fill: `url(#${patternId})`, width: "100%", height: "100%" })
  ] });
}
function Popover({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Root, { "data-slot": "popover", ...props });
}
function PopoverTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Trigger, { "data-slot": "popover-trigger", ...props });
}
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
    PopoverPrimitive__namespace.Content,
    {
      "data-slot": "popover-content",
      align,
      sideOffset,
      className: cn(
        "z-50 flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
        className
      ),
      ...props
    }
  ) });
}
function PopoverAnchor({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Anchor, { "data-slot": "popover-anchor", ...props });
}
function PopoverHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "popover-header",
      className: cn("flex flex-col gap-0.5 text-sm", className),
      ...props
    }
  );
}
function PopoverTitle({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "popover-title",
      className: cn("font-medium", className),
      ...props
    }
  );
}
function PopoverDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "p",
    {
      "data-slot": "popover-description",
      className: cn("text-muted-foreground", className),
      ...props
    }
  );
}
function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    ProgressPrimitive__namespace.Root,
    {
      "data-slot": "progress",
      className: cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        ProgressPrimitive__namespace.Indicator,
        {
          "data-slot": "progress-indicator",
          className: "size-full flex-1 bg-primary transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}
function Select({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Root, { "data-slot": "select", ...props });
}
function SelectGroup({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Group, { "data-slot": "select-group", ...props });
}
function SelectValue({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Value, { "data-slot": "select-value", ...props });
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    SelectPrimitive__namespace.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-lg border bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Icon, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDownIcon, { className: "size-4 opacity-50" }) })
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  position = "popper",
  side = "bottom",
  sideOffset = 4,
  align = "center",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsxs(
    SelectPrimitive__namespace.Content,
    {
      "data-slot": "select-content",
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
        position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      ),
      position,
      side,
      sideOffset,
      avoidCollisions: false,
      align,
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(SelectScrollUpButton, {}),
        /* @__PURE__ */ jsxRuntime.jsx(
          SelectPrimitive__namespace.Viewport,
          {
            className: cn(
              "p-1",
              position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
            ),
            children
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(SelectScrollDownButton, {})
      ]
    }
  ) });
}
function SelectLabel({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    SelectPrimitive__namespace.Label,
    {
      "data-slot": "select-label",
      className: cn("text-muted-foreground px-2 py-1.5 text-xs", className),
      ...props
    }
  );
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    SelectPrimitive__namespace.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            "data-slot": "select-item-indicator",
            className: "absolute right-2 flex size-3.5 items-center justify-center",
            children: /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.ItemIndicator, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, { className: "size-4" }) })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.ItemText, { children })
      ]
    }
  );
}
function SelectSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    SelectPrimitive__namespace.Separator,
    {
      "data-slot": "select-separator",
      className: cn("bg-border pointer-events-none -mx-1 my-1 h-px", className),
      ...props
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    SelectPrimitive__namespace.ScrollUpButton,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUpIcon, { className: "size-4" })
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    SelectPrimitive__namespace.ScrollDownButton,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "flex cursor-default items-center justify-center py-1",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDownIcon, { className: "size-4" })
    }
  );
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Root, { "data-slot": "sheet", ...props });
}
function SheetTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Trigger, { "data-slot": "sheet-trigger", ...props });
}
function SheetClose({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Close, { "data-slot": "sheet-close", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DialogPrimitive__namespace.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxRuntime.jsxs(
      DialogPrimitive__namespace.Content,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxRuntime.jsxs(DialogPrimitive__namespace.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.XIcon, { className: "size-4" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("flex flex-col gap-1.5 p-4", className),
      ...props
    }
  );
}
function SheetFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sheet-footer",
      className: cn("mt-auto flex flex-col gap-2 p-4", className),
      ...props
    }
  );
}
function SheetTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DialogPrimitive__namespace.Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground font-medium", className),
      ...props
    }
  );
}
function SheetDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    DialogPrimitive__namespace.Description,
    {
      "data-slot": "sheet-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-primary/10 animate-pulse rounded-md", className),
      ...props
    }
  );
}
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TooltipPrimitive__namespace.Provider,
    {
      "data-slot": "tooltip-provider",
      delayDuration,
      ...props
    }
  );
}
function Tooltip2({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Root, { "data-slot": "tooltip", ...props });
}
function TooltipTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsxs(
    TooltipPrimitive__namespace.Content,
    {
      "data-slot": "tooltip-content",
      sideOffset,
      className: cn(
        "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-w-sm rounded-md px-3 py-1.5 text-xs",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Arrow, { className: "bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" })
      ]
    }
  ) });
}
var MOBILE_BREAKPOINT = 768;
var mql = typeof window === "undefined" ? void 0 : window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
function mediaQueryListener(callback) {
  if (!mql) {
    return () => {
    };
  }
  mql.addEventListener("change", callback);
  return () => {
    mql.removeEventListener("change", callback);
  };
}
function isSmallerThanBreakpoint() {
  return mql?.matches ?? false;
}
function getServerSnapshot() {
  return false;
}
function useIsMobile() {
  return React6.useSyncExternalStore(
    mediaQueryListener,
    isSmallerThanBreakpoint,
    getServerSnapshot
  );
}
var SIDEBAR_COOKIE_NAME = "sidebar_state";
var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
var SIDEBAR_WIDTH = "16rem";
var SIDEBAR_WIDTH_MOBILE = "18rem";
var SIDEBAR_WIDTH_ICON = "3rem";
var SIDEBAR_KEYBOARD_SHORTCUT = "b";
var SidebarContext = React6__namespace.createContext(null);
function useSidebar() {
  const context = React6__namespace.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React6__namespace.useState(false);
  const [_open, _setOpen] = React6__namespace.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React6__namespace.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React6__namespace.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React6__namespace.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React6__namespace.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      ),
      ...props,
      children
    }
  ) });
}
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        "data-slot": "sidebar",
        className: cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        ),
        ...props,
        children
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsxRuntime.jsxs(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(SheetHeader, { className: "sr-only", children: [
        /* @__PURE__ */ jsxRuntime.jsx(SheetTitle, { children: "Sidebar" }),
        /* @__PURE__ */ jsxRuntime.jsx(SheetDescription, { children: "Displays the mobile sidebar." })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        SheetContent,
        {
          "data-sidebar": "sidebar",
          "data-slot": "sidebar",
          "data-mobile": "true",
          className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
          style: {
            "--sidebar-width": SIDEBAR_WIDTH_MOBILE
          },
          side,
          children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-full w-full flex-col", children })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "group peer text-sidebar-foreground hidden md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn(
              "relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                className: "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
                children
              }
            )
          }
        )
      ]
    }
  );
}
function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar, isMobile, state } = useSidebar();
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Button,
    {
      "data-sidebar": "trigger",
      "data-slot": "sidebar-trigger",
      variant: "ghost",
      size: "icon",
      className: cn("h-7 w-7", className),
      onClick: (event) => {
        onClick?.(event);
        toggleSidebar();
      },
      ...props,
      children: [
        isMobile || state === "collapsed" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelLeftOpenIcon, {}) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PanelLeftCloseIcon, {}),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: "Toggle sidebar" })
      ]
    }
  );
}
function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      "data-sidebar": "rail",
      "data-slot": "sidebar-rail",
      "aria-label": "Toggle sidebar",
      tabIndex: -1,
      onClick: toggleSidebar,
      title: "Toggle sidebar",
      className: cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      ),
      ...props
    }
  );
}
function SidebarInset({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "main",
    {
      "data-slot": "sidebar-inset",
      className: cn(
        "bg-background relative flex max-w-full min-h-svh flex-1 flex-col",
        "peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0",
        className
      ),
      ...props
    }
  );
}
function SidebarInput({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Input,
    {
      "data-slot": "sidebar-input",
      "data-sidebar": "input",
      className: cn("bg-background h-8 w-full shadow-none", className),
      ...props
    }
  );
}
function SidebarHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-footer",
      "data-sidebar": "footer",
      className: cn("flex flex-col gap-2 p-2", className),
      ...props
    }
  );
}
function SidebarSeparator({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Separator,
    {
      "data-slot": "sidebar-separator",
      "data-sidebar": "separator",
      className: cn("bg-sidebar-border mx-2 w-auto", className),
      ...props
    }
  );
}
function SidebarContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-2", className),
      ...props
    }
  );
}
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "div";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "sidebar-group-label",
      "data-sidebar": "group-label",
      className: cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:select-none group-data-[collapsible=icon]:pointer-events-none",
        className
      ),
      ...props
    }
  );
}
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "button";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "sidebar-group-action",
      "data-sidebar": "group-action",
      className: cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarGroupContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  );
}
function SidebarMenu({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  );
}
function SidebarMenuItem({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  );
}
var sidebarMenuButtonVariants = classVarianceAuthority.cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      ...props
    }
  );
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(Tooltip2, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { asChild: true, children: button }),
    /* @__PURE__ */ jsxRuntime.jsx(
      TooltipContent,
      {
        side: "right",
        align: "center",
        hidden: state !== "collapsed" || isMobile,
        ...tooltip
      }
    )
  ] });
}
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "button";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-action",
      "data-sidebar": "menu-action",
      className: cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      ),
      ...props
    }
  );
}
function SidebarMenuBadge({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "sidebar-menu-badge",
      "data-sidebar": "menu-badge",
      className: cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}) {
  const [skeletonStyle] = React6__namespace.useState(() => ({
    "--skeleton-width": `${Math.floor(Math.random() * 40) + 50}%`
    // Random width between 50 to 90%.
  }));
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "data-slot": "sidebar-menu-skeleton",
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsxRuntime.jsx(
          Skeleton,
          {
            className: "size-4 rounded-md",
            "data-sidebar": "menu-skeleton-icon"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          Skeleton,
          {
            className: "h-4 max-w-(--skeleton-width) flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: skeletonStyle
          }
        )
      ]
    }
  );
}
function SidebarMenuSub({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "ul",
    {
      "data-slot": "sidebar-menu-sub",
      "data-sidebar": "menu-sub",
      className: cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarMenuSubItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "li",
    {
      "data-slot": "sidebar-menu-sub-item",
      "data-sidebar": "menu-sub-item",
      className: cn("group/menu-sub-item relative", className),
      ...props
    }
  );
}
function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? reactSlot.Slot : "a";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-sub-button",
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
}
function Toaster({ ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    sonner.Toaster,
    {
      className: "toaster group",
      position: "bottom-right",
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      },
      ...props
    }
  );
}
function Spinner({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    lucideReact.Loader2Icon,
    {
      role: "status",
      "aria-label": "Loading",
      className: cn("size-4 animate-spin", className),
      ...props
    }
  );
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableFooter({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "tfoot",
    {
      "data-slot": "table-footer",
      className: cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      ),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function TableCaption({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "caption",
    {
      "data-slot": "table-caption",
      className: cn("mt-4 text-sm text-muted-foreground", className),
      ...props
    }
  );
}
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TabsPrimitive__namespace.Root,
    {
      "data-slot": "tabs",
      "data-orientation": orientation,
      className: cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      ),
      ...props
    }
  );
}
var tabsListVariants = classVarianceAuthority.cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TabsPrimitive__namespace.List,
    {
      "data-slot": "tabs-list",
      "data-variant": variant,
      className: cn(tabsListVariants({ variant }), className),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TabsPrimitive__namespace.Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-lg border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TabsPrimitive__namespace.Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 text-sm outline-none", className),
      ...props
    }
  );
}
var toggleVariants = classVarianceAuthority.cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Toggle({
  className,
  variant,
  size,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    TogglePrimitive__namespace.Root,
    {
      "data-slot": "toggle",
      className: cn(toggleVariants({ variant, size, className })),
      ...props
    }
  );
}
var ToggleGroupContext = React6__namespace.createContext({
  size: "default",
  variant: "default"
});
function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    ToggleGroupPrimitive__namespace.Root,
    {
      "data-slot": "toggle-group",
      "data-variant": variant,
      "data-size": size,
      className: cn(
        "group/toggle-group flex items-center rounded-lg data-[variant=outline]:shadow-xs",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntime.jsx(ToggleGroupContext.Provider, { value: { variant, size }, children })
    }
  );
}
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}) {
  const context = React6__namespace.useContext(ToggleGroupContext);
  return /* @__PURE__ */ jsxRuntime.jsx(
    ToggleGroupPrimitive__namespace.Item,
    {
      "data-slot": "toggle-group-item",
      "data-variant": context.variant || variant,
      "data-size": context.size || size,
      className: cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size
        }),
        "min-w-0 shrink-0 rounded-none shadow-none first:rounded-l-lg last:rounded-r-lg focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className
      ),
      ...props,
      children
    }
  );
}

exports.Alert = Alert;
exports.AlertDescription = AlertDescription;
exports.AlertError = AlertError;
exports.AlertTitle = AlertTitle;
exports.AlertTriangleIcon = AlertTriangleIcon;
exports.ArrowRightIcon = ArrowRightIcon;
exports.Avatar = Avatar;
exports.AvatarFallback = AvatarFallback;
exports.AvatarImage = AvatarImage;
exports.Badge = Badge;
exports.BellIcon = BellIcon;
exports.Breadcrumb = Breadcrumb;
exports.BreadcrumbEllipsis = BreadcrumbEllipsis;
exports.BreadcrumbItem = BreadcrumbItem;
exports.BreadcrumbLink = BreadcrumbLink;
exports.BreadcrumbList = BreadcrumbList;
exports.BreadcrumbPage = BreadcrumbPage;
exports.BreadcrumbSeparator = BreadcrumbSeparator;
exports.Button = Button;
exports.ButtonGroup = ButtonGroup;
exports.ButtonGroupSeparator = ButtonGroupSeparator;
exports.ButtonGroupText = ButtonGroupText;
exports.Callout = Callout;
exports.Card = Card;
exports.CardAction = CardAction;
exports.CardContent = CardContent;
exports.CardDescription = CardDescription;
exports.CardFooter = CardFooter;
exports.CardHeader = CardHeader;
exports.CardTitle = CardTitle;
exports.ChartContainer = ChartContainer;
exports.ChartLegend = ChartLegend;
exports.ChartLegendContent = ChartLegendContent;
exports.ChartStyle = ChartStyle;
exports.ChartTooltip = ChartTooltip;
exports.ChartTooltipContent = ChartTooltipContent;
exports.CheckCircleIcon = CheckCircleIcon;
exports.CheckIcon = CheckIcon;
exports.Checkbox = Checkbox;
exports.ClockIcon = ClockIcon;
exports.CodeBlock = CodeBlock;
exports.Collapsible = Collapsible;
exports.CollapsibleChevron = CollapsibleChevron;
exports.CollapsibleContent = CollapsibleContent;
exports.CollapsibleTrigger = CollapsibleTrigger;
exports.Container = Container;
exports.Dialog = Dialog;
exports.DialogClose = DialogClose;
exports.DialogContent = DialogContent;
exports.DialogDescription = DialogDescription;
exports.DialogFooter = DialogFooter;
exports.DialogHeader = DialogHeader;
exports.DialogOverlay = DialogOverlay;
exports.DialogPortal = DialogPortal;
exports.DialogTitle = DialogTitle;
exports.DialogTrigger = DialogTrigger;
exports.DropdownMenu = DropdownMenu;
exports.DropdownMenuCheckboxItem = DropdownMenuCheckboxItem;
exports.DropdownMenuContent = DropdownMenuContent;
exports.DropdownMenuGroup = DropdownMenuGroup;
exports.DropdownMenuItem = DropdownMenuItem;
exports.DropdownMenuLabel = DropdownMenuLabel;
exports.DropdownMenuPortal = DropdownMenuPortal;
exports.DropdownMenuRadioGroup = DropdownMenuRadioGroup;
exports.DropdownMenuRadioItem = DropdownMenuRadioItem;
exports.DropdownMenuSeparator = DropdownMenuSeparator;
exports.DropdownMenuShortcut = DropdownMenuShortcut;
exports.DropdownMenuSub = DropdownMenuSub;
exports.DropdownMenuSubContent = DropdownMenuSubContent;
exports.DropdownMenuSubTrigger = DropdownMenuSubTrigger;
exports.DropdownMenuTrigger = DropdownMenuTrigger;
exports.EyeIcon = EyeIcon;
exports.Field = Field;
exports.FieldContent = FieldContent;
exports.FieldDescription = FieldDescription;
exports.FieldError = FieldError;
exports.FieldGroup = FieldGroup;
exports.FieldLabel = FieldLabel;
exports.FieldLegend = FieldLegend;
exports.FieldSeparator = FieldSeparator;
exports.FieldSet = FieldSet;
exports.FieldTitle = FieldTitle;
exports.FileTextIcon = FileTextIcon;
exports.GlobeIcon = GlobeIcon;
exports.Heading = Heading;
exports.Icon = Icon;
exports.ImagePlaceholderIcon = ImagePlaceholderIcon;
exports.InfoCircleIcon = InfoCircleIcon;
exports.Input = Input;
exports.InputError = InputError;
exports.InputGroup = InputGroup;
exports.InputGroupAddon = InputGroupAddon;
exports.InputGroupButton = InputGroupButton;
exports.InputGroupInput = InputGroupInput;
exports.InputGroupText = InputGroupText;
exports.InputGroupTextarea = InputGroupTextarea;
exports.InputOTP = InputOTP;
exports.InputOTPGroup = InputOTPGroup;
exports.InputOTPSeparator = InputOTPSeparator;
exports.InputOTPSlot = InputOTPSlot;
exports.Item = Item2;
exports.ItemActions = ItemActions;
exports.ItemContent = ItemContent;
exports.ItemDescription = ItemDescription;
exports.ItemFooter = ItemFooter;
exports.ItemGroup = ItemGroup;
exports.ItemHeader = ItemHeader;
exports.ItemMedia = ItemMedia;
exports.ItemSeparator = ItemSeparator;
exports.ItemTitle = ItemTitle;
exports.KeyboardIcon = KeyboardIcon;
exports.Label = Label2;
exports.LockIcon = LockIcon;
exports.MetricCard = MetricCard;
exports.MinusCircleIcon = MinusCircleIcon;
exports.NavigationMenu = NavigationMenu;
exports.NavigationMenuContent = NavigationMenuContent;
exports.NavigationMenuIndicator = NavigationMenuIndicator;
exports.NavigationMenuItem = NavigationMenuItem;
exports.NavigationMenuLink = NavigationMenuLink;
exports.NavigationMenuList = NavigationMenuList;
exports.NavigationMenuTrigger = NavigationMenuTrigger;
exports.NavigationMenuViewport = NavigationMenuViewport;
exports.PackageIcon = PackageIcon;
exports.PasswordInput = PasswordInput;
exports.PlaceholderPattern = PlaceholderPattern;
exports.Popover = Popover;
exports.PopoverAnchor = PopoverAnchor;
exports.PopoverContent = PopoverContent;
exports.PopoverDescription = PopoverDescription;
exports.PopoverHeader = PopoverHeader;
exports.PopoverTitle = PopoverTitle;
exports.PopoverTrigger = PopoverTrigger;
exports.Progress = Progress;
exports.ProgressBar = ProgressBar;
exports.ScrollArea = ScrollArea;
exports.ScrollBar = ScrollBar;
exports.SearchIcon = SearchIcon;
exports.Select = Select;
exports.SelectContent = SelectContent;
exports.SelectGroup = SelectGroup;
exports.SelectItem = SelectItem;
exports.SelectLabel = SelectLabel;
exports.SelectScrollDownButton = SelectScrollDownButton;
exports.SelectScrollUpButton = SelectScrollUpButton;
exports.SelectSeparator = SelectSeparator;
exports.SelectTrigger = SelectTrigger;
exports.SelectValue = SelectValue;
exports.Separator = Separator;
exports.SeverityBadge = SeverityBadge;
exports.Sheet = Sheet;
exports.SheetClose = SheetClose;
exports.SheetContent = SheetContent;
exports.SheetDescription = SheetDescription;
exports.SheetFooter = SheetFooter;
exports.SheetHeader = SheetHeader;
exports.SheetTitle = SheetTitle;
exports.SheetTrigger = SheetTrigger;
exports.Sidebar = Sidebar;
exports.SidebarContent = SidebarContent;
exports.SidebarFooter = SidebarFooter;
exports.SidebarGroup = SidebarGroup;
exports.SidebarGroupAction = SidebarGroupAction;
exports.SidebarGroupContent = SidebarGroupContent;
exports.SidebarGroupLabel = SidebarGroupLabel;
exports.SidebarHeader = SidebarHeader;
exports.SidebarInput = SidebarInput;
exports.SidebarInset = SidebarInset;
exports.SidebarMenu = SidebarMenu;
exports.SidebarMenuAction = SidebarMenuAction;
exports.SidebarMenuBadge = SidebarMenuBadge;
exports.SidebarMenuButton = SidebarMenuButton;
exports.SidebarMenuItem = SidebarMenuItem;
exports.SidebarMenuSkeleton = SidebarMenuSkeleton;
exports.SidebarMenuSub = SidebarMenuSub;
exports.SidebarMenuSubButton = SidebarMenuSubButton;
exports.SidebarMenuSubItem = SidebarMenuSubItem;
exports.SidebarProvider = SidebarProvider;
exports.SidebarRail = SidebarRail;
exports.SidebarSeparator = SidebarSeparator;
exports.SidebarTrigger = SidebarTrigger;
exports.Skeleton = Skeleton;
exports.SlidersIcon = SlidersIcon;
exports.Spinner = Spinner;
exports.SpinnerIcon = SpinnerIcon;
exports.Stack = Stack;
exports.StatPair = StatPair;
exports.StatusBadge = StatusBadge;
exports.Table = Table;
exports.TableBody = TableBody;
exports.TableCaption = TableCaption;
exports.TableCell = TableCell;
exports.TableFooter = TableFooter;
exports.TableHead = TableHead;
exports.TableHeader = TableHeader;
exports.TableRow = TableRow;
exports.Tabs = Tabs;
exports.TabsContent = TabsContent;
exports.TabsList = TabsList;
exports.TabsTrigger = TabsTrigger;
exports.Textarea = Textarea;
exports.Toaster = Toaster;
exports.Toggle = Toggle;
exports.ToggleGroup = ToggleGroup;
exports.ToggleGroupItem = ToggleGroupItem;
exports.Tooltip = Tooltip2;
exports.TooltipContent = TooltipContent;
exports.TooltipProvider = TooltipProvider;
exports.TooltipTrigger = TooltipTrigger;
exports.UsersIcon = UsersIcon;
exports.XCircleIcon = XCircleIcon;
exports.ZapIcon = ZapIcon;
exports.badgeVariants = badgeVariants;
exports.buttonGroupVariants = buttonGroupVariants;
exports.buttonVariants = buttonVariants;
exports.calloutVariants = calloutVariants;
exports.cn = cn;
exports.metricCardVariants = metricCardVariants;
exports.navigationMenuTriggerStyle = navigationMenuTriggerStyle;
exports.severityBadgeVariants = severityBadgeVariants;
exports.statusBadgeVariants = statusBadgeVariants;
exports.tabsListVariants = tabsListVariants;
exports.toggleVariants = toggleVariants;
exports.useIsMobile = useIsMobile;
exports.useSidebar = useSidebar;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map