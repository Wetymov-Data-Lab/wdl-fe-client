import { useEffect, useId, useState, type FormEvent } from "react";
import type { IdentityApi } from "@/shared/api/contracts";

type IdentifierKind = "email" | "phone" | "username" | "external";

type AddIdentifierDialogProps = {
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: IdentityApi.CreateIdentifier) => void;
};

const kindDetails: Record<IdentifierKind, { label: string; placeholder: string; inputType: string }> = {
  email: { label: "Электронная почта", placeholder: "name@example.com", inputType: "email" },
  phone: { label: "Телефон", placeholder: "+7 999 123-45-67", inputType: "tel" },
  username: { label: "Имя пользователя", placeholder: "denis", inputType: "text" },
  external: { label: "Внешняя учётная запись", placeholder: "Логин или отображаемое имя", inputType: "text" },
};

export function AddIdentifierDialog({ pending, error, onClose, onSubmit }: AddIdentifierDialogProps) {
  const titleId = useId();
  const [kind, setKind] = useState<IdentifierKind>("email");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, pending]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = String(data.get("value") ?? "").trim();
    const provider =
      kind === "external"
        ? String(data.get("provider") ?? "")
            .trim()
            .toLowerCase()
        : null;
    const providerUserId = kind === "external" ? String(data.get("providerUserId") ?? "").trim() : null;

    onSubmit({
      type: kind === "external" ? "external" : kind,
      value: kind === "email" ? value.toLowerCase() : value,
      provider,
      provider_user_id: providerUserId,
      is_public_contact: data.get("isPublicContact") === "on",
      receive_notifications: data.get("receiveNotifications") === "on",
    });
  };

  const details = kindDetails[kind];

  return (
    <div className="identifier-dialog" role="presentation" onMouseDown={() => !pending && onClose()}>
      <form
        className="identifier-dialog__card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div>
            <span>Новый способ связи</span>
            <h2 id={titleId}>Добавить идентификатор</h2>
          </div>
          <button type="button" aria-label="Закрыть" disabled={pending} onClick={onClose}>
            ×
          </button>
        </header>

        <label>
          Тип
          <select value={kind} onChange={(event) => setKind(event.target.value as IdentifierKind)}>
            {Object.entries(kindDetails).map(([value, option]) => (
              <option value={value} key={value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          {kind === "external" ? "Название в сервисе" : details.label}
          <input
            name="value"
            type={details.inputType}
            placeholder={details.placeholder}
            maxLength={2048}
            required
            autoFocus
          />
        </label>

        {kind === "external" && (
          <div className="identifier-dialog__provider-fields">
            <label>
              Провайдер
              <input name="provider" placeholder="github, telegram, google…" maxLength={128} required />
            </label>
            <label>
              ID у провайдера
              <input name="providerUserId" placeholder="Уникальный ID в сервисе" maxLength={2048} required />
            </label>
          </div>
        )}

        <div className="identifier-dialog__options">
          <label>
            <input name="isPublicContact" type="checkbox" />
            Показывать как публичный контакт
          </label>
          <label>
            <input name="receiveNotifications" type="checkbox" />
            Получать уведомления
          </label>
        </div>

        {error && (
          <p className="identifier-action-error" role="alert">
            {error}
          </p>
        )}

        <footer>
          <button className="button" type="button" disabled={pending} onClick={onClose}>
            Отмена
          </button>
          <button className="button button--primary" type="submit" disabled={pending}>
            {pending ? "Добавляем…" : "Добавить"}
          </button>
        </footer>
      </form>
    </div>
  );
}
