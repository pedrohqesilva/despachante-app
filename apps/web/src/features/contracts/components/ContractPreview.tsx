"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ContractPreviewProps {
  content: string
  className?: string
}

export function ContractPreview({ content, className }: ContractPreviewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background overflow-hidden",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
        <h4 className="text-sm font-medium text-muted-foreground">
          Visualizacao do Contrato
        </h4>
      </div>
      <ScrollArea className="h-[400px]">
        <div
          className="prose prose-sm max-w-none p-6"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </ScrollArea>
    </div>
  )
}
