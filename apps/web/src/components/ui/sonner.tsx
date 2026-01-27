import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  
  // Converter theme para formato esperado pelo sonner
  const sonnerTheme = theme === "system" 
    ? "system" 
    : theme === "dark" 
    ? "dark" 
    : "light"

  return (
    <Sonner
      theme={sonnerTheme as ToasterProps["theme"]}
      position="bottom-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "!min-w-[400px]",
          error: "!bg-destructive !text-destructive-foreground !border-destructive !text-base",
          success: "!bg-green-600 !text-white !border-green-600 !text-base",
          info: "!text-base",
          warning: "!text-base",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
