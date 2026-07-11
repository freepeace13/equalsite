import { CheckIcon, CopyIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '../atoms/button';
import { ScrollArea, ScrollBar } from '../atoms/scroll-area';
import { cn } from '../../lib/utils';

export interface CodeBlockProps {
  code: string;
  label?: string;
  maxHeightClassName?: string;
  enableHorizontalScroll?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  label = "Code",
  maxHeightClassName = "max-h-56",
  enableHorizontalScroll = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const copyResetTimeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        window.clearTimeout(copyResetTimeoutRef.current)
        copyResetTimeoutRef.current = null
      }
    }
  }, [])

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = code
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      textarea.style.top = "0"
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    setCopied(true)

    if (copyResetTimeoutRef.current) {
      window.clearTimeout(copyResetTimeoutRef.current)
    }

    copyResetTimeoutRef.current = window.setTimeout(() => {
      setCopied(false)
      copyResetTimeoutRef.current = null
    }, 1200)
  }, [code])

  return (
    <div
      className={cn(
        "relative rounded-md border border-border bg-slate-950 text-slate-100",
        className,
      )}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        className="absolute top-2 right-2 z-10 grid place-items-center leading-none text-slate-100/90 hover:bg-white/10 hover:text-slate-100"
        onClick={copy}
        aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </Button>

      <ScrollArea className={cn("w-full", maxHeightClassName)}>
        <pre
          className={cn(
            "px-5 py-4 font-mono text-xs leading-relaxed",
            enableHorizontalScroll ? "whitespace-pre" : "whitespace-pre-wrap",
            !enableHorizontalScroll ? "wrap-break-word" : null,
          )}
        >
          <code>{code}</code>
        </pre>
        {enableHorizontalScroll && <ScrollBar orientation="horizontal" />}
      </ScrollArea>
    </div>
  )
}
