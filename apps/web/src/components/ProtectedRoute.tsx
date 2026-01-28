import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthDialog } from "./auth/AuthDialog";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth state (but only if not authenticated)
  // If authenticated, render content immediately even if still loading user data
  if (isLoading && !isAuthenticated) {
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
          open={true}
          onOpenChange={() => {
            // Dialog should only close when user becomes authenticated
            // This is handled by AuthDialog internally
          }}
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
