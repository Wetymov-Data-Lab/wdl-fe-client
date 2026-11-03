import { IdentifiersSection } from "@/features/account/components/identifiers-section";
import { accountSectionEyebrow } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";

export function SignInRoute() {
  const { account, identifiers } = useAccountOutlet();

  return (
    <IdentifiersSection
      eyebrow={accountSectionEyebrow("sign-in")}
      identifiers={account.identifiers}
      adding={identifiers.adding}
      pendingIdentifierId={identifiers.pendingIdentifierId}
      error={identifiers.error}
      onAdd={identifiers.add}
      onUpdatePreferences={identifiers.updatePreferences}
      onDelete={identifiers.remove}
      onDismissError={identifiers.dismissError}
    />
  );
}
