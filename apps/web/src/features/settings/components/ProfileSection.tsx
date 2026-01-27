import { useState, FormEvent } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useUpdateProfile } from "../hooks/useUpdateProfile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User } from "lucide-react"
import { toast } from "sonner"

export function ProfileSection() {
  const { user } = useAuth()
  const { updateProfile, isLoading, error } = useUpdateProfile()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      await updateProfile({ name, email })
      toast.success("Perfil atualizado com sucesso!")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar perfil"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-4 p-5 rounded-xl bg-accent/50 border border-border">
        <div className="size-16 rounded-xl bg-background border border-border flex items-center justify-center">
          <User className="size-8 text-text-tertiary" />
        </div>
        <div>
          <p className="font-semibold text-text-primary">{user?.name || "Usuário"}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Label htmlFor="name" className="text-foreground">Nome</Label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            minLength={2}
            autoComplete="off"
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Este é o nome que será exibido no sistema.
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="off"
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Usado para login e notificações.
          </p>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </form>
    </div>
  )
}
