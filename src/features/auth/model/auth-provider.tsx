import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { identityApi } from "@/entities/identity/api/identity-api";
import { AuthContext, type AuthState } from "@/features/auth/model/auth-context";
import type { IdentityApi } from "@/shared/api/contracts";
import { authClearedEvent, clearTokens, readTokens } from "@/shared/auth/token-storage";

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>(() => (readTokens() ? "loading" : "anonymous"));
  const [user, setUser] = useState<IdentityApi.UserInfo | null>(null);

  useEffect(() => {
    let active = true;
    if (!readTokens()) return;
    identityApi
      .userInfo()
      .then((value) => {
        if (!active) return;
        setUser(value);
        setState("authenticated");
      })
      .catch(() => {
        if (!active) return;
        clearTokens();
        setState("anonymous");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClearedSession = () => {
      setUser(null);
      setState("anonymous");
    };
    window.addEventListener(authClearedEvent, handleClearedSession);
    return () => window.removeEventListener(authClearedEvent, handleClearedSession);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const value = await identityApi.login(email, password);
    setUser(value);
    setState("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await identityApi.logout();
    } finally {
      setUser(null);
      setState("anonymous");
    }
  }, []);

  const value = useMemo(() => ({ state, user, login, logout }), [state, user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
