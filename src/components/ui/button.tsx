import * as React from "react"
import { cn } from "@/src/lib/utils"

const buttonVariants = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const variants = {
  default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
  destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
  outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-100",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-800/80",
  ghost: "hover:bg-slate-800 hover:text-slate-100 text-slate-300",
  link: "text-indigo-400 underline-offset-4 hover:underline",
}

const sizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8 text-base",
  icon: "h-10 w-10",
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
