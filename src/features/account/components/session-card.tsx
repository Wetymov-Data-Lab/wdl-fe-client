import { formatIdentityDate, getSessionDevice } from "@/entities/identity/lib/presentation";
import type { IdentityApi } from "@/shared/api/contracts";
import { DevicesIcon, LogOutIcon } from "@/shared/ui/icons";

type SessionCardProps = {
  session: IdentityApi.Session;
  current: boolean;
  pending: boolean;
  renderedAt: number;
  onDelete: () => void;
};

export function SessionCard({ session, current, pending, renderedAt, onDelete }: SessionCardProps) {
  const device = getSessionDevice(session.user_agent);
  const expired = new Date(session.expires_at).getTime() <= renderedAt;

  return (
    <article className={`session-card${current ? " session-card--current" : ""}`}>
      <span className="session-card__icon">
        <DevicesIcon />
      </span>
      <div className="session-card__content">
        <div className="session-card__title">
          <strong>
            {device.browser} · {device.platform}
          </strong>
          {current && <span className="current-badge">Текущая сессия</span>}
          {expired && <span className="expired-badge">Истекла</span>}
        </div>
        <p className="session-card__address">IP {session.ip}</p>
        <div className="session-card__dates">
          <span>Вход: {formatIdentityDate(session.created_at)}</span>
          <span>Обновлена: {formatIdentityDate(session.last_refreshed_at)}</span>
          <span>Истекает: {formatIdentityDate(session.expires_at)}</span>
        </div>
      </div>
      <button className="session-card__delete" type="button" disabled={pending} onClick={onDelete}>
        <LogOutIcon /> {pending ? "Завершаем…" : current ? "Выйти" : "Завершить"}
      </button>
    </article>
  );
}
