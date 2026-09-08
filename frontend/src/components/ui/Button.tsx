import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-badge text-[12.5px] md:text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-capo-accent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-capo-navy text-white hover:bg-capo-navy/90 shadow-sm",
        secondary:
          "bg-capo-panel border border-capo-line text-capo-ink hover:bg-capo-bg shadow-sm",
        accent:
          "bg-capo-accent text-white hover:bg-capo-accent/90 shadow-sm",
        danger:
          "bg-capo-danger text-white hover:bg-capo-danger/90 shadow-sm", // Only for real problems
        success:
          "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        primary:
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        outline:
          "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100",
        ghost: "hover:bg-capo-line/20 text-capo-ink",
        link: "text-capo-navy underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-badge px-3 text-[11.5px]",
        lg: "h-10 rounded-badge px-8 text-[14px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
