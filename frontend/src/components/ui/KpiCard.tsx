import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  caption?: string
  status?: "default" | "success" | "warning" | "danger"
  actionLabel?: string
  actionHref?: string
}

const statusColors = {
  default: "var(--color-capo-line)",
  success: "var(--color-capo-accent)",
  warning: "var(--color-capo-gold)",
  danger: "var(--color-capo-danger)",
}

export function KpiCard({
  title,
  value,
  caption,
  status = "default",
  actionLabel,
  actionHref,
  className,
  ...props
}: KpiCardProps) {
  const borderColor = statusColors[status]

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between rounded-panel bg-capo-panel p-4 border border-capo-line shadow-sm overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Stitching effect at the top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-70"
        style={{
          backgroundImage: `linear-gradient(to right, ${borderColor} 50%, transparent 50%)`,
          backgroundSize: '12px 100%',
        }}
      />
      
      <div className="pt-2">
        <p className="text-[11px] md:text-[11.5px] font-medium text-capo-ink-soft uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="font-oswald text-[24px] md:text-[32px] font-semibold text-capo-ink leading-tight">
          {value}
        </h3>
        {caption && (
          <p className="text-[10.5px] md:text-[11.5px] text-capo-ink-soft mt-1">
            {caption}
          </p>
        )}
      </div>

      {actionLabel && actionHref && (
        <div className="mt-4 pt-3 border-t border-capo-line/50">
          <Button variant="link" size="sm" className="h-auto p-0 text-capo-navy font-medium" asChild>
            <Link href={actionHref}>
              {actionLabel} <ChevronRight className="ml-1 w-3 h-3" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
