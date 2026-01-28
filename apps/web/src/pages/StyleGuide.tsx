import { useState, useRef } from "react"
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
  ChevronDown,
  Key,
  Sun,
  Moon,
  Monitor,
  Check,
  Building2,
  Search,
  Plus,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { StatusBadge, StatusType } from "@/components/ui/status-badge"
import { IconContainer, IconContainerSize } from "@/components/ui/icon-container"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const componentGroups = [
  { id: "group-buttons", label: "Botões" },
  { id: "group-cards", label: "Cards" },
  { id: "group-dialogs", label: "Dialogs" },
  { id: "group-popovers", label: "Popovers" },
  { id: "group-states", label: "Estados" },
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
    <div className="flex items-center gap-gap">
      <div className={cn("size-icon-container-md rounded-lg border border-border shadow-sm", className)} />
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
  const [componentsExpanded, setComponentsExpanded] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)

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
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Cabecalho */}
      <div className="border-b backdrop-blur shrink-0">
        <div className="px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight">Style Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Documentação do design system e referência de componentes.
          </p>
        </div>
      </div>

      {/* Conteudo */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-sidebar border-r border-border/50 shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sections.map(({ id, label, icon: Icon }) => {
              const isComponents = id === "components"
              const isActive = activeSection === id

              return (
                <div key={id}>
                  <button
                    onClick={() => {
                      setActiveSection(id)
                      if (isComponents) {
                        setComponentsExpanded(!componentsExpanded)
                      }
                    }}
                    className={cn(
                      "w-full flex items-center gap-gap px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-text-tertiary hover:text-text-primary hover:bg-accent"
                    )}
                  >
                    <Icon className={cn(
                      "size-icon-sm",
                      isActive ? "text-primary" : "text-text-disabled"
                    )} />
                    <span className="flex-1 text-left">{label}</span>
                    {isComponents && (
                      <ChevronDown className={cn(
                        "size-icon-sm transition-transform",
                        componentsExpanded && isActive ? "rotate-180" : ""
                      )} />
                    )}
                  </button>

                  {/* Submenu de componentes */}
                  {isComponents && componentsExpanded && isActive && (
                    <div className="ml-6 mt-1 space-y-0.5 border-l border-border/50 pl-3">
                      {componentGroups.map(({ id: groupId, label: groupLabel }) => (
                        <button
                          key={groupId}
                          onClick={() => {
                            const element = document.getElementById(groupId)
                            if (element) {
                              element.scrollIntoView({ behavior: "smooth", block: "start" })
                            }
                          }}
                          className="w-full text-left px-2 py-1.5 text-xs text-text-tertiary hover:text-text-primary hover:bg-accent/50 rounded transition-colors cursor-pointer"
                        >
                          {groupLabel}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Conteudo principal */}
        <main ref={mainRef} className="flex-1 overflow-auto">
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

      {/* Cores base */}
      <div>
        <SubsectionTitle>Cores Base</SubsectionTitle>
        <div className="grid grid-cols-2 gap-gap">
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

      {/* Cores de status */}
      <div>
        <SubsectionTitle>Cores de Status</SubsectionTitle>
        <div className="grid grid-cols-2 gap-gap">
          <ColorSwatch name="Success" variable="--status-success" className="bg-status-success" />
          <ColorSwatch name="Warning" variable="--status-warning" className="bg-status-warning" />
          <ColorSwatch name="Error" variable="--status-error" className="bg-status-error" />
          <ColorSwatch name="Neutral" variable="--status-neutral" className="bg-status-neutral" />
          <ColorSwatch name="Info" variable="--status-info" className="bg-status-info" />
        </div>
      </div>

      {/* Exemplo de uso */}
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

      {/* Badges de status */}
      <div className="space-y-3">
        {statuses.map(({ status, label, description }) => (
          <div key={status} className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
            <StatusBadge status={status}>{label}</StatusBadge>
            <span className="flex-1 text-text-secondary">{description}</span>
            <code className="text-sm font-mono text-text-muted shrink-0">status="{status}"</code>
          </div>
        ))}
      </div>

      {/* Exemplo de uso */}
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

      {/* Hierarquia de texto */}
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

      {/* Pesos de fonte */}
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

      {/* Tamanhos de icone */}
      <div>
        <SubsectionTitle>Tamanhos</SubsectionTitle>
        <div className="flex items-end gap-section">
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <IconContainer size={size} icon={Users} />
              <span className="text-sm text-text-muted">{sizeLabels[size]}</span>
              <code className="text-xs font-mono text-text-disabled">size="{size}"</code>
            </div>
          ))}
        </div>
      </div>

      {/* Variantes de icone */}
      <div>
        <SubsectionTitle>Variantes</SubsectionTitle>
        <div className="flex items-center gap-section">
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

      {/* Exemplo de uso */}
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

      {/* Variaveis CSS */}
      <div>
        <SubsectionTitle>Tokens de Tamanho</SubsectionTitle>
        <div className="grid grid-cols-2 gap-gap">
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

      {/* Tokens de padding */}
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

      {/* Altura de cards */}
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

      {/* Gap entre elementos */}
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

      {/* Exemplo de uso */}
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

      {/* Tokens de layout */}
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

      {/* Uso em Tailwind */}
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

      {/* Estrutura de pagina */}
      <div>
        <SubsectionTitle>Estrutura de Página</SubsectionTitle>
        <CodeBlock>{`// Padrao de pagina com header
<div className="flex-1 flex flex-col">
  {/* Cabecalho */}
  <div className="border-b backdrop-blur">
    <div className="px-6 py-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Titulo</h1>
        <p className="text-sm text-muted-foreground mt-1">Descricao</p>
      </div>
      <Button>Acao</Button>
    </div>
  </div>

  {/* Conteudo */}
  <div className="flex-1 space-y-4 p-6">
    {/* Conteudo da pagina */}
  </div>
</div>`}</CodeBlock>
      </div>
    </div>
  )
}

function GroupTitle({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div id={id} className="pt-4 first:pt-0">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{children}</h3>
    </div>
  )
}

function GroupDivider() {
  return <div className="h-px bg-border my-8" />
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

      {/* Secao de botoes */}
      <GroupTitle id="group-buttons">Botões</GroupTitle>

      <div id="buttons">
        <SubsectionTitle>Botões</SubsectionTitle>
        <div className="flex flex-wrap gap-gap">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      <GroupDivider />

      {/* Secao de cards */}
      <GroupTitle id="group-cards">Cards</GroupTitle>

      <div id="card-button">
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

      <div id="card-switch">
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

      <div id="card-navigation">
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

      <div id="card-status">
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

      <div id="selectable-cards">
        <SubsectionTitle>Cards Selecionáveis</SubsectionTitle>
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
                  <div className="size-icon-container-sm rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="size-icon-sm text-primary-foreground" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div id="card-structure">
        <SubsectionTitle>Estrutura Padronizada de Cards</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          TODOS os cards de configurações DEVEM seguir esta estrutura exata:
        </p>
        <CodeBlock>{`<div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
  {/* Container do icone */}
  <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
    <Icon className="size-icon-md text-text-tertiary" />
  </div>

  {/* Conteudo de texto */}
  <div className="flex-1 min-w-0">
    <p className="font-medium text-text-primary">{title}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>

  {/* Acao (opcional) */}
  <ActionElement className="shrink-0" />
</div>`}</CodeBlock>
      </div>

      <GroupDivider />

      {/* Secao de dialogs */}
      <GroupTitle id="group-dialogs">Dialogs</GroupTitle>

      <div id="dialog-form">
        <SubsectionTitle>Dialog de Formulário</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          Estrutura padronizada para dialogs de criação/edição:
        </p>
        <div className="rounded-lg border border-border bg-secondary shadow-xl max-w-content-max p-6 space-y-4">
          <div className="flex items-center gap-gap">
            <div className="size-icon-container-md rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="size-icon-md text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold">Novo Item</p>
              <p className="text-sm text-muted-foreground">
                Preencha os dados para cadastrar um novo item
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Nome <span className="text-destructive">*</span></p>
              <div className="h-10 rounded-md border border-input bg-muted px-3 flex items-center text-muted-foreground text-sm">
                Nome do item
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-gap pt-2">
            <Button variant="outline">Cancelar</Button>
            <Button>Criar item</Button>
          </div>
        </div>
      </div>

      <div id="dialog-confirmation">
        <SubsectionTitle>Dialog de Confirmação</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          Estrutura padronizada para dialogs de confirmação de ações destrutivas:
        </p>
        <div className="rounded-xl border border-border overflow-hidden bg-secondary p-6 space-y-4 max-w-content-max">
          <div className="space-y-2">
            <p className="text-lg font-semibold">Confirmar exclusão</p>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o cliente{" "}
              <strong>Nome do Cliente</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex items-center justify-end gap-gap">
            <Button variant="outline">Cancelar</Button>
            <Button variant="destructive">Excluir</Button>
          </div>
        </div>
      </div>

      <GroupDivider />

      {/* Secao de popovers */}
      <GroupTitle id="group-popovers">Popovers</GroupTitle>

      <PopoversSection />

      <GroupDivider />

      {/* Secao de estados */}
      <GroupTitle id="group-states">Estados</GroupTitle>

      <div id="empty-state">
        <SubsectionTitle>Empty State</SubsectionTitle>
        <div className="flex flex-col items-center justify-center gap-gap py-12 group cursor-pointer">
          <div className="size-icon-container-lg rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-colors">
            <Users className="size-icon-lg text-primary" />
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
    </div>
  )
}

function PopoversSection() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const mockClients = [
    { id: "1", name: "João Silva", taxId: "123.456.789-00" },
    { id: "2", name: "Maria Santos", taxId: "987.654.321-00" },
    { id: "3", name: "Pedro Oliveira", taxId: "456.789.123-00" },
  ]

  const filteredClients = searchValue.trim()
    ? mockClients.filter((c) =>
        c.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : mockClients

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  return (
    <>
      <div id="popover-selection">
        <SubsectionTitle>Popover de Seleção</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          Popover com busca e lista de seleção. Usado para selecionar cônjuge, proprietários, etc.
        </p>

        <div className="w-full max-w-md">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-10"
                type="button"
              >
                <span className="text-muted-foreground">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} item(ns) selecionado(s)`
                    : "Selecione os itens"}
                </span>
                <ChevronDown className="size-icon-sm opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start" sideOffset={-40} style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '300px' }}>
              <div className="flex items-center border-b px-3">
                <Search className="size-icon-sm shrink-0 opacity-50" />
                <Input
                  placeholder="Buscar..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-10 border-0 bg-transparent dark:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                  autoComplete="off"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {/* Acao: Criar novo (opcional) */}
                <div className="p-1">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer">
                    <div className="size-icon-container-sm rounded-md bg-primary/10 flex items-center justify-center">
                      <Plus className="size-icon-sm text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Criar novo item</p>
                      <p className="text-xs text-muted-foreground">Adicionar à lista</p>
                    </div>
                  </div>
                </div>

                {/* Separador com label */}
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-muted-foreground px-2">Itens existentes</p>
                </div>

                {/* Lista de resultados da busca */}
                <div className="p-1 pt-0">
                  {filteredClients.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum item encontrado.
                    </p>
                  ) : (
                    filteredClients.map((client) => {
                      const isSelected = selectedItems.includes(client.id)
                      return (
                        <div
                          key={client.id}
                          className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-accent cursor-pointer"
                          onClick={() => toggleItem(client.id)}
                          role="option"
                          aria-selected={selectedItems.includes(client.id)}
                        >
                          <div className="size-icon-container-sm rounded-full bg-muted flex items-center justify-center shrink-0">
                            <span className="text-xs font-medium">
                              {client.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{client.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {client.taxId}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="size-icon-sm text-primary shrink-0" />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Card com itens selecionados */}
          {selectedItems.length > 0 && (
            <div className="mt-3 rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
              {mockClients
                .filter((c) => selectedItems.includes(c.id))
                .map((client) => (
                  <div
                    key={client.id}
                    className="group flex items-center gap-gap px-3 py-2.5 bg-accent/30 hover:bg-accent/60 transition-colors"
                  >
                    <div className="size-icon-container-sm rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {client.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.taxId}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="size-icon-container-sm rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      onClick={() => toggleItem(client.id)}
                      aria-label={`Remover ${client.name}`}
                    >
                      <X className="size-icon-sm" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div id="popover-structure">
        <SubsectionTitle>Estrutura do Popover de Seleção</SubsectionTitle>
        <p className="text-text-secondary mb-4">
          Estrutura padronizada para popovers com busca e seleção:
        </p>
        <CodeBlock>{`<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full justify-between h-10">
      <span className="text-muted-foreground">
        {selected ? "X selecionado(s)" : "Selecione..."}
      </span>
      <ChevronDown className="size-icon-sm opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent
    className="p-0"
    align="start"
    sideOffset={-40}
    style={{ width: 'var(--radix-popover-trigger-width)', minWidth: '300px' }}
  >
    {/* Campo de busca */}
    <div className="flex items-center border-b px-3">
      <Search className="size-icon-sm shrink-0 opacity-50" />
      <Input
        placeholder="Buscar..."
        className="h-10 border-0 bg-transparent dark:bg-transparent
                   focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
        autoComplete="off"
      />
    </div>

    <div className="max-h-[300px] overflow-y-auto">
      {/* Acao: Criar novo (opcional) */}
      <div className="p-1">
        <div className="flex items-center gap-2 px-2 py-2 rounded-md
                        hover:bg-accent cursor-pointer">
          <div className="size-icon-container-sm rounded-md bg-primary/10
                          flex items-center justify-center">
            <Plus className="size-icon-sm text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Criar novo</p>
            <p className="text-xs text-muted-foreground">Descricao</p>
          </div>
        </div>
      </div>

      {/* Label da secao */}
      <div className="px-2 py-1.5">
        <p className="text-xs font-medium text-muted-foreground px-2">
          Itens existentes
        </p>
      </div>

      {/* Lista de itens */}
      <div className="p-1 pt-0">
        {items.map((item) => (
          <div className="flex items-center gap-2 px-2 py-2 rounded-md
                          hover:bg-accent cursor-pointer">
            <div className="size-icon-container-sm rounded-full bg-muted
                            flex items-center justify-center shrink-0">
              <span className="text-xs font-medium">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{name}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            {isSelected && (
              <Check className="size-icon-sm text-primary shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  </PopoverContent>
</Popover>`}</CodeBlock>
      </div>

      <div id="popover-rules">
        <SubsectionTitle>Regras de Uso</SubsectionTitle>
        <div className="space-y-3">
          <div className="flex items-start gap-gap p-card rounded-xl bg-accent/50">
            <div className="size-icon-container-sm rounded-full bg-status-success-muted flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-icon-sm text-status-success" />
            </div>
            <div>
              <p className="font-medium text-text-primary">sideOffset={-40}</p>
              <p className="text-sm text-muted-foreground">
                Posiciona o input de busca exatamente sobre o botão trigger
              </p>
            </div>
          </div>
          <div className="flex items-start gap-gap p-card rounded-xl bg-accent/50">
            <div className="size-icon-container-sm rounded-full bg-status-success-muted flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-icon-sm text-status-success" />
            </div>
            <div>
              <p className="font-medium text-text-primary">bg-transparent dark:bg-transparent</p>
              <p className="text-sm text-muted-foreground">
                Input deve ser transparente para combinar com o fundo do popover
              </p>
            </div>
          </div>
          <div className="flex items-start gap-gap p-card rounded-xl bg-accent/50">
            <div className="size-icon-container-sm rounded-full bg-status-success-muted flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-icon-sm text-status-success" />
            </div>
            <div>
              <p className="font-medium text-text-primary">width: var(--radix-popover-trigger-width)</p>
              <p className="text-sm text-muted-foreground">
                Popover deve ter a mesma largura do trigger para alinhamento perfeito
              </p>
            </div>
          </div>
          <div className="flex items-start gap-gap p-card rounded-xl bg-accent/50">
            <div className="size-icon-container-sm rounded-full bg-status-success-muted flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-icon-sm text-status-success" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Avatar com inicial + nome + subtítulo</p>
              <p className="text-sm text-muted-foreground">
                Estrutura consistente para itens de seleção em listas
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
