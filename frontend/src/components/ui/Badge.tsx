import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-badge px-2.5 py-0.5 text-[10.5px] md:text-[11.5px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-capo-line/20 text-capo-ink",
        success:
          "bg-capo-accent/10 text-capo-accent",
        warning:
          "bg-capo-gold/10 text-capo-gold",
        danger:
          "bg-capo-danger/10 text-capo-danger",
        neutral:
          "bg-capo-line/20 text-capo-ink-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const dotVariants = cva("w-1.5 h-1.5 rounded-full", {
  variants: {
    variant: {
      default: "bg-capo-ink",
      success: "bg-capo-accent",
      warning: "bg-capo-gold",
      danger: "bg-capo-danger",
      neutral: "bg-capo-ink-soft",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      <div className={cn(dotVariants({ variant }))} />
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
