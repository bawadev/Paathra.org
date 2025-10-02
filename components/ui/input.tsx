import * as React from "react"

import { cn } from "@/lib/utils"
import { inputVariants, type InputVariantProps } from "@/lib/design-system"

interface InputProps extends React.ComponentProps<"input">, InputVariantProps {}

function Input({
  className,
  type,
  variant,
  size,
  cultural,
  inputType,
  focusIntensity,
  animation,
  borderStyle,
  accessibility,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputVariants({
          variant,
          size,
          cultural,
          inputType: inputType || (type as any),
          focusIntensity,
          animation,
          borderStyle,
          accessibility,
        }),
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "selection:bg-primary selection:text-primary-foreground",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
