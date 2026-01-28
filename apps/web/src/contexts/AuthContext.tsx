import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { usersApi } from "@/lib/api";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: {
    _id: string;
    email: string;
    name: string;
  } | null;
  signIn: (provider: string, formData: FormData) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (formData: FormData) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { signIn: authSignIn, signOut: authSignOut } = useAuthActions();
  const authToken = useAuthToken();

  const currentUser = useQuery(
    usersApi.queries.getCurrentUser,
    authToken ? {} : "skip"
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isAuthenticated = !!authToken;
  const isLoading = authToken === undefined || isAuthenticating;

  const signIn = async (provider: string, formData: FormData) => {
    setIsAuthenticating(true);
    try {
      await authSignIn(provider, formData);
    } catch (error) {
      setIsAuthenticating(false);
      throw error;
    }
  };

  const signUp = async (formData: FormData) => {
    setIsAuthenticating(true);
    try {
      formData.append("flow", "signUp");

      const email = formData.get("email") as string;
      const nameValue = formData.get("name");
      const name = nameValue ? String(nameValue).trim() : "";

      if (!email || !name) {
        throw new Error("Email e nome são obrigatórios");
      }

      await authSignIn("password", formData);
    } catch (error) {
      setIsAuthenticating(false);
      throw error;
    }
  };

  useEffect(() => {
    if (authToken && isAuthenticating) {
      setIsAuthenticating(false);
    }
  }, [authToken, isAuthenticating]);

  const signOut = async () => {
    await authSignOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        user: currentUser ?? null,
        signIn,
        signOut,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
