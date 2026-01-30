"use client"

import { useMemo } from "react"
import DOMPurify from "dompurify"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ContractPreviewProps {
  content: string
  className?: string
}

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td", "hr",
  "span", "div", "mark", "img", "blockquote", "pre", "code"
]

const ALLOWED_ATTR = [
  "style", "class", "src", "alt", "colspan", "rowspan", "width", "height"
]

export function ContractPreview({ content, className }: ContractPreviewProps) {
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "button"],
      FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
    })
  }, [content])

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
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </ScrollArea>
    </div>
  )
}
