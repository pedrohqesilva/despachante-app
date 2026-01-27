import { useState } from "react"
import {
  Palette,
  Type,
  CheckCircle,
  Square,
  Layout,
  Component,
  Users,
  Bell,
  Shield,
  Settings,
  ChevronRight,
  Key,
  Sun,
  Moon,
  Monitor,
  Check,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { StatusBadge, StatusType } from "@/components/ui/status-badge"
import { IconContainer, IconContainerSize } from "@/components/ui/icon-container"
import { cn } from "@/lib/utils"

type Section = "colors" | "status" | "typography" | "icons" | "layout" | "spacing" | "components"

const sections = [
  { id: "colors" as Section, label: "Cores", icon: Palette },
  { id: "status" as Section, label: "Status", icon: CheckCircle },
  { id: "typography" as Section, label: "Tipografia", icon: Type },
  { id: "icons" as Section, label: "Ícones", icon: Square },
  { id: "spacing" as Section, label: "Espaçamento", icon: Layout },
  { id: "layout" as Section, label: "Layout", icon: Layout },
  { id: "components" as Section, label: "Componentes", icon: Component },
]

function ColorSwatch({
  name,
  variable,
  className
}: {
  name: string
  variable: string
  className: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("size-12 rounded-lg border border-border shadow-sm", className)} />
      <div>
        <p className="font-medium text-text-primary">{name}</p>
        <p className="text-sm text-text-muted font-mono">{variable}</p>
      </div>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted/50 border border-border rounded-lg p-4 text-sm font-mono overflow-x-auto">
      <code>{children}</code>
    </pre>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-text-primary mb-4">{children}</h2>
  )
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-medium text-text-primary mb-3">{children}</h3>
  )
}

export default function StyleGuide() {
  const [activeSection, setActiveSection] = useState<Section>("colors")

  const renderSection = () => {
    switch (activeSection) {
      case "colors":
        return <ColorsSection />
      case "status":
        return <StatusSection />
      case "typography":
        return <TypographySection />
      case "icons":
        return <IconsSection />
      case "spacing":
        return <SpacingSection />
      case "layout":
        return <LayoutSection />
      case "components":
        return <ComponentsSection />
      default:
        return null
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b backdrop-blur">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Style Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documentação do design system e referência de componentes.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-sidebar border-r border-border/50 shrink-0">
          <nav className="p-4 space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  activeSection === id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-text-tertiary hover:text-text-primary hover:bg-accent"
                )}
              >
                <Icon className={cn(
                  "size-icon-sm",
                  activeSection === id ? "text-primary" : "text-text-disabled"
                )} />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-content-max mx-auto p-8 space-y-8">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  )
}

function ColorsSection() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Cores do Sistema</SectionTitle>
        <p className="text-text-secondary mb-6">
          Todas as cores utilizam o sistema OKLch para garantir consistência e acessibilidade.
        </p>
      </div>

      {/* Base Colors */}
      <div>
        <SubsectionTitle>Cores Base</SubsectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <ColorSwatch name="Background" variable="--background" className="bg-background" />
          <ColorSwatch name="Foreground" variable="--foreground" className="bg-foreground" />
          <ColorSwatch name="Primary" variable="--primary" className="bg-primary" />
          <ColorSwatch name="Secondary" variable="--secondary" className="bg-secondary" />
          <ColorSwatch name="Muted" variable="--muted" className="bg-muted" />
          <ColorSwatch name="Accent" variable="--accent" className="bg-accent" />
          <ColorSwatch name="Destructive" variable="--destructive" className="bg-destructive" />
          <ColorSwatch name="Border" variable="--border" className="bg-border" />
        </div>
      </div>

      {/* Status Colors */}
      <div>
        <SubsectionTitle>Cores de Status</SubsectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <ColorSwatch name="Success" variable="--status-success" className="bg-status-success" />
          <ColorSwatch name="Warning" variable="--status-warning" className="bg-status-warning" />
          <ColorSwatch name="Error" variable="--status-error" className="bg-status-error" />
          <ColorSwatch name="Neutral" variable="--status-neutral" className="bg-status-neutral" />
          <ColorSwatch name="Info" variable="--status-info" className="bg-status-info" />
        </div>
      </div>

      {/* Usage Example */}
      <div>
        <SubsectionTitle>Uso em Tailwind</SubsectionTitle>
        <CodeBlock>{`// Cores de status
className="bg-status-success"
className="text-status-success-foreground"
className="bg-status-success-muted"
className="border-status-success-border"

// Hierarquia de texto
className="text-text-primary"
className="text-text-secondary"
className="text-text-tertiary"
className="text-text-muted"`}</CodeBlock>
      </div>
    </div>
  )
}

function StatusSection() {
  const statuses: { status: StatusType; label: string; description: string }[] = [
    { status: "success", label: "Ativo", description: "Indica estado ativo ou sucesso" },
    { status: "warning", label: "Pendente", description: "Indica estado pendente ou atenção necessária" },
    { status: "error", label: "Erro", description: "Indica erro ou problema" },
    { status: "neutral", label: "Inativo", description: "Indica estado inativo ou desabilitado" },
    { status: "info", label: "Informação", description: "Indica informação adicional" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Badges de Status</SectionTitle>
        <p className="text-text-secondary mb-6">
          Use o componente StatusBadge para indicar estados de forma consistente.
        </p>
      </div>

      {/* Status Badges */}
      <div className="space-y-3">
        {statuses.map(({ status, label, description }) => (
          <div key={status} className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
            <StatusBadge status={status}>{label}</StatusBadge>
            <span className="flex-1 text-text-secondary">{description}</span>
            <code className="text-sm font-mono text-text-muted shrink-0">status="{status}"</code>
          </div>
        ))}
      </div>

      {/* Usage Example */}
      <div>
        <SubsectionTitle>Uso do Componente</SubsectionTitle>
        <CodeBlock>{`import { StatusBadge } from "@/components/ui/status-badge"

// Exemplos de uso
<StatusBadge status="success">Ativo</StatusBadge>
<StatusBadge status="warning">Pendente</StatusBadge>
<StatusBadge status="error">Erro</StatusBadge>
<StatusBadge status="neutral">Inativo</StatusBadge>
<StatusBadge status="info">Info</StatusBadge>`}</CodeBlock>
      </div>
    </div>
  )
}

function TypographySection() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Hierarquia de Texto</SectionTitle>
        <p className="text-text-secondary mb-6">
          Use tokens semânticos para manter consistência na hierarquia visual do texto.
        </p>
      </div>

      {/* Text Hierarchy */}
      <div className="space-y-3">
        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-semibold text-lg">Text Primary</p>
            <p className="text-text-muted text-sm">Usado para títulos e texto principal</p>
          </div>
          <code className="text-xs font-mono text-text-disabled shrink-0">text-text-primary</code>
        </div>

        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
          <div className="flex-1 min-w-0">
            <p className="text-text-secondary text-lg">Text Secondary</p>
            <p className="text-text-muted text-sm">Usado para texto de suporte e descrições</p>
          </div>
          <code className="text-xs font-mono text-text-disabled shrink-0">text-text-secondary</code>
        </div>

        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
          <div className="flex-1 min-w-0">
            <p className="text-text-tertiary text-lg">Text Tertiary</p>
            <p className="text-text-muted text-sm">Usado para informações menos importantes</p>
          </div>
          <code className="text-xs font-mono text-text-disabled shrink-0">text-text-tertiary</code>
        </div>

        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
          <div className="flex-1 min-w-0">
            <p className="text-text-muted text-lg">Text Muted</p>
            <p className="text-text-muted text-sm">Usado para placeholders e texto auxiliar</p>
          </div>
          <code className="text-xs font-mono text-text-disabled shrink-0">text-text-muted</code>
        </div>

        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
          <div className="flex-1 min-w-0">
            <p className="text-text-disabled text-lg">Text Disabled</p>
            <p className="text-text-muted text-sm">Usado para elementos desabilitados</p>
          </div>
          <code className="text-xs font-mono text-text-disabled shrink-0">text-text-disabled</code>
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <SubsectionTitle>Pesos de Fonte</SubsectionTitle>
        <div className="space-y-3">
          <p className="font-normal">font-normal (400) - Texto regular</p>
          <p className="font-medium">font-medium (500) - Texto de destaque</p>
          <p className="font-semibold">font-semibold (600) - Títulos e labels</p>
          <p className="font-bold">font-bold (700) - Destaque máximo</p>
        </div>
      </div>
    </div>
  )
}

function IconsSection() {
  const sizes: IconContainerSize[] = ["sm", "md", "lg"]
  const sizeLabels: Record<IconContainerSize, string> = {
    sm: "Small (28px)",
    md: "Medium (44px)",
    lg: "Large (64px)",
  }

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Containers de Ícone</SectionTitle>
        <p className="text-text-secondary mb-6">
          Use o componente IconContainer para manter consistência nos tamanhos de ícones.
        </p>
      </div>

      {/* Icon Sizes */}
      <div>
        <SubsectionTitle>Tamanhos</SubsectionTitle>
        <div className="flex items-end gap-6">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <IconContainer size={size} icon={Users} />
              <span className="text-sm text-text-muted">{sizeLabels[size]}</span>
              <code className="text-xs font-mono text-text-disabled">size="{size}"</code>
            </div>
          ))}
        </div>
      </div>

      {/* Icon Variants */}
      <div>
        <SubsectionTitle>Variantes</SubsectionTitle>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <IconContainer size="md" icon={Bell} variant="default" />
            <span className="text-sm text-text-muted">Default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <IconContainer size="md" icon={Shield} variant="primary" />
            <span className="text-sm text-text-muted">Primary</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <IconContainer size="md" icon={Settings} variant="muted" />
            <span className="text-sm text-text-muted">Muted</span>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div>
        <SubsectionTitle>Uso do Componente</SubsectionTitle>
        <CodeBlock>{`import { IconContainer } from "@/components/ui/icon-container"
import { Users, Bell, Shield } from "lucide-react"

// Tamanhos
<IconContainer size="sm" icon={Users} />
<IconContainer size="md" icon={Users} />
<IconContainer size="lg" icon={Users} />

// Variantes
<IconContainer icon={Bell} variant="default" />
<IconContainer icon={Shield} variant="primary" />
<IconContainer icon={Settings} variant="muted" />`}</CodeBlock>
      </div>

      {/* CSS Variables */}
      <div>
        <SubsectionTitle>Tokens de Tamanho</SubsectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-card rounded-xl bg-accent/50">
            <code className="text-sm font-mono">size-icon-sm: 1rem (16px)</code>
          </div>
          <div className="p-card rounded-xl bg-accent/50">
            <code className="text-sm font-mono">size-icon-md: 1.25rem (20px)</code>
          </div>
          <div className="p-card rounded-xl bg-accent/50">
            <code className="text-sm font-mono">size-icon-lg: 2rem (32px)</code>
          </div>
          <div className="p-card rounded-xl bg-accent/50">
            <code className="text-sm font-mono">size-icon-container-sm: 1.75rem (28px)</code>
          </div>
          <div className="p-card rounded-xl bg-accent/50">
            <code className="text-sm font-mono">size-icon-container-md: 2.75rem (44px)</code>
          </div>
          <div className="p-card rounded-xl bg-accent/50">
            <code className="text-sm font-mono">size-icon-container-lg: 4rem (64px)</code>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpacingSection() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Tokens de Espaçamento</SectionTitle>
        <p className="text-text-secondary mb-6">
          Use tokens semânticos para espaçamentos consistentes. NUNCA use magic numbers como p-4, p-5, gap-4.
        </p>
      </div>

      {/* Spacing Tokens */}
      <div>
        <SubsectionTitle>Padding de Cards</SubsectionTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">p-card</p>
              <p className="text-sm text-muted-foreground">Padding padrão para cards (1.25rem / 20px)</p>
            </div>
            <code className="text-sm font-mono text-text-muted shrink-0">--spacing-card</code>
          </div>
          <div className="flex items-center gap-gap p-card-sm min-h-card rounded-xl bg-accent/50 border border-transparent">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">p-card-sm</p>
              <p className="text-sm text-muted-foreground">Padding compacto para cards (1rem / 16px)</p>
            </div>
            <code className="text-sm font-mono text-text-muted shrink-0">--spacing-card-sm</code>
          </div>
          <div className="flex items-center gap-gap p-card-lg min-h-card rounded-xl bg-accent/50 border border-transparent">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">p-card-lg</p>
              <p className="text-sm text-muted-foreground">Padding grande para cards (1.5rem / 24px)</p>
            </div>
            <code className="text-sm font-mono text-text-muted shrink-0">--spacing-card-lg</code>
          </div>
        </div>
      </div>

      {/* Card Height */}
      <div>
        <SubsectionTitle>Altura Mínima de Cards</SubsectionTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">min-h-card</p>
              <p className="text-sm text-muted-foreground">Altura mínima consistente para cards (5rem / 80px)</p>
            </div>
            <code className="text-sm font-mono text-text-muted shrink-0">--card-min-height</code>
          </div>
        </div>
      </div>

      {/* Gap */}
      <div>
        <SubsectionTitle>Gap entre Elementos</SubsectionTitle>
        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">gap-gap</p>
            <p className="text-sm text-muted-foreground">Gap padrão entre elementos (1rem / 16px)</p>
          </div>
          <code className="text-sm font-mono text-text-muted shrink-0">--spacing-gap</code>
        </div>
      </div>

      {/* Usage Example */}
      <div>
        <SubsectionTitle>Uso em Tailwind</SubsectionTitle>
        <CodeBlock>{`// Padding de cards
className="p-card"      // 1.25rem (20px)
className="p-card-sm"   // 1rem (16px)
className="p-card-lg"   // 1.5rem (24px)

// Altura mínima de cards
className="min-h-card"  // 5rem (80px)

// Gap entre elementos
className="gap-gap"     // 1rem (16px)

// Section e page spacing
className="p-section"   // 1.5rem (24px)
className="p-page"      // 2rem (32px)

// NUNCA use magic numbers!
// ❌ p-4, p-5, gap-4, gap-3
// ✅ p-card, gap-gap, min-h-card`}</CodeBlock>
      </div>
    </div>
  )
}

function LayoutSection() {
  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Tokens de Layout</SectionTitle>
        <p className="text-text-secondary mb-6">
          Use tokens semânticos para dimensões de layout consistentes.
        </p>
      </div>

      {/* Layout Tokens */}
      <div>
        <SubsectionTitle>Dimensões</SubsectionTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Sidebar Width</p>
              <p className="text-sm text-muted-foreground">Largura padrão do sidebar</p>
            </div>
            <code className="font-mono text-text-muted shrink-0">w-sidebar (16rem / 256px)</code>
          </div>
          <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary">Content Max Width</p>
              <p className="text-sm text-muted-foreground">Largura máxima do conteúdo</p>
            </div>
            <code className="font-mono text-text-muted shrink-0">max-w-content-max (42rem / 672px)</code>
          </div>
        </div>
      </div>

      {/* Usage in Tailwind */}
      <div>
        <SubsectionTitle>Uso em Tailwind</SubsectionTitle>
        <CodeBlock>{`// Largura do sidebar
className="w-sidebar"

// Largura máxima do conteúdo
className="max-w-content-max"

// Tamanhos de ícone container
className="size-icon-container-sm"
className="size-icon-container-md"
className="size-icon-container-lg"

// Tamanhos de ícone
className="size-icon-sm"
className="size-icon-md"
className="size-icon-lg"`}</CodeBlock>
      </div>

      {/* Page Structure */}
      <div>
        <SubsectionTitle>Estrutura de Página</SubsectionTitle>
        <CodeBlock>{`// Padrão de página com header
<div className="flex-1 flex flex-col">
  {/* Header */}
  <div className="border-b backdrop-blur">
    <div className="px-6 py-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Título</h1>
        <p className="text-sm text-muted-foreground mt-1">Descrição</p>
      </div>
      <Button>Ação</Button>
    </div>
  </div>

  {/* Content */}
  <div className="flex-1 space-y-4 p-6">
    {/* Conteúdo */}
  </div>
</div>`}</CodeBlock>
      </div>
    </div>
  )
}

function ComponentsSection() {
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">("light")

  return (
    <div className="space-y-8">
      <div>
        <SectionTitle>Padrões de Componentes</SectionTitle>
        <p className="text-text-secondary mb-6">
          Padrões reutilizáveis para manter consistência visual. Todos os cards seguem a mesma estrutura.
        </p>
      </div>

      {/* Standardized Card Structure */}
      <div>
        <SubsectionTitle>Estrutura Padronizada de Cards</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          TODOS os cards de configurações DEVEM seguir esta estrutura exata:
        </p>
        <CodeBlock>{`<div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
  {/* Icon Container */}
  <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
    <Icon className="size-icon-md text-text-tertiary" />
  </div>

  {/* Text Content */}
  <div className="flex-1 min-w-0">
    <p className="font-medium text-text-primary">{title}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>

  {/* Action (optional) */}
  <ActionElement className="shrink-0" />
</div>`}</CodeBlock>
      </div>

      {/* Card with Switch */}
      <div>
        <SubsectionTitle>Card com Switch</SubsectionTitle>
        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
          <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
            <Bell className="size-icon-md text-text-tertiary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">Notificações do sistema</p>
            <p className="text-sm text-muted-foreground">Receba alertas sobre atualizações e informações importantes.</p>
          </div>
          <Switch className="shrink-0" />
        </div>
      </div>

      {/* Card with Button */}
      <div>
        <SubsectionTitle>Card com Button</SubsectionTitle>
        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
          <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
            <Key className="size-icon-md text-text-tertiary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">Senha</p>
            <p className="text-sm text-muted-foreground">Altere sua senha para manter sua conta segura.</p>
          </div>
          <Button variant="outline" className="shrink-0">Alterar</Button>
        </div>
      </div>

      {/* Card with ChevronRight (Navigation) */}
      <div>
        <SubsectionTitle>Card de Navegação</SubsectionTitle>
        <button className="w-full flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all text-left cursor-pointer group">
          <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
            <Building2 className="size-icon-md text-text-tertiary group-hover:text-primary transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">Cartórios</p>
            <p className="text-sm text-muted-foreground">Gerencie os cartórios cadastrados no sistema</p>
          </div>
          <ChevronRight className="size-icon-md text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </button>
      </div>

      {/* Selectable Cards (Theme) */}
      <div>
        <SubsectionTitle>Cards Selecionáveis (Tema)</SubsectionTitle>
        <div className="space-y-3">
          {[
            { value: "light" as const, icon: Sun, label: "Claro", description: "Tema claro para ambientes bem iluminados" },
            { value: "dark" as const, icon: Moon, label: "Escuro", description: "Tema escuro para reduzir o cansaço visual" },
            { value: "system" as const, icon: Monitor, label: "Sistema", description: "Segue a configuração do seu dispositivo" },
          ].map(({ value, icon: Icon, label, description }) => {
            const isSelected = selectedTheme === value
            return (
              <button
                key={value}
                onClick={() => setSelectedTheme(value)}
                className={cn(
                  "w-full flex items-center gap-gap p-card min-h-card rounded-xl text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-sm"
                    : "border border-transparent bg-accent/50 hover:bg-accent hover:border-border"
                )}
              >
                <div
                  className={cn(
                    "size-icon-container-md rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background border border-border text-text-tertiary"
                  )}
                >
                  <Icon className="size-icon-md" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium",
                    isSelected ? "text-text-primary" : "text-text-secondary"
                  )}>{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                {isSelected && (
                  <div className="size-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="size-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status Card */}
      <div>
        <SubsectionTitle>Card de Status (Success)</SubsectionTitle>
        <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-status-success-muted/30 border border-status-success-border">
          <div className="size-icon-container-md rounded-xl bg-status-success-muted border border-status-success-border flex items-center justify-center shrink-0">
            <Shield className="size-icon-md text-status-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">Conta protegida</p>
            <p className="text-sm text-muted-foreground">Sua conta está protegida com autenticação por senha.</p>
          </div>
        </div>
      </div>

      {/* Empty State Pattern */}
      <div>
        <SubsectionTitle>Empty State</SubsectionTitle>
        <div className="flex flex-col items-center justify-center gap-3 py-12 group cursor-pointer">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
            <Users className="size-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
              Nenhum item encontrado
            </p>
            <p className="text-sm text-text-muted mt-1">
              Clique para adicionar um novo item
            </p>
          </div>
        </div>
      </div>

      {/* Form Dialog Pattern */}
      <div>
        <SubsectionTitle>Dialog de Formulário</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          Estrutura padronizada para dialogs de criação/edição:
        </p>
        <div className="rounded-xl border border-border overflow-hidden bg-background">
          {/* Dialog Header */}
          <div className="flex items-center gap-gap p-6 border-b border-border/50">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold">Novo Item</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Preencha os dados para cadastrar um novo item
              </p>
            </div>
          </div>

          {/* Dialog Content */}
          <div className="p-6 space-y-6">
            {/* Section with left-aligned title */}
            <div className="space-y-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Identificação
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Código <span className="text-destructive">*</span></p>
                  <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center text-muted-foreground text-sm">
                    Ex: ITEM-001
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Nome <span className="text-destructive">*</span></p>
                  <div className="h-10 rounded-md border border-input bg-background px-3 flex items-center text-muted-foreground text-sm">
                    Nome do item
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border/50">
            <Button variant="outline">Cancelar</Button>
            <Button>Criar item</Button>
          </div>
        </div>
      </div>

      {/* Button Patterns */}
      <div>
        <SubsectionTitle>Botões</SubsectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
    </div>
  )
}
