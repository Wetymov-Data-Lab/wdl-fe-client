import { formatIdentityDate } from "@/entities/identity/lib/presentation";
import type { IdentityApi } from "@/shared/api/contracts";
import { CopyButton } from "@/shared/ui/copy-button";
import { CheckIcon, KeyIcon, MailIcon } from "@/shared/ui/icons";

type IdentifierCardProps = { identifier: IdentityApi.Identifier };

export function IdentifierCard({ identifier }: IdentifierCardProps) {
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
            <span className="verified">
              <CheckIcon /> Подтверждён
            </span>
          ) : (
            <span className="unverified">Не подтверждён</span>
          )}
        </div>
        <p>
          Добавлен {formatIdentityDate(identifier.created_at)}
          {identifier.last_used_at && <> · использован {formatIdentityDate(identifier.last_used_at)}</>}
        </p>
      </div>
    </article>
  );
}
