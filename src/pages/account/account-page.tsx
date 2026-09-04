import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { identityApi } from "@/entities/identity/api/identity-api";
import { AccountHeader } from "@/features/account/ui/account-header";
import { AccountNavigation } from "@/features/account/ui/account-navigation";
import { AccountOverview } from "@/features/account/ui/account-overview";
import { IdentifiersSection } from "@/features/account/ui/identifiers-section";
import { SessionsSection } from "@/features/account/ui/sessions-section";
import { useAuth } from "@/features/auth/model/use-auth";
import { getCurrentSessionId } from "@/shared/auth/token-storage";

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
          <AccountOverview account={account} />
          <IdentifiersSection identifiers={account.identifiers} />
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
