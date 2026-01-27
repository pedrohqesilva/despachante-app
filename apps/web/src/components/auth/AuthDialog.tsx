import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "login" | "signup";
};

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = "login",
}: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const { isAuthenticated } = useAuth();

  // Close dialog when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && open) {
      // Close dialog immediately when authenticated
      onOpenChange(false);
    }
  }, [isAuthenticated, open, onOpenChange]);

  // Prevent closing dialog with click outside - never allow it
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing when user becomes authenticated (handled by useEffect)
    if (!newOpen && !isAuthenticated) {
      return;
    }
    onOpenChange(newOpen);
  };

  // Prevent interaction outside (click outside) from closing the dialog
  const handleInteractOutside = (e: Event) => {
    e.preventDefault();
  };

  const Icon = mode === "login" ? LogIn : UserPlus;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[440px] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
        onInteractOutside={handleInteractOutside}
      >
        {/* Header */}
        <div className="p-8 pb-2">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Icon className="size-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold">
                {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {mode === "login"
                  ? "Entre com sua conta para continuar"
                  : "Crie uma conta para começar"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6">
          {mode === "login" ? <LoginForm /> : <SignUpForm />}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Não tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={() => setMode("signup")}
              >
                Criar conta
              </Button>
            </>
          ) : (
            <>
              Já tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium text-primary"
                onClick={() => setMode("login")}
              >
                Entrar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
