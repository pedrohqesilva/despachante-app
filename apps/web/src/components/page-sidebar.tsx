import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarSection<T extends string = string> {
  id: T
  label: string
  icon: LucideIcon
  description?: string
  alert?: React.ReactNode
}

interface PageSidebarProps<T extends string> {
  sections: SidebarSection<T>[]
  activeSection: T
  onSectionChange: (section: T) => void
  className?: string
}

export function PageSidebar<T extends string>({
  sections,
  activeSection,
  onSectionChange,
  className,
}: PageSidebarProps<T>) {
  return (
    <aside className={cn("w-sidebar border-r border-border/50 shrink-0", className)}>
      <nav className="p-4 space-y-1">
        {sections.map(({ id, label, icon: Icon, alert }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border",
              activeSection === id
                ? "bg-primary/10 text-primary border-primary/20"
                : "text-text-tertiary hover:text-text-primary hover:bg-accent border-transparent"
            )}
          >
            <Icon className={cn(
              "size-icon-sm",
              activeSection === id ? "text-primary" : "text-text-disabled"
            )} />
            {label}
            {alert && <span className="ml-auto">{alert}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
