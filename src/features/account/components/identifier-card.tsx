import { formatIdentityDate } from "@/entities/identity/lib/presentation";
import type { IdentityApi } from "@/shared/api/contracts";
import { CopyButton } from "@/shared/ui/copy-button";
import { KeyIcon, MailIcon } from "@/shared/ui/icons";

type IdentifierCardProps = {
  identifier: IdentityApi.Identifier;
  pending: boolean;
  canDelete: boolean;
  onUpdatePreferences: (preferences: IdentityApi.IdentifierPreferences) => void;
  onDelete: () => void;
};

export function IdentifierCard({ identifier, pending, canDelete, onUpdatePreferences, onDelete }: IdentifierCardProps) {
  return (
    <article className="identifier-card">
      <span className="identifier-card__icon">{identifier.type === "email" ? <MailIcon /> : <KeyIcon />}</span>
      <div className="identifier-card__content">
        <div className="identifier-card__title">
          <strong>{identifier.value}</strong>
          <CopyButton value={identifier.value} label="идентификатор" />
        </div>
        <div className="identifier-card__meta">
          <span>{identifier.type.toUpperCase()}</span>
          {identifier.provider && <span>через {identifier.provider}</span>}
          {identifier.is_verified ? (
            <span className="verified">Подтверждён</span>
          ) : (
            <span className="unverified">Не подтверждён</span>
          )}
        </div>
        <p>
          Добавлен {formatIdentityDate(identifier.created_at)}
          {identifier.last_used_at && <> · использован {formatIdentityDate(identifier.last_used_at)}</>}
        </p>
      </div>
      <div className="identifier-card__actions">
        <label>
          <input
            type="checkbox"
            checked={identifier.is_public_contact}
            disabled={pending}
            onChange={(event) =>
              onUpdatePreferences({
                is_public_contact: event.target.checked,
                receive_notifications: identifier.receive_notifications,
              })
            }
          />
          Публичный
        </label>
        <label>
          <input
            type="checkbox"
            checked={identifier.receive_notifications}
            disabled={pending}
            onChange={(event) =>
              onUpdatePreferences({
                is_public_contact: identifier.is_public_contact,
                receive_notifications: event.target.checked,
              })
            }
          />
          Уведомления
        </label>
        <button
          className="identifier-card__delete"
          type="button"
          disabled={pending || !canDelete}
          title={canDelete ? "Удалить идентификатор" : "Нельзя удалить единственный email для входа"}
          onClick={onDelete}>
          {pending ? "Сохраняем…" : "Удалить"}
        </button>
      </div>
    </article>
  );
}
