import type { IdentityApi } from "@/shared/api/contracts";
import { AddIdentifierDialog } from "@/features/account/components/add-identifier-dialog";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";
import { IdentifierCard } from "@/features/account/components/identifier-card";
import { useEffect, useRef, useState } from "react";

type IdentifiersSectionProps = {
  identifiers: IdentityApi.Identifier[];
  pendingIdentifierId?: string;
  adding: boolean;
  error: string | null;
  onAdd: (input: IdentityApi.CreateIdentifier) => void;
  onUpdatePreferences: (identifier: IdentityApi.Identifier, preferences: IdentityApi.IdentifierPreferences) => void;
  onDelete: (identifier: IdentityApi.Identifier) => void;
  onDismissError: () => void;
};

export function IdentifiersSection({
  identifiers,
  pendingIdentifierId,
  adding,
  error,
  onAdd,
  onUpdatePreferences,
  onDelete,
  onDismissError,
}: IdentifiersSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const wasAdding = useRef(false);
  const localEmails = identifiers.filter((identifier) => identifier.type === "email" && !identifier.provider);

  useEffect(() => {
    if (wasAdding.current && !adding && !error) setDialogOpen(false);
    wasAdding.current = adding;
  }, [adding, error]);

  const closeDialog = () => {
    onDismissError();
    setDialogOpen(false);
  };

  return (
    <section className="account-section" id="identifiers">
      <AccountSectionHeader title="Идентификаторы" description="Адреса и внешние учётные записи, связанные с аккаунтом." />
      <div className="identifier-toolbar">
        <button
          className="button button--primary"
          type="button"
          onClick={() => {
            onDismissError();
            setDialogOpen(true);
          }}>
          Добавить идентификатор
        </button>
      </div>
      {error && !dialogOpen && (
        <div className="identifier-action-error" role="alert">
          {error}
        </div>
      )}
      <div className="identifier-list">
        {identifiers.map((identifier) => (
          <IdentifierCard
            identifier={identifier}
            key={identifier.id}
            pending={identifier.id === pendingIdentifierId}
            canDelete={identifier.type !== "email" || Boolean(identifier.provider) || localEmails.length > 1}
            onUpdatePreferences={(preferences) => onUpdatePreferences(identifier, preferences)}
            onDelete={() => onDelete(identifier)}
          />
        ))}
        {/* {!identifiers.length && <p className="empty-list">У аккаунта пока нет идентификаторов.</p>} */}
      </div>
      {dialogOpen && <AddIdentifierDialog pending={adding} error={error} onClose={closeDialog} onSubmit={onAdd} />}
    </section>
  );
}
