import type { IdentityApi } from "@/shared/api/contracts";
import { AccountSectionHeader } from "@/features/account/ui/account-section-header";
import { SessionCard } from "@/features/account/ui/session-card";

type SessionsSectionProps = {
  sessions: IdentityApi.Session[];
  currentSessionId: string | null;
  pendingSessionId?: string;
  renderedAt: number;
  hasError: boolean;
  onDelete: (sessionId: string) => void;
};

export function SessionsSection({
  sessions,
  currentSessionId,
  pendingSessionId,
  renderedAt,
  hasError,
  onDelete,
}: SessionsSectionProps) {
  return (
    <section className="account-section" id="sessions">
      <AccountSectionHeader
        eyebrow="Безопасность"
        title="Активные сессии"
        description="Устройства, на которых выполнен вход. Завершите сессию, если не узнаёте устройство."
      />
      {hasError && (
        <div className="session-error">Не удалось завершить сессию. Обновите страницу и попробуйте ещё раз.</div>
      )}
      <div className="session-list">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            current={session.id === currentSessionId}
            pending={session.id === pendingSessionId}
            renderedAt={renderedAt}
            onDelete={() => onDelete(session.id)}
          />
        ))}
        {!sessions.length && <p className="empty-list">Активных сессий не найдено.</p>}
      </div>
    </section>
  );
}
