import { createContext } from "react";
import type { IdentityApi } from "@/shared/api/contracts";

export type AuthState = "loading" | "authenticated" | "anonymous";

export type AuthContextValue = {
  state: AuthState;
  user: IdentityApi.UserInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
