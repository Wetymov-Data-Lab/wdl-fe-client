import { SessionsSection } from "@/features/account/components/sessions-section";
import { accountSectionEyebrow } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";

export function SessionsRoute() {
  const { sessions, currentSessionId, renderedAt, sessionActions } = useAccountOutlet();

  return (
    <SessionsSection
      eyebrow={accountSectionEyebrow("sessions")}
      sessions={sessions}
      currentSessionId={currentSessionId}
      pendingSessionId={sessionActions.pendingSessionId}
      renderedAt={renderedAt}
      hasError={sessionActions.hasError}
      onDelete={sessionActions.remove}
    />
  );
}
