import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-8 text-center", className)} 
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-capo-line/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-capo-ink-soft" />
      </div>
      <h3 className="font-oswald text-lg font-medium text-capo-ink mb-1">{title}</h3>
      <p className="text-[12.5px] text-capo-ink-soft max-w-sm mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
