import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { identityApi } from "@/entities/identity/api/identity-api";
import { toAuthErrorMessage } from "@/features/auth/lib/to-auth-error-message";
import { useAuth } from "@/features/auth/model/use-auth";
import { AuthLayout } from "@/features/auth/ui/auth-layout";
import { LoginForm, type LoginValues } from "@/features/auth/ui/login-form";
import { RegistrationForm, type RegistrationValues } from "@/features/auth/ui/registration-form";
import { RegistrationSuccess } from "@/features/auth/ui/registration-success";
import type { IdentityApi } from "@/shared/api/contracts";

type AuthMode = "login" | "register";
type AuthPageProps = { mode: AuthMode };

const pageCopy = {
  login: {
    title: "Вход",
    description: "Удобный инструмент проектирования баз данных",
  },
  register: {
    title: "Новый аккаунт",
    description: "Создайте профиль для работы со схемами и командными пространствами.",
  },
} satisfies Record<AuthMode, { title: string; description: string }>;

export function AuthPage({ mode }: AuthPageProps) {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<IdentityApi.Account | null>(null);

  if (auth.state === "authenticated") return <Navigate to="/account" replace />;

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setPending(true);
    try {
      await action();
    } catch (requestError) {
      setError(toAuthErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  };

  const login = (values: LoginValues) =>
    run(async () => {
      await auth.login(values.email.trim(), values.password);
      const requestedPath = (location.state as { from?: string } | null)?.from;
      await navigate(requestedPath ?? "/account", { replace: true });
    });

  const register = (values: RegistrationValues) =>
    run(async () => {
      if (values.password !== values.passwordConfirm) throw new Error("PASSWORDS_DO_NOT_MATCH");
      const account = await identityApi.register({
        email: values.email.trim(),
        password: values.password,
        profile: {
          display_name: values.displayName.trim(),
          given_name: values.givenName.trim() || undefined,
          family_name: values.familyName.trim() || undefined,
          locale: navigator.language,
          time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
      setCreatedAccount(account);
    });

  const copy = pageCopy[mode];
  const title = createdAccount ? "Аккаунт создан" : copy.title;

  return (
    <AuthLayout title={title} description={copy.description}>
      {createdAccount ? (
        <RegistrationSuccess account={createdAccount} />
      ) : mode === "login" ? (
        <LoginForm pending={pending} error={error} onSubmit={login} />
      ) : (
        <RegistrationForm pending={pending} error={error} onSubmit={register} />
      )}
    </AuthLayout>
  );
}
