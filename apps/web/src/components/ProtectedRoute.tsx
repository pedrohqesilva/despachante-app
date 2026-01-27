import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "./auth/AuthDialog";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthDialog(true);
    } else if (isAuthenticated) {
      setShowAuthDialog(false);
    }
  }, [isLoading, isAuthenticated]);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show auth dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          defaultMode="login"
        />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Acesso restrito</h2>
            <p className="text-muted-foreground">
              Você precisa estar autenticado para acessar esta página.
            </p>
          </div>
        </div>
      </>
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
}
