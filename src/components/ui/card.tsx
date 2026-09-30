import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden rounded-lg bg-card text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
  {
    variants: {
      variant: {
        default:
          "shadow-sm [&>[data-slot=card-header]]:m-1.5 [&>[data-slot=card-header]]:rounded-lg [&>[data-slot=card-header]]:px-3 [&>[data-slot=card-header]]:py-2.5",
        highlight:
          "relative animate-rainbow border-[1.5px] border-transparent rainbow-outline-bg-new shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 " +
          "[&>[data-slot=card-header]]:m-1.5 [&>[data-slot=card-header]]:rounded-lg [&>[data-slot=card-header]]:px-3 [&>[data-slot=card-header]]:py-2.5 " +
          "before:absolute before:bottom-[-10%] before:left-1/2 before:-z-10 before:h-1/5 before:w-4/5 before:-translate-x-1/2 before:animate-rainbow before:rainbow-before-bg before:blur-2xl before:opacity-50 before:content-['']",
      },
      color: {
        default:
          "[&>[data-slot=card-header]]:bg-secondary/30 dark:[&>[data-slot=card-header]]:bg-secondary/20",
        success:
          "[&>[data-slot=card-header]]:bg-success/30 dark:[&>[data-slot=card-header]]:bg-success/20 [&_svg]:text-success",
        warning:
          "[&>[data-slot=card-header]]:bg-warning/30 dark:[&>[data-slot=card-header]]:bg-warning/20 [&_svg]:text-warning",
        destructive:
          "[&>[data-slot=card-header]]:bg-destructive/30 dark:[&>[data-slot=card-header]]:bg-destructive/20 [&_svg]:text-destructive",
        info:
          "[&>[data-slot=card-header]]:bg-info/30 dark:[&>[data-slot=card-header]]:bg-info/20 [&_svg]:text-info",
        primary:
          "[&>[data-slot=card-header]]:bg-primary/30 dark:[&>[data-slot=card-header]]:bg-primary/20 [&_svg]:text-primary",
      },
      size: {
        default: "",
        sm: "",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
      size: "default",
    },
  }
)

export interface CardProps
  extends Omit<React.ComponentProps<"div">, "color">,
  VariantProps<typeof cardVariants> { }

function Card({ className, variant, color, size, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, color, size }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg p-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing) pb-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
