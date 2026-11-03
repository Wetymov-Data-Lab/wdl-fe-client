import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { identityApi } from "@/entities/identity/api/identity-api";
import { AccountHeader } from "@/features/account/components/account-header";
import { AccountNavigation } from "@/features/account/components/account-navigation";
import { getSecuritySteps } from "@/entities/identity/lib/security";
import type { AccountOutletContext } from "@/pages/account/model/account-outlet-context";
import { useAuth } from "@/features/auth/model/use-auth";
import { getCurrentSessionId } from "@/shared/auth/token-storage";
import type { IdentityApi } from "@/shared/api/contracts";
import { IdentityApiError } from "@/entities/identity/api/identity-api";

function identifierErrorMessage(error: unknown): string {
  if (error instanceof IdentityApiError && error.status === 409) return "Такой идентификатор уже используется.";
  if (error instanceof IdentityApiError) return error.message;
  if (error instanceof DOMException && error.name === "AbortError") return "Сервис не ответил вовремя.";
  if (error instanceof TypeError) return "Не удалось подключиться к сервису идентификации.";
  return "Не удалось сохранить идентификатор. Попробуйте ещё раз.";
}

function profileErrorMessage(error: unknown): string {
  if (error instanceof IdentityApiError) return error.message;
  if (error instanceof DOMException && error.name === "AbortError") return "Сервис не ответил вовремя.";
  if (error instanceof TypeError) return "Не удалось подключиться к сервису идентификации.";
  return "Не удалось сохранить профиль. Попробуйте ещё раз.";
}

export function AccountPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [renderedAt] = useState(Date.now);
  const currentSessionId = getCurrentSessionId();
  const accountId = auth.user?.sub;
  const queryKey = ["identity", "account", accountId] as const;

  const accountQuery = useQuery({
    queryKey,
    queryFn: () => identityApi.account(accountId!),
    enabled: Boolean(accountId),
  });

  const sessionMutation = useMutation({
    mutationFn: (sessionId: string) => identityApi.deleteSession(accountId!, sessionId),
    onSuccess: async (_, sessionId) => {
      if (sessionId === currentSessionId) return auth.logout();
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const addIdentifierMutation = useMutation({
    mutationFn: (input: IdentityApi.CreateIdentifier) => identityApi.addIdentifier(accountId!, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const preferencesMutation = useMutation({
    mutationFn: ({ identifierId, input }: { identifierId: string; input: IdentityApi.IdentifierPreferences }) =>
      identityApi.updateIdentifierPreferences(accountId!, identifierId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteIdentifierMutation = useMutation({
    mutationFn: (identifierId: string) => identityApi.deleteIdentifier(accountId!, identifierId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const profileMutation = useMutation({
    mutationFn: (input: IdentityApi.UpdateProfile) => identityApi.updateProfile(accountId!, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: ["identity", "profile", accountId] }),
      ]);
    },
  });

  const identifierError = addIdentifierMutation.error ?? preferencesMutation.error ?? deleteIdentifierMutation.error;
  const dismissIdentifierError = () => {
    addIdentifierMutation.reset();
    preferencesMutation.reset();
    deleteIdentifierMutation.reset();
  };
  const securitySteps = useMemo(
    () => (accountQuery.data ? getSecuritySteps(accountQuery.data, renderedAt) : []),
    [accountQuery.data, renderedAt],
  );

  if (accountQuery.isLoading) {
    return (
      <main className="account-page account-page--state">
        <span className="loading-ring" />
        Загружаем аккаунт…
      </main>
    );
  }

  if (accountQuery.isError || !accountQuery.data) {
    return (
      <main className="account-page account-page--state">
        <strong>Не удалось загрузить аккаунт</strong>
        <button className="button button--primary" type="button" onClick={() => void accountQuery.refetch()}>
          Повторить
        </button>
      </main>
    );
  }

  const account = accountQuery.data;
  const sessions = [...account.sessions].sort((left, right) => {
    if (left.id === currentSessionId) return -1;
    if (right.id === currentSessionId) return 1;
    return Date.parse(right.last_refreshed_at) - Date.parse(left.last_refreshed_at);
  });
  const outletContext: AccountOutletContext = {
    account,
    sessions,
    currentSessionId,
    renderedAt,
    securitySteps,
    profile: {
      pending: profileMutation.isPending,
      saved: profileMutation.isSuccess,
      error: profileMutation.error ? profileErrorMessage(profileMutation.error) : null,
      submit: profileMutation.mutate,
    },
    identifiers: {
      adding: addIdentifierMutation.isPending,
      pendingIdentifierId: preferencesMutation.isPending
        ? preferencesMutation.variables.identifierId
        : deleteIdentifierMutation.isPending
          ? deleteIdentifierMutation.variables
          : undefined,
      error: identifierError ? identifierErrorMessage(identifierError) : null,
      add: (input) => addIdentifierMutation.mutate(input),
      updatePreferences: (identifier, input) => preferencesMutation.mutate({ identifierId: identifier.id, input }),
      remove: (identifier) => {
        if (window.confirm(`Удалить идентификатор «${identifier.value}»?`)) {
          deleteIdentifierMutation.mutate(identifier.id);
        }
      },
      dismissError: dismissIdentifierError,
    },
    sessionActions: {
      pendingSessionId: sessionMutation.isPending ? sessionMutation.variables : undefined,
      hasError: sessionMutation.isError,
      remove: sessionMutation.mutate,
    },
  };

  return (
    <main className="account-page">
      <div className="account-frame">
        <AccountHeader
          account={account}
          email={auth.user?.email ?? null}
          securitySteps={securitySteps}
          onLogout={auth.logout}
        />
        <div className="account-layout">
          <AccountNavigation counts={{ "sign-in": account.identifiers.length, sessions: account.sessions.length }} />
          <div className="account-sections">
            <Outlet context={outletContext} />
          </div>
        </div>
      </div>
    </main>
  );
}
