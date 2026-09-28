import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative flex flex-col w-full", className)}
        {...props}
      />
    )
  }
)
InputGroup.displayName = "InputGroup"

const InputGroupInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-neutral/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-neutral/50 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputGroupInput.displayName = "InputGroupInput"

const InputGroupAddon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: "inline-end" | "inline-start" }>(
  ({ className, align = "inline-end", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("absolute inset-y-0 flex items-center", align === "inline-end" ? "right-0" : "left-0", className)}
        {...props}
      />
    )
  }
)
InputGroupAddon.displayName = "InputGroupAddon"

const InputGroupText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      />
    )
  }
)
InputGroupText.displayName = "InputGroupText"

export { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText }
