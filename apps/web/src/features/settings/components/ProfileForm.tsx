import { useState, FormEvent } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useUpdateProfile } from "../hooks/useUpdateProfile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ProfileForm() {
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
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="off"
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Salvando...
          </>
        ) : (
          "Salvar Alterações"
        )}
      </Button>
    </form>
  )
}
