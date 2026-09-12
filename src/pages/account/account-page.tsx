import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { identityApi } from "@/entities/identity/api/identity-api";
import { AccountHeader } from "@/features/account/components/account-header";
import { AccountNavigation } from "@/features/account/components/account-navigation";
import { AccountOverview } from "@/features/account/components/account-overview";
import { IdentifiersSection } from "@/features/account/components/identifiers-section";
import { SessionsSection } from "@/features/account/components/sessions-section";
import { ProfileForm } from "@/features/account/components/profile-form";
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

  return (
    <main className="account-page">
      <AccountHeader account={account} email={auth.user?.email ?? null} onLogout={auth.logout} />
      <div className="account-layout">
        <AccountNavigation identifiersCount={account.identifiers.length} sessionsCount={account.sessions.length} />
        <div className="account-sections">
          <ProfileForm
            profile={account.profile}
            pending={profileMutation.isPending}
            saved={profileMutation.isSuccess}
            error={profileMutation.error ? profileErrorMessage(profileMutation.error) : null}
            onSubmit={profileMutation.mutate}
          />
          <AccountOverview account={account} />
          <IdentifiersSection
            identifiers={account.identifiers}
            adding={addIdentifierMutation.isPending}
            pendingIdentifierId={
              preferencesMutation.isPending
                ? preferencesMutation.variables.identifierId
                : deleteIdentifierMutation.isPending
                  ? deleteIdentifierMutation.variables
                  : undefined
            }
            error={identifierError ? identifierErrorMessage(identifierError) : null}
            onAdd={(input) => addIdentifierMutation.mutate(input)}
            onUpdatePreferences={(identifier, input) => preferencesMutation.mutate({ identifierId: identifier.id, input })}
            onDelete={(identifier) => {
              if (window.confirm(`Удалить идентификатор «${identifier.value}»?`)) {
                deleteIdentifierMutation.mutate(identifier.id);
              }
            }}
            onDismissError={dismissIdentifierError}
          />
          <SessionsSection
            sessions={sessions}
            currentSessionId={currentSessionId}
            pendingSessionId={sessionMutation.isPending ? sessionMutation.variables : undefined}
            renderedAt={renderedAt}
            hasError={sessionMutation.isError}
            onDelete={sessionMutation.mutate}
          />
        </div>
      </div>
    </main>
  );
}
