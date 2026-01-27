import { useState } from "react"
import { ChangePasswordDialog } from "./ChangePasswordDialog"
import { Button } from "@/components/ui/button"
import { Key, ShieldCheck } from "lucide-react"

export function SecuritySection() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  return (
    <div className="space-y-3">
      {/* Password Section */}
      <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-accent/50 border border-border hover:border-border transition-colors">
        <div className="size-icon-container-md rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
          <Key className="size-icon-md text-text-tertiary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary">Senha</p>
          <p className="text-sm text-muted-foreground">
            Altere sua senha para manter sua conta segura.
          </p>
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
      <div className="flex items-center gap-gap p-card min-h-card rounded-xl bg-status-success-muted/30 border border-status-success-border">
        <div className="size-icon-container-md rounded-xl bg-status-success-muted border border-status-success-border flex items-center justify-center shrink-0">
          <ShieldCheck className="size-icon-md text-status-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-text-primary">Conta protegida</p>
          <p className="text-sm text-muted-foreground">
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
