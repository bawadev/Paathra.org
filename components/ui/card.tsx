import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {
  cardVariants,
  cardHeaderVariants,
  cardContentVariants,
  cardFooterVariants,
  type CardVariantProps
} from "@/lib/design-system/components/variants/card"

export interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {}

function Card({
  className,
  variant,
  size,
  padding,
  animation,
  cultural,
  context,
  orientation,
  radius,
  accessibility,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({
        variant,
        size,
        padding,
        animation,
        cultural,
        context,
        orientation,
        radius,
        accessibility,
        className
      }))}
      {...props}
    />
  )
}

export interface CardHeaderProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardHeaderVariants> {}

function CardHeader({
  className,
  spacing,
  border,
  ...props
}: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ spacing, border, className }))}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-h3 leading-tight font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-caption", className)}
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

export interface CardContentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardContentVariants> {}

function CardContent({
  className,
  spacing,
  ...props
}: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ spacing, className }))}
      {...props}
    />
  )
}

export interface CardFooterProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardFooterVariants> {}

function CardFooter({
  className,
  spacing,
  border,
  justify,
  ...props
}: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ spacing, border, justify, className }))}
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
