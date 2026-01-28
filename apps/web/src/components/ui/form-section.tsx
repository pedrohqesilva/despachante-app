import { cn } from "@/lib/utils"

interface FormSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
