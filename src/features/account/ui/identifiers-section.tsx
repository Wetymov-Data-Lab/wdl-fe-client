import type { IdentityApi } from "@/shared/api/contracts";
import { AccountSectionHeader } from "@/features/account/ui/account-section-header";
import { IdentifierCard } from "@/features/account/ui/identifier-card";

type IdentifiersSectionProps = { identifiers: IdentityApi.Identifier[] };

export function IdentifiersSection({ identifiers }: IdentifiersSectionProps) {
  return (
    <section className="account-section" id="identifiers">
      <AccountSectionHeader
        eyebrow="Способы входа"
        title="Идентификаторы"
        description="Адреса и внешние учётные записи, связанные с аккаунтом."
      />
      <div className="identifier-list">
        {identifiers.map((identifier) => (
          <IdentifierCard identifier={identifier} key={identifier.id} />
        ))}
        {!identifiers.length && <p className="empty-list">У аккаунта пока нет идентификаторов.</p>}
      </div>
    </section>
  );
}
