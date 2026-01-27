import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { Button } from "@/components/ui/button";

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md" 
        showCloseButton={false}
        onInteractOutside={handleInteractOutside}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Entrar" : "Criar conta"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Entre com sua conta para continuar"
              : "Crie uma conta para começar"}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" ? <LoginForm /> : <SignUpForm />}

        <div className="mt-4 text-center text-sm">
          {mode === "login" ? (
            <>
              Não tem uma conta?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
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
                className="p-0 h-auto"
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
