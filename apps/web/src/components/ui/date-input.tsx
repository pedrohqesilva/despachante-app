import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface DateInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  className?: string
}

function DateInput({ className, ...props }: DateInputProps) {
  return (
    <div className="relative">
      <Input
        type="date"
        className={cn(
          "pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          className
        )}
        {...props}
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}

export { DateInput }
