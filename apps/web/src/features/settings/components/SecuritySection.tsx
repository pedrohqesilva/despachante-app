import { useState } from "react"
import { ChangePasswordDialog } from "./ChangePasswordDialog"
import { Button } from "@/components/ui/button"
import { Key, ShieldCheck } from "lucide-react"

export function SecuritySection() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Password Section */}
      <div className="flex items-start justify-between gap-4 p-5 rounded-xl bg-accent/50 border border-transparent hover:border-border transition-colors">
        <div className="flex gap-4">
          <div className="size-11 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
            <Key className="size-5 text-foreground/60" />
          </div>
          <div>
            <p className="font-medium text-foreground">Senha</p>
            <p className="text-sm text-muted-foreground mt-1">
              Altere sua senha para manter sua conta segura.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsPasswordDialogOpen(true)}
          className="shrink-0"
        >
          Alterar
        </Button>
      </div>

      {/* Security Status */}
      <div className="flex items-start gap-4 p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5 text-emerald-500" />
        </div>
        <div>
          <p className="font-medium text-foreground">Conta protegida</p>
          <p className="text-sm text-muted-foreground mt-1">
            Sua conta está protegida com autenticação por senha.
          </p>
        </div>
      </div>

      <ChangePasswordDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </div>
  )
}
