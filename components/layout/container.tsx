import * as React from "react"
import { cn } from "@/lib/utils"

export const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
      className
    )}
    {...props}
  />
))
Container.displayName = "Container"

export const Section = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("py-16 md:py-24", className)}
    {...props}
  />
))
Section.displayName = "Section"
